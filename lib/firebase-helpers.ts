/**
 * Firebase Realtime Database көмекші функциялар.
 *
 * Барлық RTDB жолдары (paths) ОСЫНДА тұрақтандырылған — кодта жол жазбаңыз.
 * Бұл файл — сервер мен клиент арасындағы келісім шарт.
 *
 * Сервер жағы (Admin SDK) — incrementView, incrementEpisodePlay
 * Клиент жағы (Client SDK) — subscribeToDramaViews, subscribeToSiteStats
 */

import { getDbOrNull } from "./firebase-admin";
import { getClientDb } from "./firebase-client";

// Локалды анықтама — Firebase RTDB-дағы пайдаланушы әрекетінің форматы.
export interface UserEvent {
  pushId?: string;
  type: "view" | "play" | "signup" | "login";
  userId?: string;
  dramaId?: string;
  episodeId?: string;
  timestamp: number;
}

// =====================================================
// RTDB Paths (деректер құрылымы)
// =====================================================
// Бұл константаларды өзгертсеңіз, Firebase Console-дағы
// RTDB Rules-те де сәйкесінше жаңартыңыз.
//
//   /views/dramas/{dramaId}: number
//   /plays/episodes/{dramaId}/{episodeId}: number
//   /stats/total: { dramas, episodes, users, views, lastUpdated }
//   /recent/{pushId}: UserEvent
// =====================================================

export const RTDB_PATHS = {
  dramaViews: (dramaId: string) => `views/dramas/${dramaId}`,
  episodePlays: (dramaId: string, episodeId: string) =>
    `plays/episodes/${dramaId}/${episodeId}`,
  totalStats: "stats/total",
  recentEvents: "recent",
} as const;

// =====================================================
// Сервер жағы (Admin SDK) — жазу операциялары
// =====================================================

/**
 * Драманың жалпы көрулерін +1-ге арттыру. Atomic transaction
 * қолданады — бір уақытта көп сұрау болса да, деректер дұрыс қалады.
 *
 * @returns жаңа мән немесе null (Firebase конфигурацияланбаған болса)
 */
export async function incrementDramaView(dramaId: string): Promise<number | null> {
  const db = getDbOrNull();
  if (!db) return null;

  const ref = db.ref(RTDB_PATHS.dramaViews(dramaId));
  try {
    const result = await ref.transaction((current) => (current || 0) + 1);
    return result.snapshot.val() as number;
  } catch (err) {
    console.error("[firebase] incrementDramaView failed:", err);
    return null;
  }
}

/** Эпизодтың ойнатуын +1-ге арттыру */
export async function incrementEpisodePlay(
  dramaId: string,
  episodeId: string
): Promise<number | null> {
  const db = getDbOrNull();
  if (!db) return null;

  const ref = db.ref(RTDB_PATHS.episodePlays(dramaId, episodeId));
  try {
    const result = await ref.transaction((current) => (current || 0) + 1);
    return result.snapshot.val() as number;
  } catch (err) {
    console.error("[firebase] incrementEpisodePlay failed:", err);
    return null;
  }
}

/** Жалпы сайт статистикасын жазу (админ CRUD-тан кейін) */
export async function setSiteStats(stats: {
  dramas: number;
  episodes: number;
  users: number;
  views: number;
}): Promise<void> {
  const db = getDbOrNull();
  if (!db) return;

  try {
    await db.ref(RTDB_PATHS.totalStats).set({
      ...stats,
      lastUpdated: Date.now(),
    });
  } catch (err) {
    console.error("[firebase] setSiteStats failed:", err);
  }
}

/** Қолданушы әрекетін логқа қосу (push арқылы — auto-id) */
export async function pushRecentEvent(event: Omit<UserEvent, "pushId">): Promise<void> {
  const db = getDbOrNull();
  if (!db) return;

  try {
    // Соңғы 100 жазбаны ғана сақтау (cleanup қажет болса, өзгертуге болады)
    await db.ref(RTDB_PATHS.recentEvents).push(event);
  } catch (err) {
    console.error("[firebase] pushRecentEvent failed:", err);
  }
}

// =====================================================
// Клиент жағы (Client SDK) — real-time тыңдау
// =====================================================

/**
 * Драманың live көрулерін тыңдау. cleanup функциясын қайтарады —
 * useEffect-те міндетті түрде шақырыңыз.
 *
 * @example
 *   useEffect(() => {
 *     const off = subscribeToDramaViews(id, setViews);
 *     return off;
 *   }, [id]);
 */
export function subscribeToDramaViews(
  dramaId: string,
  onViews: (views: number) => void
): () => void {
  const db = getClientDb();
  if (!db) {
    // Firebase жоқ болса — no-op cleanup
    return () => {};
  }

  // Динамикалық импорт — client-те ғана жүктеледі
  // (бұл функция "use client" файлдардан шақырылады, бірақ SSR-да
  //  getClientDb() null қайтарады, сондықтан модуль жүктелмейді)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref, onValue } = require("firebase/database") as typeof import("firebase/database");

  const r = ref(db, RTDB_PATHS.dramaViews(dramaId));
  const unsub = onValue(
    r,
    (snap: { val: () => unknown }) => {
      const v = snap.val();
      onViews(typeof v === "number" ? v : 0);
    },
    (err: unknown) => {
      console.warn("[firebase] subscribeToDramaViews error:", err);
    }
  );
  return unsub;
}

/** Жалпы сайт статистикасын real-time тыңдау */
export function subscribeToSiteStats(
  onStats: (stats: {
    dramas: number;
    episodes: number;
    users: number;
    views: number;
  } | null) => void
): () => void {
  const db = getClientDb();
  if (!db) return () => {};

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref, onValue } = require("firebase/database") as typeof import("firebase/database");

  const r = ref(db, RTDB_PATHS.totalStats);
  const unsub = onValue(
    r,
    (snap: { val: () => unknown }) => {
      onStats((snap.val() ?? null) as {
        dramas: number;
        episodes: number;
        users: number;
        views: number;
      } | null);
    },
    (err: unknown) => {
      console.warn("[firebase] subscribeToSiteStats error:", err);
    }
  );
  return unsub;
}
