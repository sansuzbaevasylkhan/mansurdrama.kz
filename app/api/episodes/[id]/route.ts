import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-guards';
import { updateEpisode, deleteEpisode } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  try {
    const body = await request.json();
    const episode = await updateEpisode(id, {
      title: body.title,
      videoUrl: body.videoUrl,
      duration: body.duration,
      thumbnail: body.thumbnail,
    });
    return NextResponse.json(episode);
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Бөлім табылмады' }, { status: 404 });
    }
    console.error('PATCH /api/episodes/[id] error:', err);
    return NextResponse.json(
      { error: 'Бөлімді жаңарту мүмкін болмады' },
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
    // Note: spec says "Never delete files automatically" — we only remove the DB row.
    const exists = await prisma.episode.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: 'Бөлім табылмады' }, { status: 404 });
    }
    await deleteEpisode(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Бөлім табылмады' }, { status: 404 });
    }
    console.error('DELETE /api/episodes/[id] error:', err);
    return NextResponse.json(
      { error: 'Бөлімді жою мүмкін болмады' },
      { status: 500 },
    );
  }
}
