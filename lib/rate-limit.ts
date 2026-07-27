/**
 * Қарапайым in-memory rate limiter.
 *
 * API route-тарда қорғаныс үшін қолданылады (әсіресе `/api/track`).
 * Өндірісте Redis-ке (Upstash) ауыстыруға дайын — интерфейс сақталады.
 *
 * Пайдалану:
 *   const ok = rateLimit(`track:${ip}`, 10, 60_000); // 10 req / minute
 *   if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // unix ms
}

const store = new Map<string, RateLimitEntry>();

// Әр 5 минут сайын ескі жазбаларды тазалау (memory leak-тен қорғайды)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitOptions {
  /** Уақыт аралығы (ms) */
  windowMs: number;
  /** Осы терезеде рұқсат етілген ең көп сұрау саны */
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Кілт бойынша rate-limit тексеру.
 *
 * @param key Бірегей кілт (мыс. `track:${ip}`)
 * @param opts { windowMs, max } — уақыт терезесі мен лимит
 * @returns { ok, remaining, resetAt }
 */
export function rateLimit(
  key: string,
  opts: { windowMs: number; max: number } | number,
  maybeMax?: number
): RateLimitResult {
  // Қолайлы қолдану: rateLimit(key, 60_000, 10) — windowMs, max
  const windowMs = typeof opts === "number" ? opts : opts.windowMs;
  const max = typeof opts === "number" ? (maybeMax ?? 10) : opts.max;

  const now = Date.now();
  cleanup(now);

  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { ok: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

/** NextRequest-тен клиент IP-сын алу (x-forwarded-for → x-real-ip → "anonymous") */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}
