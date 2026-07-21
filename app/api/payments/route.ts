import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { uploadPaymentReceipt } from '@/lib/receipt-storage';

const kaspiNumber = '+7 776 010 9510';

const formTypeSchema = z.enum(['SINGLE_EPISODE', 'FULL_PACKAGE']);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limiter = rateLimit(`payments:${ip}`, { windowMs: 60_000, max: 10 });
  if (!limiter.ok) {
    return NextResponse.json({ error: 'Тым көп сұраныс' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const email = String(formData.get('email') || '').trim();
    const dramaId = String(formData.get('dramaId') || '').trim();
    const typeRaw = String(formData.get('type') || '').trim();
    const episodeNumberRaw = formData.get('episodeNumber');
    const episodeNumber = episodeNumberRaw ? Number(episodeNumberRaw) : undefined;
    const receipt = formData.get('receipt');

    const typeParsed = formTypeSchema.safeParse(typeRaw);
    if (!email || !typeParsed.success || !dramaId) {
      return NextResponse.json({ error: 'Жарамсыз деректер' }, { status: 400 });
    }

    const emailSchema = z.string().email();
    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) {
      return NextResponse.json({ error: 'Email жарамсыз' }, { status: 400 });
    }

    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json({ error: 'Чек файлын жіберіңіз' }, { status: 400 });
    }

    const type = typeParsed.data;

    if (type === 'SINGLE_EPISODE') {
      if (!episodeNumber || !Number.isInteger(episodeNumber)) {
        return NextResponse.json({ error: 'episodeNumber міндетті' }, { status: 400 });
      }
      if (episodeNumber < 11) {
        return NextResponse.json({ error: '11+ эпизодтарға ғана төлем керек' }, { status: 400 });
      }
    }

    // Ensure drama exists
    const drama = await prisma.drama.findUnique({ where: { id: dramaId }, select: { id: true } });
    if (!drama) {
      return NextResponse.json({ error: 'Драма табылмады' }, { status: 404 });
    }

    // Find/create user by email (no login exists in this repo)
    let user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0] || 'User',
          password: '',
          role: 'USER',
        },
        select: { id: true, name: true },
      });
    }

    // Upload receipt
    const saved = await uploadPaymentReceipt(receipt);

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        dramaId,
        type,
        episodeNumber: type === 'SINGLE_EPISODE' ? (episodeNumber as number) : null,
        receiptUrl: saved.receiptUrl,
        kaspiNumber,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ ok: true, paymentId: payment.id });
  } catch (err) {
    console.error('POST /api/payments error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

