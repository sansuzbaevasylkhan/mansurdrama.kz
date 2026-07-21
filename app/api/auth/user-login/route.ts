import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

/**
 * Пайдаланушы email-мен кіру (мобиль қосымша үшін).
 * Бұл endpoint cookie-ға "user_session" JWT жазады.
 * Мобиль cookie-ны қолдамайды, сондықтан Authorization header
 * арқылы Bearer токен қабылдайтындай кеңейту қажет (төменде).
 */
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email жарамсыз' }, { status: 400 });
    }
    const { email, name } = parsed.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name?.trim() || email.split('@')[0],
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
      token, // мобиль Bearer үшін
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN',
      },
    });
  } catch (err) {
    console.error('User login error:', err);
    return NextResponse.json({ error: 'Сервер қатесі' }, { status: 500 });
  }
}
