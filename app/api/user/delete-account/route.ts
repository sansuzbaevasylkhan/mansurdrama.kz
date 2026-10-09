import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[nextauth]/route';

export async function DELETE(request: NextRequest) {
  try {
    // 1. Сессияны тексеру
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Сіз тіркелмегенсіз.' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

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

    // 3. Барлық байланысты деректерді өшіру (Cascade Delete Prisma-да баптағанбыз)
    // Бірақ әлдеқайда сенімді болу үшін қолмен өшіреміз (егер CASCADE жұмыс істемесе)
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
