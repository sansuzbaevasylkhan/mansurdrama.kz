import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';
import { uploadPaymentReceipt } from '@/lib/receipt-storage';

const bodySchema = z.object({
  receipt: z.any(), // FormData handled separately
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Төлем табылмады' }, { status: 404 });
    }

    if (payment.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (payment.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Тек қабылданбаған төлемдерді қайта жіберуге болады' }, { status: 400 });
    }

    const formData = await request.formData();
    const receipt = formData.get('receipt');

    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json({ error: 'Чек файлын жіберіңіз' }, { status: 400 });
    }

    const saved = await uploadPaymentReceipt(receipt);

    await prisma.payment.update({
      where: { id },
      data: {
        receiptPdfUrl: saved.receiptUrl,
        status: 'PENDING',
        rejectReason: null,
        reviewedAt: null,
        reviewedBy: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/payments/[id]/resubmit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
