import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-guards';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/notifications';

const bodySchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(), // Бас тарту себебі үшін
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Жарамсыз деректер', details: parsed.error.flatten() }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Төлем табылмады', status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ ok: true, alreadyHandled: true });
    }

    // we can get the admin user from the guard or a separate call
    // for now, use a placeholder or check the current admin user
    const adminId = 'ADMIN';

    if (parsed.data.action === 'reject') {
      const reason = parsed.data.reason;
      if (!reason || reason.trim().length === 0) {
        return NextResponse.json({ error: 'Бас тарту себебі міндетті' }, { status: 400 });
      }

      await prisma.payment.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectReason: reason,
          reviewedAt: new Date(),
          reviewedBy: adminId,
        }
      });

      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: 'Төлем қабылданбады',
          body: `Сіздің төлеміңіз қабылданбады. Себебі: ${reason}`,
          type: 'PAYMENT',
        }
      });

      await sendPushNotification(
        payment.userId,
        'Төлем қабылданбады',
        `Сіздің төлеміңіз қабылданбады. Себебі: ${reason}`,
        { type: 'PAYMENT_REJECTED', paymentId: id }
      );

      return NextResponse.json({ ok: true });
    }

    // approve
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: adminId,
        }
      });

      if (payment.type === 'SINGLE_EPISODE') {
        if (payment.episodeNumber == null) {
          throw new Error('SINGLE_EPISODE үшін episodeNumber жоқ');
        }
        const episodeNumber: number = payment.episodeNumber;
        await tx.unlockedContent.upsert({
          where: {
            userId_dramaId_episodeNumber: {
              userId: payment.userId,
              dramaId: payment.dramaId,
              episodeNumber,
            },
          },
          create: {
            userId: payment.userId,
            dramaId: payment.dramaId,
            episodeNumber,
          },
          update: {},
        });
      } else {
        // FULL_PACKAGE — дораманың барлық эпизодтарын ашамыз
        const episodes = await tx.episode.findMany({
          where: { dramaId: payment.dramaId },
          select: { episodeNumber: true },
        });
        for (const ep of episodes) {
          await tx.unlockedContent.upsert({
            where: {
              userId_dramaId_episodeNumber: {
                userId: payment.userId,
                dramaId: payment.dramaId,
                episodeNumber: ep.episodeNumber,
              },
            },
            create: {
              userId: payment.userId,
              dramaId: payment.dramaId,
              episodeNumber: ep.episodeNumber,
            },
            update: {},
          });
        }
      }
    });

    // Notify User about approval
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: 'Төлем мақұлданды',
        body: 'Сіздің төлеміңіз сәтті расталды. Енді контентті көре аласыз!',
        type: 'PAYMENT',
      }
    });

    await sendPushNotification(
      payment.userId,
      'Төлем мақұлданды ✅',
      'Сіздің төлеміңіз сәтті расталды. Енді контентті көре аласыз!',
      { type: 'PAYMENT_APPROVED', paymentId: id }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PATCH admin payments error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
