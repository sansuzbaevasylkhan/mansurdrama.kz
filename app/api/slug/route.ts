import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import { generateUniqueSlug } from '@/lib/db';

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  if (!title.trim()) {
    return NextResponse.json({ slug: '' });
  }
  try {
    const slug = await generateUniqueSlug(title);
    return NextResponse.json({ slug });
  } catch (err) {
    console.error('GET /api/slug error:', err);
    return NextResponse.json({ error: 'Slug жасау мүмкін болмады' }, { status: 500 });
  }
}
