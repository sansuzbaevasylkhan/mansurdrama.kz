import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { headers } from 'next/headers';
import { getSessionFromToken } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    // 1. Сессияны тексеру (Жобаның өз авторизация жүйесі арқылы)
    let userSession = await getSession();

    // Егер cookie-де жоқ болса, Authorization header-ді тексеру (мобильді қосымшалар үшін)
    if (!userSession) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        userSession = await getSessionFromToken(authHeader.slice(7));
      }
    }

    if (!userSession || !userSession.user) {
      return NextResponse.json(
        { success: false, message: 'Сіз тіркелмегенсіз.' },
        { status: 401 }
      );
    }

    const userEmail = userSession.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Қолданушының электронды поштасы табылмады.' },
        { status: 400 }
      );
    }

    // 2. Қолданушыны табу
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Қолданушы табылмады.' },
        { status: 404 }
      );
    }

    const userId = user.id;

    // 3. Барлық байланысты деректерді өшіру
    await prisma.watchHistory.deleteMany({ where: { userId } });
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.unlockedContent.deleteMany({ where: { userId } });

    // Соңғысы - қолданушының өзін өшіру
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Аккаунт және барлық деректер сәтті жойылды.'
    });

  } catch (error) {
    console.error('Delete Account Error:', error);
    return NextResponse.json(
      { success: false, message: 'Аккаунтты жою кезінде қате шықты.' },
      { status: 500 }
    );
  }
}
