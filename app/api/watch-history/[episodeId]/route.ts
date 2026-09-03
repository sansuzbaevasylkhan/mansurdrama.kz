import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSessionFromToken } from '@/lib/auth';
import { getWatchProgress } from '@/lib/db';

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const session = await getSessionFromToken(auth.slice(7));
    return session?.userId ?? null;
  }
  const session = await getSession();
  return session?.userId ?? null;
}

/**
 * GET /api/watch-history/[episodeId]
 * Бөлімді ашқанда — сол қолданушы қай жерден тоқтағанын алу үшін (resume).
 * Логин болмаса — { progress: null } (жалғастыру жоқ).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> },
) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ progress: null });
  }
  const { episodeId } = await params;
  const progress = await getWatchProgress(userId, episodeId);
  return NextResponse.json({ progress });
}
