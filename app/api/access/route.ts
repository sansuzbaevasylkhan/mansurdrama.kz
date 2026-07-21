import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hasEpisodeAccess } from '@/lib/access';
import { getSessionFromToken } from '@/lib/auth';

const querySchema = z.object({
  email: z.string().email(),
  dramaId: z.string().min(1),
  episodeNumber: z.coerce.number().int().min(1),
});

/**
 * POST /api/access
 *  Body: { email, dramaId, episodeNumber }
 *
 * 1) Cookie / Bearer-мен кірген пайдаланушыны тексереміз
 * 2) Драма + эпизодтың access-ін есептейміз
 * 3) Қол жеткізе алатын қолданушылардың тізімі (UnlockedContent) бойынша
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = querySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Жарамсыз сұраныс', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { email, dramaId, episodeNumber } = parsed.data;

    // 1) Cookie-дан немесе Bearer-ден userId алу
    let userId: string | null = null;
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const session = await getSessionFromToken(auth.slice(7));
      if (session) userId = session.userId;
    }

    // 2) Email-мен userId табу (cookie-мен сәйкес келуі шарт емес,
    //    бірақ UnlockedContent тексеру үшін керек)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      // Тіркелмеген — тек 1-10 free
      const allowed = episodeNumber <= 10;
      return NextResponse.json({ allowed, userExists: false });
    }

    // 3) Access логикасы
    const allowed = await hasEpisodeAccess(user.id, dramaId, episodeNumber);
    return NextResponse.json({
      allowed,
      userExists: true,
      matched: userId === user.id,
    });
  } catch (err) {
    console.error('POST /api/access error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
