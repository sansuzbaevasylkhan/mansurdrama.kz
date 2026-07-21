import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const payments = await prisma.payment.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, name: true } },
      drama: { select: { id: true, title: true, slug: true } },
    },
  });

  return NextResponse.json({ payments });
}

