import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';
import { notifyUser } from '@/lib/push';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dramaId, userId } = body;

    if (!dramaId || !userId) {
      return NextResponse.json({ error: 'Деректер жетіспейді' }, { status: 400 });
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_dramaId: { userId, dramaId },
      },
      update: {}, // Do nothing on update, as we use DELETE for removing
      create: {
        userId,
        dramaId,
      },
    });

    return NextResponse.json({ ok: true, favorite });
  } catch (err) {
    console.error('POST /api/favorites error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dramaId = searchParams.get('dramaId');

    if (!dramaId) {
      return NextResponse.json({ error: 'dramaId міндетті' }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: session.userId,
        dramaId: dramaId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/favorites error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}
