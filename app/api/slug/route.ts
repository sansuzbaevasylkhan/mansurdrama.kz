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
