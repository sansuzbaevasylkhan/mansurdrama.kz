import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';
import { uploadPaymentReceipt } from '@/lib/receipt-storage';

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

  const { id } = await params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Төлем табылмады' }, { status: 404 });
    }

    // Only the owner of the payment can re-upload the receipt
    if (payment.userId !== session.userId) {
      return NextResponse.json({ error: 'Бұл төлемді өзгертуге рұқсат жоқ' }, { status: 403 });
    }

    // Only allow re-upload if the payment was rejected
    if (payment.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Тек қабылдамаған төлемдердің чегін қайта жүктеуге болады' }, { status: 400 });
    }

    const formData = await request.formData();
    const receipt = formData.get('receipt');

    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json({ error: 'Жаңа PDF чек файлын жіберіңіз' }, { status: 400 });
    }

    if (receipt.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Тек PDF форматындағы чектер қабылданады' }, { status: 400 });
    }

    // Upload new receipt
    const saved = await uploadPaymentReceipt(receipt);

    // Calculate new hash to prevent duplicates with this new file
    const arrayBuffer = await receipt.arrayBuffer();
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex');

    const duplicatePayment = await prisma.payment.findFirst({
      where: {
        receiptHash: hash,
        NOT: { id: payment.id }
      }
    });

    if (duplicatePayment) {
      return NextResponse.json({
        error: 'Бұл чек бұрын басқа төлем үшін қолданылған'
      }, { status: 409 });
    }

    await prisma.payment.update({
      where: { id },
      data: {
        receiptPdfUrl: saved.receiptUrl,
        receiptHash: hash,
        status: 'PENDING',
        rejectReason: null,
      },
    });

    return NextResponse.json({ ok: true, message: 'Чек сәтті жаңартылды. Тексерілуді күтіңіз.' });
  } catch (err) {
    console.error('PATCH /api/payments/[id]/receipt error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
