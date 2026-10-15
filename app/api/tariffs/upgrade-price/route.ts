import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dramaId = searchParams.get('dramaId');
    const toTariffId = searchParams.get('toTariffId');
    const fromTariffId = searchParams.get('fromTariffId');

    if (!dramaId || !toTariffId) {
      return NextResponse.json({ error: 'dramaId және toTariffId міндетті' }, { status: 400 });
    }

    // 1. Target Tariff Price
    const targetTariff = await prisma.tariff.findUnique({
      where: { id: toTariffId },
      select: { price: true },
    });

    if (!targetTariff) {
      return NextResponse.json({ error: 'Тариф табылмады' }, { status: 404 });
    }

    // 2. Find the most expensive APPROVED payment for this drama that hasn't been upgraded yet
    // If fromTariffId is provided, we can filter by it, otherwise we take the best available
    const previousPayment = await prisma.payment.findFirst({
      where: {
        userId: session.userId,
        dramaId: dramaId,
        status: 'APPROVED',
        isUpgraded: false,
        ...(fromTariffId ? { tariffId: fromTariffId } : {}),
      },
      orderBy: { amount: 'desc' },
    });

    const deductedAmount = previousPayment ? previousPayment.amount : 0;
    const remainingPrice = Math.max(0, targetTariff.price - deductedAmount);

    return NextResponse.json({
      remainingPrice,
      previousPaymentId: previousPayment?.id ?? null,
      originalPrice: targetTariff.price,
      deductedAmount,
    });
  } catch (err) {
    console.error('GET /api/tariffs/upgrade-price error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}
