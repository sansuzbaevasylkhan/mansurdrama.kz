import { NextRequest, NextResponse } from "next/server";
import { getSession, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me
 *
 * Ағымдағы сессия туралы ақпарат қайтарады.
 *
 * Екі тәсілмен тексереді:
 *  1) Bearer token (мобиль қосымша үшін)
 *  2) Cookie (веб-админ үшін)
 *
 * JWT қолтаңбасы дұрыс болса да, қолданушы admin панелінен
 * өшірілген болуы мүмкін — сондықтан дерекқордан да тексереміз.
 * Табылмаса, сессия жарамсыз деп есептеледі (auto-logout).
 *
 * Қайтарады: { user: SessionPayload | null }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function userStillExists(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  return Boolean(user);
}

export async function GET(request: NextRequest) {
  // 1) Bearer header (мобиль)
  const auth = request.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const session = await verifySessionToken(token);
    if (session && (await userStillExists(session.userId))) {
      return NextResponse.json({ user: session });
    }
    return NextResponse.json({ user: null });
  }

  // 2) Cookie (веб-админ)
  const session = await getSession();
  if (!session || !(await userStillExists(session.userId))) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}
