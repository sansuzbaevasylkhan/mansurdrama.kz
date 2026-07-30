import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import {
  createEpisodes,
  getDramaById,
  updateDrama,
} from '@/lib/db';

/**
 * Бөлімдер тізімін алу (mobile/веб плеер үшін — авторизация қажет емес).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const drama = await getDramaById(id);
  if (!drama) {
    return NextResponse.json({ error: 'Дорама табылмады' }, { status: 404 });
  }
  return NextResponse.json(drama.episodes);
}

interface IncomingEpisode {
  episodeNumber: number;
  title?: string;
  videoUrl: string;
  duration?: number;
  thumbnail?: string | null;
}

/**
 * Bulk-create episodes for a drama. This is the workflow used by the
 * admin upload form: title, slug, poster URL come in /api/dramas first,
 * then the per-episode MP4 files are uploaded to /api/upload and the
 * resulting URLs are sent here.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  try {
    const body = await request.json();
    const episodes: IncomingEpisode[] = Array.isArray(body?.episodes) ? body.episodes : [];
    if (episodes.length === 0) {
      return NextResponse.json({ error: 'Бөлімдер массиві бос' }, { status: 400 });
    }
    const drama = await getDramaById(id);
    if (!drama) {
      return NextResponse.json({ error: 'Дорама табылмады' }, { status: 404 });
    }
    const validEpisodes = episodes
      .filter((e) => e && Number.isInteger(e.episodeNumber) && e.episodeNumber > 0 && e.videoUrl)
      .map((e) => ({
        dramaId: id,
        episodeNumber: e.episodeNumber,
        title: (e.title && e.title.trim()) || `Бөлім ${e.episodeNumber}`,
        videoUrl: e.videoUrl,
        duration: e.duration ?? 0,
        thumbnail: e.thumbnail ?? null,
      }));
    if (validEpisodes.length === 0) {
      return NextResponse.json({ error: 'Жарамды бөлімдер жоқ' }, { status: 400 });
    }
    await createEpisodes(validEpisodes);
    // Keep Drama.totalEpisodes in sync with what actually got saved.
    const highest = Math.max(...validEpisodes.map((e) => e.episodeNumber));
    if (highest > drama.totalEpisodes) {
      await updateDrama(id, { totalEpisodes: highest });
    }
    const updated = await getDramaById(id);
    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    console.error('POST /api/dramas/[id]/episodes error:', err);
    return NextResponse.json(
      { error: 'Бөлімдерді сақтау мүмкін болмады' },
      { status: 500 },
    );
  }
}
