/**
 * Supabase Storage — сервер жағында файл жүктеу/жою.
 *
 * Vercel-де локалды файлдық жүйе жұмыс істемейді (read-only), сондықтан
 * барлық upload-тар осы модуль арқылы Supabase Storage-қа бағытталады.
 *
 * Service role кілті арқылы тікелей server-to-server байланыс —
 * қауіпсіз, CORS-пен ауырмайды, RLS-ті аттап өтеді.
 *
 * Қолдану:
 *   import { uploadFile, deleteFile } from "@/lib/supabase-storage";
 *
 *   const result = await uploadFile(file, "posters");
 *   // → { url: "https://<ref>.supabase.co/storage/v1/object/public/uploads/...", filename, size, mimeType }
 *
 * Bucket құрылымы: <bucket>/<subdir>/<timestamp>-<random>.<ext>
 */

import { randomBytes } from "crypto";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabase-admin";

export type UploadSubdir = "posters" | "videos" | "avatars" | "payment-receipts";

const ALLOWED_IMAGE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const ALLOWED_VIDEO = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
]);

export const MAX_POSTER_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1 GB

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

/** Supabase Storage конфигурацияланған ба (Admin client) */
export function isSupabaseStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

function sanitizeExt(name: string, fallback: string): string {
  const ix = name.lastIndexOf(".");
  const ext = ix >= 0 ? name.slice(ix).toLowerCase() : fallback;
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : fallback;
}

function validateFile(file: File, subdir: UploadSubdir): void {
  if (!file || file.size === 0) {
    throw new Error("Файл жіберілмеді");
  }
  if (subdir === "posters" && file.size > MAX_POSTER_SIZE) {
    throw new Error(`Постер ${MAX_POSTER_SIZE / 1024 / 1024}MB-тан үлкен болмауы керек`);
  }
  if (subdir === "avatars" && file.size > MAX_AVATAR_SIZE) {
    throw new Error(`Аватар ${MAX_AVATAR_SIZE / 1024 / 1024}MB-тан үлкен болмауы керек`);
  }
  if (subdir === "videos" && file.size > MAX_VIDEO_SIZE) {
    throw new Error(`Видео ${MAX_VIDEO_SIZE / 1024 / 1024 / 1024}GB-тан үлкен болмауы керек`);
  }
  if (subdir === "posters" && !ALLOWED_IMAGE.has(file.type)) {
    throw new Error(`Қолдау көрсетілмейтін формат: ${file.type}`);
  }
  if (subdir === "avatars" && !ALLOWED_IMAGE.has(file.type)) {
    throw new Error(`Қолдау көрсетілмейтін формат: ${file.type}`);
  }
  if (subdir === "videos" && !ALLOWED_VIDEO.has(file.type)) {
    throw new Error(`Қолдау көрсетілмейтін формат: ${file.type}`);
  }
}

export interface SavedFile {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

/**
 * Файлды Supabase Storage-қа жүктеу.
 *
 * @param file  FormData-дан келген File нысаны
 * @param subdir  Қалта: "posters" | "videos" | "avatars" | "payment-receipts"
 */
export async function uploadFile(file: File, subdir: UploadSubdir): Promise<SavedFile> {
  if (!isSupabaseStorageConfigured()) {
    throw new Error(
      "Supabase Storage конфигурацияланбаған. SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY орнатыңыз."
    );
  }

  validateFile(file, subdir);

  const ext = sanitizeExt(file.name, subdir === "videos" ? ".mp4" : ".jpg");
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const objectPath = `${subdir}/${filename}`;

  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    cacheControl: "31536000", // 1 жыл (filename бірегей, immutable)
    upsert: false,
  });

  if (error) {
    throw new Error(`Supabase Storage жүктеу қатесі: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

  return {
    filename,
    url: data.publicUrl,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Файлды Supabase Storage-тан жою.
 *
 * @param url  Жою керек файлдың толық public URL-ы
 * @returns true — сәтті, false — табылмады
 */
export async function deleteFile(url: string): Promise<boolean> {
  if (!isSupabaseStorageConfigured() || !url) return false;

  try {
    const objectPath = extractObjectPath(url);
    if (!objectPath) return false;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(BUCKET).remove([objectPath]);
    if (error) {
      console.error("[supabase-storage] deleteFile failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[supabase-storage] deleteFile failed:", err);
    return false;
  }
}

/**
 * Public URL-дан storage object path-ты шығару.
 * Мысалы:
 *   "https://<ref>.supabase.co/storage/v1/object/public/uploads/posters/abc.jpg"
 *   → "posters/abc.jpg"
 */
function extractObjectPath(url: string): string | null {
  try {
    const marker = `/object/public/${BUCKET}/`;
    const ix = url.indexOf(marker);
    if (ix === -1) return null;
    return decodeURIComponent(url.slice(ix + marker.length));
  } catch {
    return null;
  }
}

export { BUCKET as SUPABASE_STORAGE_BUCKET };
