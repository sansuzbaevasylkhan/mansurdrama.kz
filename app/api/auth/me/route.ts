import { NextRequest, NextResponse } from "next/server";
import { getSession, verifySessionToken } from "@/lib/auth";

/**
 * GET /api/auth/me
 *
 * Ағымдағы сессия туралы ақпарат қайтарады.
 *
 * Екі тәсілмен тексереді:
 *  1) Bearer token (мобиль қосымша үшін)
 *  2) Cookie (веб-админ үшін)
 *
 * Қайтарады: { user: SessionPayload | null }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1) Bearer header (мобиль)
  const auth = request.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const session = await verifySessionToken(token);
    if (session) {
      return NextResponse.json({ user: session });
    }
  }

  // 2) Cookie (веб-админ)
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}
