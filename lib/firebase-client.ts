/**
 * Firebase Client SDK — браузерде ғана қолданылады.
 *
 * NEXT_PUBLIC_FIREBASE_* env-тен конфиг алады. SSR-да қате болмауы үшін
 * `typeof window` тексереміз. HMR-да бір дана сақталады.
 *
 * Қауіпсіздік: apiKey, databaseURL public болса да, RTDB-ге тек сервер жазады
 * (Admin SDK), ал клиент тек тыңдайды (onValue). RTDB Rules-те
 * `.write: false` қою керек (Firebase Console-дан).
 *
 * Қолдану (тек "use client" компоненттерде):
 *   import { db } from "@/lib/firebase-client";
 *   const ref = ref(db, "views/dramas/abc");
 *   onValue(ref, snap => setViews(snap.val() ?? 0));
 */

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const globalForClient = globalThis as unknown as {
  firebaseClientApp?: FirebaseApp;
  firebaseClientDb?: Database;
};

function readConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function isFirebaseClientConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.apiKey && c.databaseURL);
}

/** Браузерде қауіпсіз — серверде шақырса, null қайтарады */
export function getClientDb(): Database | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseClientConfigured()) return null;
  if (globalForClient.firebaseClientDb) return globalForClient.firebaseClientDb;

  const app = getAppsClient();
  const db = getDatabase(app);
  globalForClient.firebaseClientDb = db;
  return db;
}

function getAppsClient(): FirebaseApp {
  if (globalForClient.firebaseClientApp) return globalForClient.firebaseClientApp;
  const existing = getApps();
  if (existing.length > 0) {
    const app = getApp();
    globalForClient.firebaseClientApp = app;
    return app;
  }
  const app = initializeApp(readConfig() as Record<string, string>);
  globalForClient.firebaseClientApp = app;
  return app;
}

/** Қолайлы экспорт — null болуы мүмкін, сондықтан components-те тексеріңіз */
export const db: Database | null = getClientDb();
