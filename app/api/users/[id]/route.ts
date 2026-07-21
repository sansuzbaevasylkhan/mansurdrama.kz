import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-guards';
import { updateUser, deleteUser } from '@/lib/db';

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  avatar: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Жарамсыз деректер', details: parsed.error.flatten() }, { status: 400 });
    }
    const user = await updateUser(id, parsed.data);
    return NextResponse.json(user);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Қолданушы табылмады' }, { status: 404 });
    }
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Бұл email бойынша қолданушы бар' }, { status: 409 });
    }
    console.error('PATCH /api/users/[id] error:', err);
    return NextResponse.json(
      { error: 'Қолданушыны жаңарту мүмкін болмаді' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  try {
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Қолданушы табылмады' }, { status: 404 });
    }
    console.error('DELETE /api/users/[id] error:', err);
    return NextResponse.json(
      { error: 'Қолданушыны жою мүмкін болмады' },
      { status: 500 },
    );
  }
}
