import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { token: pushToken, platform } = await request.json();

    if (!pushToken) {
      return NextResponse.json({ error: 'Push token is required' }, { status: 400 });
    }

    await prisma.pushToken.upsert({
      where: { token: pushToken },
      update: { userId: session.userId, deviceType: platform },
      create: {
        token: pushToken,
        userId: session.userId,
        deviceType: platform,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Push register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pushToken = searchParams.get('token');

    if (!pushToken) {
      return NextResponse.json({ error: 'Token query parameter is required' }, { status: 400 });
    }

    await prisma.pushToken.deleteMany({
      where: {
        token: pushToken,
        userId: session.userId
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Push delete error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
