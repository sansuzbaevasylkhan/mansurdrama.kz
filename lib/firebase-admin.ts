/**
 * Firebase Admin SDK — серверде ғана қолданылады.
 *
 * Prisma-ның singleton үлгісін қайталайды (src/lib/prisma.ts:1-15):
 * HMR кезінде globalThis арқылы бір дананы сақтайды.
 *
 * Қауіпсіздік: service account кілттері ешқашан NEXT_PUBLIC_* болмауы керек.
 *
 * Қолдану:
 *   import { adminDb } from "@/lib/firebase-admin";
 *   const snap = await adminDb.ref("views/dramas/abc").get();
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";

const globalForAdmin = globalThis as unknown as {
  firebaseAdminApp?: App;
  firebaseAdminDb?: Database;
};

function readPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  // .env-тегі \n escape-терін нақты жаңа жолға ауыстыру
  return key.replace(/\\n/g, "\n");
}

function isConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

function getApp(): App {
  if (globalForAdmin.firebaseAdminApp) return globalForAdmin.firebaseAdminApp;
  if (getApps().length > 0) {
    const existing = getApps()[0]!;
    globalForAdmin.firebaseAdminApp = existing;
    return existing;
  }

  if (!isConfigured()) {
    throw new Error(
      "Firebase Admin SDK конфигурацияланбаған. .env файлында FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY болуы керек. Толтыру нұсқаулығы: README.md"
    );
  }

  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: readPrivateKey()!,
    }),
    databaseURL:
      process.env.FIREBASE_DATABASE_URL ||
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });

  globalForAdmin.firebaseAdminApp = app;
  return app;
}

/** Firebase Admin App данасын қайтарады (lazy init). firebase-storage осыны қолданады. */
export { getApp };

/**
 * RTDB данасы. Қолданба конфигурацияланбаса, `getDbOrNull` қолданыңыз.
 */
export const adminDb: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const db = getDb();
    // @ts-expect-error — динамикалық proxy, түрлері RTDB-мен сәйкес
    return db[prop];
  },
});

/**
 * Конфигурация бар болса RTDB-ні қайтарады, жоқ болса null.
 * API route-тарда қате өңдеу үшін қолайлы — track endpoint-і осыны қолданады.
 */
export function getDbOrNull(): Database | null {
  if (!isConfigured()) return null;
  try {
    return getDb();
  } catch {
    return null;
  }
}

function getDb(): Database {
  if (globalForAdmin.firebaseAdminDb) return globalForAdmin.firebaseAdminDb;
  const db = getDatabase(getApp());
  globalForAdmin.firebaseAdminDb = db;
  return db;
}

/** Конфигурация жарамды ма (код жұмыс істейтін-істемейтінін тексеру) */
export const isFirebaseAdminConfigured = isConfigured;
