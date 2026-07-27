import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

/**
 * Google арқылы кіру (мобиль қосымша үшін).
 * Клиент Google Sign-In арқылы алған id_token-ды жібереді, мұнда
 * Google-дің tokeninfo эндпоинті арқылы тексеріліп, аккаунт
 * табылмаса автоматты жасалады (құпия сөзсіз, user-login секілді).
 */
const schema = z.object({
  idToken: z.string().min(1),
});

interface GoogleTokenInfo {
  aud: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
  error_description?: string;
}

export async function POST(request: NextRequest) {
  const allowedAudiences = [
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
  ].filter(Boolean);

  if (allowedAudiences.length === 0) {
    return NextResponse.json(
      { error: 'Google арқылы кіру серверде әлі баптлмаған' },
      { status: 501 },
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'idToken қажет' }, { status: 400 });
    }

    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(parsed.data.idToken)}`,
    );
    const info: GoogleTokenInfo = await infoRes.json();
    if (!infoRes.ok || !info.email) {
      return NextResponse.json(
        { error: info.error_description || 'Google токені жарамсыз' },
        { status: 401 },
      );
    }
    if (!allowedAudiences.includes(info.aud)) {
      return NextResponse.json({ error: 'Google client ID сәйкес келмейді' }, { status: 401 });
    }
    if (info.email_verified === 'false') {
      return NextResponse.json({ error: 'Email расталмаған' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { email: info.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: info.email,
          name: info.name?.trim() || info.email.split('@')[0],
          avatar: info.picture ?? null,
          password: '',
          role: 'USER',
        },
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'USER',
    });
    await setSessionCookie(token, 'user_session');

    return NextResponse.json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}
