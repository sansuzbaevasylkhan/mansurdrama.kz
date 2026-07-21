import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateAdmin, createSessionToken, setSessionCookie } from '@/lib/auth';

const schema = z.object({ password: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Құпиясөз енгізіңіз' }, { status: 400 });
    }
    const admin = await authenticateAdmin(parsed.data.password);
    if (!admin) {
      return NextResponse.json({ error: 'Құпиясөз қате' }, { status: 401 });
    }
    const token = await createSessionToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'ADMIN',
    });
    await setSessionCookie(token);
    return NextResponse.json({
      ok: true,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Сервер қатесі' },
      { status: 500 },
    );
  }
}
