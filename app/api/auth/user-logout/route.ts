import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  await clearSessionCookie('user_session');
  return NextResponse.json({ ok: true });
}
