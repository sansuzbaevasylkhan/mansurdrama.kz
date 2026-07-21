/**
 * Файл жүктеу — Firebase Storage (продакшн) + локалды диск (dev fallback).
 *
 * Стратегия:
 *   1) Егер Firebase Storage конфигурацияланған → Firebase Storage
 *   2) Әйтпесе, локалды режим (Vercel емес) → public/uploads/...
 *
 * Vercel-де локалды жазу жұмыс істемейді (read-only), сондықтан
 * Firebase Storage-сыз деплой қате береді. Бұл — қажеттілік.
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { uploadFile as uploadToFirebase, isFirebaseStorageConfigured } from "./firebase-storage";

export type UploadSubdir = "posters" | "videos" | "avatars" | "payment-receipts";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export interface SavedFile {
  filename: string;
  url: string;
  size: number;
  mimeType?: string;
}

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

// =====================================================
// Көмекші функциялар
// =====================================================

function isVercel(): boolean {
  return process.env.VERCEL === "1";
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
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
// Локалды fallback (dev only)
// =====================================================

async function ensureUploadDir(subdir: UploadSubdir) {
  const dir = join(UPLOAD_DIR, subdir);
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // ignore — exists
  }
  return dir;
}

async function saveToLocalDisk(
  file: File,
  subdir: UploadSubdir
): Promise<SavedFile> {
  const dir = await ensureUploadDir(subdir);
  const ext = sanitizeExt(file.name, subdir === "videos" ? ".mp4" : ".jpg");
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const filepath = join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return {
    filename,
    url: `/uploads/${subdir}/${filename}`,
    size: file.size,
    mimeType: file.type,
  };
}

// =====================================================
// Негізгі API
// =====================================================

/**
 * Файлды жүктеу — провайдерді автоматты таңдау.
 *
 * @param file  FormData-дан келген File нысаны
 * @param subdir  Қалта: "posters" | "videos" | "avatars"
 */
export async function saveUploadedFile(
  file: File,
  subdir: UploadSubdir
): Promise<SavedFile> {
  validateFile(file, subdir);

  // Продакшнда немесе Firebase конфигурацияланған болса — Firebase Storage
  if (isFirebaseStorageConfigured() && (isProduction() || isVercel())) {
    return uploadToFirebase(file, subdir);
  }

  // Локалды dev — дискке жазу
  if (isVercel()) {
    throw new Error(
      "Vercel-де локалды файлдық жүйе жұмыс істемейді. " +
      "Firebase Storage конфигурациясын қосыңыз (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)."
    );
  }

  return saveToLocalDisk(file, subdir);
}

/**
 * Файлды жою — Firebase-тен немесе локалды дисктен.
 */
export async function deleteUploadedFile(url: string): Promise<boolean> {
  if (!url) return false;

  // Firebase URL-ы — Firebase-тен жою
  if (url.includes("storage.googleapis.com") || url.includes("firebasestorage.googleapis.com")) {
    const { deleteFile: deleteFromFirebase } = await import("./firebase-storage");
    return deleteFromFirebase(url);
  }

  // Локалды URL — дисктен жою (Vercel-де skip)
  if (isVercel() || isProduction()) return false;
  try {
    const { unlink } = await import("fs/promises");
    const filename = url.split("/").pop();
    if (!filename || filename.includes("..")) return false;
    const filepath = join(UPLOAD_DIR, url.split("/uploads/")[1] || "");
    await unlink(filepath);
    return true;
  } catch {
    return false;
  }
}

// =====================================================
// Көмекші экспорттар
// =====================================================

export function isImage(file: File): boolean {
  return file.type.startsWith("image/");
}

export function isVideo(file: File): boolean {
  return file.type.startsWith("video/");
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export { isFirebaseStorageConfigured };
