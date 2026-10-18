import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';
import { notifyUser } from '@/lib/push';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = actionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Жарамсыз деректер' }, { status: 400 });
    }

    const { action, reason } = validation.data;

    if (action === 'reject' && !reason) {
      return NextResponse.json({ error: 'Болдырмау себебін көрсету міндетті' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        drama: { select: { id: true } },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Төлем табылмады' }, { status: 404 });
    }

    if (action === 'approve') {
      // Unlock content for the user
      await prisma.unlockedContent.upsert({
        where: {
          userId_dramaId_episodeNumber: {
            userId: payment.userId,
            dramaId: payment.dramaId,
            episodeNumber: payment.episodeNumber as number, // Cast to number for Prisma unique constraint
          },
        },
        update: {},
        create: {
          userId: payment.userId,
          dramaId: payment.dramaId,
          episodeNumber: payment.episodeNumber,
        },
      });

      // Notify user of approval
      await notifyUser(payment.userId, {
        title: 'Төлем расталды',
        body: 'Төлемің расталды, эпизод ашылды',
        data: { type: 'payment', status: 'APPROVED' }
      }, 'PAYMENTS');
    }

    await prisma.payment.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        rejectReason: action === 'reject' ? reason : null,
        reviewedBy: session.userId,
        reviewedAt: new Date(),
      },
    });

    if (action === 'reject') {
      // Notify user of rejection
      await notifyUser(payment.userId, {
        title: 'Төлем қабылданбады',
        body: `Төлем қабылданбады: ${reason}`,
        data: { type: 'payment', status: 'REJECTED' }
      }, 'PAYMENTS');
    }

    return NextResponse.json({ ok: true, message: `Payment ${action === 'approve' ? 'approved' : 'rejected'}` });
  } catch (err) {
    console.error('PATCH /api/admin/payments/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
