import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  }

  try {
    let settings = await prisma.notificationSetting.findUnique({
      where: { userId: session.userId },
    });

    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          userId: session.userId,
          payments: true,
          newEpisodes: true,
          promos: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (err) {
    console.error('GET /api/notifications/settings error:', err);
    return NextResponse.json({ error: 'Баптауларды алу мүмкін болмады' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Filter only allowed keys to prevent updating userId or other fields
    const updates: any = {};
    if (typeof body.payments === 'boolean') updates.payments = body.payments;
    if (typeof body.newEpisodes === 'boolean') updates.newEpisodes = body.newEpisodes;
    if (typeof body.promos === 'boolean') updates.promos = body.promos;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Жарамсыз деректер' }, { status: 400 });
    }

    const settings = await prisma.notificationSetting.upsert({
      where: { userId: session.userId },
      update: updates,
      create: {
        userId: session.userId,
        ...updates,
        payments: updates.payments ?? true,
        newEpisodes: updates.newEpisodes ?? true,
        promos: updates.promos ?? true,
      },
    });

    return NextResponse.json(settings);
  } catch (err) {
    console.error('PUT /api/notifications/settings error:', err);
    return NextResponse.json({ error: 'Баптауларды сақтау мүмкін болмады' }, { status: 500 });
  }
}
