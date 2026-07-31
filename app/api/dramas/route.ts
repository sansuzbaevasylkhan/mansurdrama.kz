import { NextRequest, NextResponse } from 'next/server';
import {
  getAllDramasForAdmin,
  getDramasBySearch,
  createDrama,
} from '@/lib/db';
import { requireAdmin } from '@/lib/api-guards';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';
  const admin = searchParams.get('admin') === '1';
  try {
    const dramas = admin
      ? await getAllDramasForAdmin()
      : await getDramasBySearch(search);
    return NextResponse.json(dramas);
  } catch (err) {
    console.error('GET /api/dramas error:', err);
    return NextResponse.json(
      { error: 'Дорамаларды жүктеу мүмкін болмады' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await request.json();
    const { title, slug, description, posterUrl, totalEpisodes, isPublished } = body;
    if (!title || !posterUrl || !Number.isInteger(totalEpisodes) || totalEpisodes < 1) {
      return NextResponse.json(
        { error: 'Атауы, постер URL және бөлімдер саны қажет' },
        { status: 400 },
      );
    }
    const drama = await createDrama({
      title,
      slug,
      description,
      posterUrl,
      totalEpisodes,
      isPublished,
    });
    return NextResponse.json(drama, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Бұл slug бойынша дорама бар, басқа атау/сілтеме таңдаңыз' },
        { status: 409 },
      );
    }
    console.error('POST /api/dramas error:', err);
    return NextResponse.json(
      { error: 'Дораманы сақтау мүмкін болмады' },
      { status: 500 },
    );
  }
}
