import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { uploadPaymentReceipt } from '@/lib/receipt-storage';
import { getSessionFromToken } from '@/lib/auth';
import crypto from 'crypto';
import { sendPush } from '@/lib/push';

const kaspiNumber = '+7 776 010 9510';

const formTypeSchema = z.enum(['SINGLE_EPISODE', 'FULL_PACKAGE']);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        drama: { select: { title: true } },
        tariff: { select: { name: true, price: true } },
      },
    });

    // Transform to return specific fields requested
    const result = payments.map(p => ({
      id: p.id,
      status: p.status,
      rejectReason: p.rejectReason,
      createdAt: p.createdAt,
      tariffName: p.tariff.name,
      dramaTitle: p.drama.title,
      amount: p.amount
    }));

    return NextResponse.json({ payments: result });
  } catch (err) {
    console.error('GET /api/payments/my error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const ip = getClientIp(request.headers);
  const limiter = rateLimit(`payments:${ip}`, { windowMs: 60_000, max: 10 });
  if (!limiter.ok) {
    return NextResponse.json({ error: 'Тым көп сұраныс' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const dramaId = String(formData.get('dramaId') || '').trim();
    const tariffId = String(formData.get('tariffId') || '').trim();
    const typeRaw = String(formData.get('type') || '').trim();
    const episodeNumberRaw = formData.get('episodeNumber');
    const episodeNumber = episodeNumberRaw ? Number(episodeNumberRaw) : undefined;
    const receipt = formData.get('receipt');

    const typeParsed = formTypeSchema.safeParse(typeRaw);
    if (!typeParsed.success || !dramaId || !tariffId) {
      return NextResponse.json({ error: 'Жарамсыз деректер' }, { status: 400 });
    }

    // PDF check for receipt
    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json({ error: 'PDF чек файлын жіберіңіз' }, { status: 400 });
    }

    if (receipt.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Тек PDF форматындағы чектер қабылданады' }, { status: 400 });
    }

    const type = typeParsed.data;
    const amount = Number(formData.get('amount') || 0);
    const upgradeFromPaymentId = String(formData.get('upgradeFromPaymentId') || '').trim() || null;

    if (type === 'SINGLE_EPISODE') {
      if (!episodeNumber || !Number.isInteger(episodeNumber)) {
        return NextResponse.json({ error: 'episodeNumber міндетті' }, { status: 400 });
      }
    }

    // Ensure drama exists
    const drama = await prisma.drama.findUnique({ where: { id: dramaId }, select: { id: true } });
    if (!drama) {
      return NextResponse.json({ error: 'Драма табылмады' }, { status: 404 });
    }

    // Ensure tariff exists and verify price
    const tariff = await prisma.tariff.findUnique({
      where: { id: tariffId },
      select: { id: true, price: true, discountPercent: true },
    });

    if (!tariff) {
      return NextResponse.json({ error: 'Тариф табылмады' }, { status: 404 });
    }

    // Discount Logic: Verify if user is eligible for discount (notified within last 24h)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { freeEndedNotifiedAt: true }
    });

    let validAmounts = [tariff.price];

    if (user?.freeEndedNotifiedAt) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (user.freeEndedNotifiedAt >= twentyFourHoursAgo && tariff.discountPercent > 0) {
        const discountedPrice = Math.floor(tariff.price * (1 - tariff.discountPercent / 100));
        validAmounts.push(discountedPrice);
      }
    }

    // Upgrade Logic: Recalculate expected amount if it's an upgrade
    if (upgradeFromPaymentId) {
      const prevPayment = await prisma.payment.findUnique({
        where: { id: upgradeFromPaymentId },
        select: { userId: true, status: true, amount: true }
      });

      if (!prevPayment || prevPayment.userId !== session.userId || prevPayment.status !== 'APPROVED' || prevPayment.isUpgraded) {
        return NextResponse.json({ error: 'Жарамсыз бастапқы төлем немесе ол бұрын жаңартылған' }, { status: 400 });
      }

      const upgradeAmount = Math.max(0, Math.floor(tariff.price - prevPayment.amount));
      validAmounts = [upgradeAmount];
    }

    if (!validAmounts.includes(amount)) {
      const priceMsg = validAmounts.length > 1
        ? `Төлеу керек: ${tariff.price}₸ немесе жеңілдікпен ${validAmounts[1]}₸`
        : `Осы тариф үшін ${validAmounts[0]}₸ төлеу керек.`;
      return NextResponse.json({
        error: `Сома дұрыс емес. ${priceMsg}`
      }, { status: 400 });
    }

    // Calculate SHA-256 hash of receipt to prevent duplicates
    const arrayBuffer = await receipt.arrayBuffer();
    const hash = crypto.createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex');

    const existingPayment = await prisma.payment.findFirst({
      where: { receiptHash: hash }
    });

    if (existingPayment) {
      return NextResponse.json({
        error: 'Бұл чек бұрын жіберілген. Басқа чекті жүктеңіз немесе қолдау көрсету бөліміне хабарласыңыз.'
      }, { status: 409 });
    }

    // Upload receipt
    const saved = await uploadPaymentReceipt(receipt);

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          userId: session.userId,
          dramaId,
          tariffId,
          type,
          episodeNumber: type === 'SINGLE_EPISODE' ? (episodeNumber as number) : null,
          receiptPdfUrl: saved.receiptUrl,
          receiptHash: hash,
          amount,
          kaspiNumber,
          status: 'PENDING',
          upgradeFromPaymentId: upgradeFromPaymentId || null,
        },
      });

      if (upgradeFromPaymentId) {
        await tx.payment.update({
          where: { id: upgradeFromPaymentId },
          data: { isUpgraded: true },
        });
      }

      return newPayment;
    });

    // Trigger Push Notification for ADMINs
    const adminIds = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    await sendPush(
      { userIds: adminIds.map(a => a.id) },
      {
        title: 'Жаңа төлем',
        body: `${session.userId} төлем жасады: ${amount}₸`,
        data: { type: 'payment' }
      }
    );

    return NextResponse.json({ ok: true, paymentId: payment.id });
  } catch (err) {
    console.error('POST /api/payments error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
