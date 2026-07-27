/**
 * POST /api/track
 *
 * Дорама/эпизод көрулерін есептейтін endpoint.
 *   1) Zod-пен денені тексереміз
 *   2) IP бойынша rate-limit қолданамыз
 *   3) Prisma арқылы atomic increment жасаймыз
 *
 * Body: { type: "view" | "play", dramaId: string, episodeId?: string }
 *
 * Response: { success, data?: { newTotal }, error? }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const trackSchema = z.object({
  type: z.enum(["view", "play"]),
  dramaId: z.string().min(1).max(100),
  episodeId: z.string().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  // ─── 1. Rate limit: 30 req / minute per IP (қалыпты қолдануға жетеді) ───
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`track:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) {
    return NextResponse.json(
      {
        success: false,
        error: "Тым көп сұрау. Бір минуттан соң қайталаңыз.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  // ─── 2. Body валидация ───
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Дене JSON емес" },
      { status: 400 }
    );
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Жарамсыз сұрау",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { type, dramaId, episodeId } = parsed.data;

  // ─── 3. Драма бар ма тексеру (404-ке жол бермеу) ───
  const drama = await prisma.drama.findUnique({
    where: { id: dramaId },
    select: { id: true, isPublished: true },
  });
  if (!drama) {
    return NextResponse.json(
      { success: false, error: "Дорама табылмады" },
      { status: 404 }
    );
  }
  if (!drama.isPublished) {
    return NextResponse.json(
      { success: false, error: "Дорама жарияланбаған" },
      { status: 403 }
    );
  }

  // ─── 4. Atomic increment ───
  let newTotal: number | null = null;

  if (type === "view") {
    const updated = await prisma.drama.update({
      where: { id: dramaId },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    newTotal = updated.views;
  } else if (type === "play") {
    if (!episodeId) {
      return NextResponse.json(
        { success: false, error: "Эпизод ID міндетті" },
        { status: 400 }
      );
    }
    const updated = await prisma.episode.update({
      where: { id: episodeId },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    newTotal = updated.views;
  }

  return NextResponse.json({
    success: true,
    data: { newTotal },
  });
}
