import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getDramaById,
  updateDrama,
  deleteDrama,
  deleteEpisodesForDrama,
} from '@/lib/db';
import { requireAdmin } from '@/lib/api-guards';

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  posterUrl: z.string().min(1).optional(),
  totalEpisodes: z.number().int().min(1).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const drama = await getDramaById(id);
  if (!drama) {
    return NextResponse.json({ error: 'Дорама табылмады' }, { status: 404 });
  }
  return NextResponse.json(drama);
}

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
    const drama = await updateDrama(id, parsed.data);
    return NextResponse.json(drama);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Дорама табылмады' }, { status: 404 });
    }
    console.error('PATCH /api/dramas/[id] error:', err);
    return NextResponse.json(
      { error: 'Дораманы жаңарту мүмкін болмады' },
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
    await deleteDrama(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Дорама табылмады' }, { status: 404 });
    }
    console.error('DELETE /api/dramas/[id] error:', err);
    return NextResponse.json(
      { error: 'Дораманы жою мүмкін болмады' },
      { status: 500 },
    );
  }
}
