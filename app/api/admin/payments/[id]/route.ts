import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-guards';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  action: z.enum(['approve', 'reject']),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
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
      return NextResponse.json({ error: 'Төлем табылмады' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ ok: true, alreadyHandled: true });
    }

    if (parsed.data.action === 'reject') {
      await prisma.payment.update({ where: { id }, data: { status: 'REJECTED' } });
      return NextResponse.json({ ok: true });
    }

    // approve
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id }, data: { status: 'APPROVED' } });

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PATCH admin payments error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

