import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';
import { notifyUser } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error('GET /api/notifications error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: session.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/notifications error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}
