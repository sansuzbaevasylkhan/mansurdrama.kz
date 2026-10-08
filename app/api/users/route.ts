import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-guards';
import { getAllUsers, createUser } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mailer';

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const users = await getAllUsers();

    // SECURITY: Filter out sensitive data before returning to client
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedUsers
    });
  } catch (err) {
    console.error('GET /api/users error:', err);
    return NextResponse.json(
      { success: false, error: 'Қолданушыларды жүктеу мүмкін болмады' },
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
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Жарамсыз деректер',
        details: parsed.error.flatten()
      }, { status: 400 });
    }
    const password = parsed.data.password
      ? await hashPassword(parsed.data.password)
      : '';
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      avatar: parsed.//data.avatar ?? null,
      password,
    });

    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      password: parsed.data.password,
    }).catch((err) => console.error('sendWelcomeEmail failed:', err));

    return NextResponse.json({
      success: true,
      data: user
    }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Бұл email бойынша қолданушы бар' },
        { status: 409 },
      );
    }
    console.error('POST /api/users error:', err);
    return NextResponse.json(
      { success: false, error: 'Қолданушыны сақтау мүмкін болмады' },
      { status: 500 },
    );
  }
}
