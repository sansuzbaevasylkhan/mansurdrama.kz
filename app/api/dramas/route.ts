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
  const isAdminRequested = searchParams.get('admin') === '1';

  if (isAdminRequested) {
    const guard = await requireAdmin(request);
    if (guard) return guard;

    try {
      const dramas = await getAllDramasForAdmin();
      return NextResponse.json({ success: true, data: dramas });
    } catch (err) {
      console.error('GET /api/dramas (admin) error:', err);
      return NextResponse.json(
        { success: false, error: 'Админ деректерін жүктеу мүмкін болмады' },
        { status: 500 },
      );
    }
  }

  try {
    const dramas = await getDramasBySearch(search);
    return NextResponse.json({ success: true, data: dramas });
  } catch (err) {
    console.error('GET /api/dramas (public) error:', err);
    return NextResponse.json(
      { success: false, error: 'Дорамаларды жүктеу мүмкін болмады' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { title, slug, description, posterUrl, totalEpisodes, isPublished } = body;
    if (!title || !posterUrl || !Number.isInteger(totalEpisodes) || totalEpisodes < 1) {
      return NextResponse.json(
        { success: false, error: 'Атауы, постер URL және бөлімдер саны қажет' },
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
    return NextResponse.json({ success: true, data: drama }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Бұл slug бойынша дорама бар, басқа атау/сілтеме таңдаңыз' },
        { status: 409 },
      );
    }
    console.error('POST /api/dramas error:', err);
    return NextResponse.json(
      { success: false, error: 'Дораманы сақтау мүмкін болмады' },
      { status: 500 },
    );
  }
}
