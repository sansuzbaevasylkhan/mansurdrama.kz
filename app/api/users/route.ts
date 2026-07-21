import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-guards';
import { getAllUsers, createUser } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    return NextResponse.json(
      { error: 'Қолданушыларды жүктеу мүмкін болмады' },
      { status: 500 },
    );
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  avatar: z.string().url().or(z.string().startsWith('/')).optional().nullable(),
  password: z.string().min(6).optional(),
});

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Жарамсыз деректер', details: parsed.error.flatten() }, { status: 400 });
    }
    const password = parsed.data.password
      ? await hashPassword(parsed.data.password)
      : '';
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      avatar: parsed.data.avatar ?? null,
      password,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Бұл email бойынша қолданушы бар' },
        { status: 409 },
      );
    }
    console.error('POST /api/users error:', err);
    return NextResponse.json(
      { error: 'Қолданушыны сақтау мүмкін болмады' },
      { status: 500 },
    );
  }
}
