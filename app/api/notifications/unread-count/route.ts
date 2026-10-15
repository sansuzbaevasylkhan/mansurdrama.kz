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
    const count = await prisma.notification.count({
      where: {
        userId: session.userId,
        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error('GET /api/notifications/unread-count error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}
