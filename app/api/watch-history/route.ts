import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, getSessionFromToken } from '@/lib/auth';
import { upsertWatchHistory, getContinueWatching } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/push';

/**
 * Watch history — тек логин болған қолданушыларға қолжетімді (мобиль/веб).
 * Гость (логинсіз) қолданушы үшін прогресс сақталмайды, "жалғастыру" болмайды.
 */
async function resolveUserId(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const session = await getSessionFromToken(auth.slice(7));
    return session?.userId ?? null;
  }
  const session = await getSession();
  return session?.userId ?? null;
}

const bodySchema = z.object({
  episodeId: z.string().min(1),
  dramaId: z.string().min(1),
  positionSeconds: z.coerce.number().int().min(0),
  durationSeconds: z.coerce.number().int().min(0).default(0),
});

/**
 * POST /api/watch-history
 * Body: { episodeId, dramaId, positionSeconds, durationSeconds }
 * Ойнату барысында мезгіл-мезгіл шақырылады (мысалы, әр 10 секунд сайын).
 */
export async function POST(request: NextRequest) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Кіру қажет' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Жарамсыз сұраныс' }, { status: 400 });
  }

  try {
    const row = await upsertWatchHistory({ userId, ...parsed.data });

    // Trigger "Free Episodes Ended" notification
    // Logic: episode 10, > 90% completed, not yet notified, promos enabled
    if (parsed.data.episodeId) {
      const episode = await prisma.episode.findUnique({
        where: { id: parsed.data.episodeId },
        select: { episodeNumber: true, dramaId: true },
      });

      if (episode && episode.episodeNumber === 10) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { freeEndedNotifiedAt: true },
        });

        const settings = await prisma.notificationSetting.findUnique({
          where: { userId },
          select: { promos: true },
        });

        const isNearlyCompleted = parsed.data.durationSeconds > 0 &&
          (parsed.data.positionSeconds / parsed.data.durationSeconds) >= 0.9;

        if (
          isNearlyCompleted &&
          !user?.freeEndedNotifiedAt &&
          settings?.promos !== false
        ) {
          await notifyUser(userId, {
            title: 'Тегін эпизодтар аяқталды!',
            body: '24 сағат ішінде жеңілдікпен ашыңыз',
            data: { type: 'promo', trigger: 'free_ended' },
          }, 'PROMOS');

          await prisma.user.update({
            where: { id: userId },
            data: { freeEndedNotifiedAt: new Date() },
          });
        }
      }
    }

    return NextResponse.json(row);
  } catch (err) {
    console.error('POST /api/watch-history error:', err);
    return NextResponse.json({ error: 'Сақтау мүмкін болмады' }, { status: 500 });
  }
}

/**
 * GET /api/watch-history
 * "Жалғастырып көру" тізімі — драма бойынша ең соңғы қаралған бөлім.
 */
export async function GET(request: NextRequest) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Сіз тіркелмегенсіз. Тарихты көру үшін тіркеліңіз.' }, { status: 401 });
  }

  const items = await getContinueWatching(userId);
  return NextResponse.json({ items });
}
