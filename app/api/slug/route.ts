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
  try {
    const { searchParams } = new URL(request.url);
    let title = searchParams.get('title');

    if (title === null || title === undefined) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Ensure the title is correctly decoded from URL encoding (UTF-8)
    try {
      title = decodeURIComponent(title);
    } catch (e) {
      console.error('[Slug API] URI decode error:', e);
      // Fallback to raw title if decode fails
    }

    if (!title.trim()) {
      return NextResponse.json({ success: true, slug: '' }, { status: 200 });
    }

    const slug = await generateUniqueSlug(title);

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug generation failed' },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, slug }, { status: 200 });
  } catch (err) {
    console.error('GET /api/slug error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : undefined
      },
      { status: 500 }
    );
  }
}
