/**
 * Firebase Storage — сервер жағында файл жүктеу/жою.
 *
 * Vercel-де локалды файлдық жүйе жұмыс істемейді (read-only),
 * сондықтан барлық upload-тар осы модуль арқылы Firebase Storage-қа
 * бағытталады.
 *
 * Firebase Admin SDK қолданылады (service account арқылы) — бұл
 * тікелей server-to-server байланыс, қауіпсіз және CORS-пен ауырмайды.
 *
 * Қолдану:
 *   import { uploadFile, deleteFile } from "@/lib/firebase-storage";
 *
 *   const result = await uploadFile(file, "posters");
 *   // → { url: "https://firebasestorage.googleapis.com/...", filename, size, mimeType }
 *
 * Құрылым: gs://<bucket>/<subdir>/<timestamp>-<random>.<ext>
 *   Мысалы: gs://mansurdrama.appspot.com/posters/1700000000-abc123.jpg
 */

import { getStorage } from "firebase-admin/storage";
import { randomBytes } from "crypto";
import { getApp, isFirebaseAdminConfigured } from "./firebase-admin";

// =====================================================
// Конфигурация
// =====================================================

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

const SUBDIR_PREFIX: Record<UploadSubdir, string> = {
  posters: "posters",
  videos: "videos",
  avatars: "avatars",
  "payment-receipts": "payment-receipts",
};

// =====================================================
// Көмекші функциялар
// =====================================================

/** Firebase Storage конфигурацияланған ба (Admin SDK) */
export function isFirebaseStorageConfigured(): boolean {
  return isFirebaseAdminConfigured();
}

/**
 * Storage bucket-ті анықтау. Бірнеше көзден іздейді:
 *   1. FIREBASE_STORAGE_BUCKET (тұрақты — ұсынылады)
 *   2. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (client-пен бөлісуге ыңғайлы)
 *   3. <projectId>.appspot.com (әдепкі)
 */
function resolveBucket(): string {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET;
  if (explicit) return explicit;
  const pub = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (pub) return pub;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "Firebase Storage bucket-ті анықтау мүмкін емес. FIREBASE_STORAGE_BUCKET немесе NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET орнатыңыз."
    );
  }
  return `${projectId}.appspot.com`;
}

function getBucket() {
  // getApp() — firebase-admin.ts-тен; егер конфигурацияланбаса, қате лақтырады.
  return getStorage(getApp()).bucket(resolveBucket());
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

// =====================================================
// Негізгі API
// =====================================================

export interface SavedFile {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

/**
 * Файлды Firebase Storage-қа жүктеу.
 *
 * @param file  FormData-дан келген File нысаны
 * @param subdir  Қалта: "posters" | "videos" | "avatars"
 * @returns  Public URL (token-сыз — read-all ережесі керек)
 */
export async function uploadFile(
  file: File,
  subdir: UploadSubdir
): Promise<SavedFile> {
  if (!isFirebaseStorageConfigured()) {
    throw new Error(
      "Firebase Storage конфигурацияланбаған. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY орнатыңыз."
    );
  }

  validateFile(file, subdir);

  const ext = sanitizeExt(file.name, subdir === "videos" ? ".mp4" : ".jpg");
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const objectPath = `${SUBDIR_PREFIX[subdir]}/${filename}`;

  const bucket = getBucket();
  const file_ref = bucket.file(objectPath);

  // Буферге түрлендіру + жүктеу
  const buffer = Buffer.from(await file.arrayBuffer());

  await file_ref.save(buffer, {
    contentType: file.type,
    metadata: {
      // Cache-Control — 1 жылға (filename бірегей, immutable)
      cacheControl: "public, max-age=31536000, immutable",
      metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
      },
    },
    resumable: false, // Кіші файлдар үшін resumable = false жылдамырақ
  });

  // Public URL — read-all ережесі арқылы
  // Егер read-all қойылмаса, signed URL қолдануға болады (төменде)
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;

  return {
    filename,
    url: publicUrl,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Файлды Firebase Storage-тан жою.
 *
 * @param url  Жою керек файлдың толық URL-ы
 * @returns true — сәтті, false — табылмады
 */
export async function deleteFile(url: string): Promise<boolean> {
  if (!isFirebaseStorageConfigured()) return false;
  if (!url) return false;

  try {
    const bucket = getBucket();
    // URL-дан object path-ты шығару
    const objectPath = extractObjectPath(url, bucket.name);
    if (!objectPath) return false;
    await bucket.file(objectPath).delete({ ignoreNotFound: true });
    return true;
  } catch (err) {
    console.error("[firebase-storage] deleteFile failed:", err);
    return false;
  }
}

/**
 * URL-дан storage object path-ты шығару.
 * Мысалы:
 *   "https://storage.googleapis.com/bucket.appspot.com/posters/abc.jpg"
 *   → "posters/abc.jpg"
 */
function extractObjectPath(url: string, bucketName: string): string | null {
  try {
    const u = new URL(url);
    // Path: /bucket-name/object-path
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === bucketName) {
      return parts.slice(1).join("/");
    }
    // Signed URL немесе басқа формат — соңғы сегменттерді аламыз
    return parts.length > 0 ? parts.join("/") : null;
  } catch {
    return null;
  }
}

/**
 * Уақытша signed URL жасау (егер public read қосылмаса).
 * Әдепкіде 1 сағатқа жарамды.
 */
export async function getSignedUrl(
  url: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (!isFirebaseStorageConfigured() || !url) return null;
  try {
    const bucket = getBucket();
    const objectPath = extractObjectPath(url, bucket.name);
    if (!objectPath) return null;
    const [signed] = await bucket.file(objectPath).getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return signed;
  } catch (err) {
    console.error("[firebase-storage] getSignedUrl failed:", err);
    return null;
  }
}
