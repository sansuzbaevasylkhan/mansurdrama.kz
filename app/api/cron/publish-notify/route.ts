import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';
import { notifyUser } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  // Verify CRON_SECRET
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Find episodes that should be published and notified
    const episodesToNotify = await prisma.episode.findMany({
      where: {
        publishAt: { lte: now },
        notifiedAt: null,
      },
      include: {
        drama: true,
      },
    });

    if (episodesToNotify.length === 0) {
      return NextResponse.json({ message: 'No episodes to notify' });
    }

    let notificationCount = 0;

    for (const episode of episodesToNotify) {
      // 2. Find users who should receive a notification:
      // - Those who have the drama as Favorite
      // - Those who have existing watch progress for this drama
      const targetUsers = await prisma.user.findMany({
        where: {
          OR: [
            { favorites: { some: { dramaId: episode.dramaId } } },
            { watchProgress: { some: { dramaId: episode.dramaId } } },
          ],
        },
        select: { id: true, name: true },
      });

      // 3. Send notifications to these users
      for (const user of targetUsers) {
        // notifyUser internally checks NotificationSetting.newEpisodes
        await notifyUser(user.id, {
          title: 'Жаңа серия шықты!',
          body: `${episode.drama.title}: ${episode.episodeNumber}-бөлім жарияланды!`,
          data: {
            type: 'episode',
            dramaId: episode.dramaId,
            episodeId: episode.id
          },
        }, 'newEpisodes');
        notificationCount++;
      }

      // 4. Mark episode as notified
      await prisma.episode.update({
        where: { id: episode.id },
        data: { notifiedAt: now },
      });
    }

    return NextResponse.json({
      success: true,
      episodesProcessed: episodesToNotify.length,
      notificationsSent: notificationCount
    });
  } catch (err) {
    console.error('CRON publish-notify error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
