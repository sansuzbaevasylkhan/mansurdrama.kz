import { NextRequest, NextResponse } from 'next/server';
import { generateUniqueSlug } from '@/lib/db';

/**
 * Generate a unique URL slug from a drama title.
 *
 * This is a read-only helper used by the admin form's auto-slug feature
 * and does not require an authenticated admin session — it only returns
 * a slug string, never mutates database state.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';

  if (!title.trim()) {
    return NextResponse.json({ slug: '' }, { status: 200 });
  }

  try {
    const slug = await generateUniqueSlug(title);
//    console.//Log for debugging (optional)
    if (!slug) {
      return NextResponse.json({ error: 'Slug генерациялау мүмкін болмады' }, { status: 400 });
    }
    return NextResponse.json({ slug }, { status: 200 });
  } catch (err) {
    console.error('GET /api/slug error:', err);
    return NextResponse.json(
      { error: 'Серверде ішкі қате орын алды', errorDetails: process.env.NODE_ENV === 'development' ? err instanceof Error ? err.message : String(err) : undefined },
      { status: 500 }
    );
  }
}
