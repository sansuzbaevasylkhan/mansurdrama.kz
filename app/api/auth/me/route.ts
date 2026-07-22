import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * Header-мен жіберілген Bearer токенді оқитын /api/auth/me-нің
 * кеңейтілген нұсқасы. Мобиль осы арқылы жұмыс істейді.
 */
export async function GET(request: NextRequest) {
  // 1) Bearer header (мобиль)
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const { verifySessionToken } = await import('@/lib/auth');
    const session = await verifySessionToken(token);
    if (session) return NextResponse.json({ user: session });
  }
  // 2) Cookie (веб-админ)
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({ user: session });
}
