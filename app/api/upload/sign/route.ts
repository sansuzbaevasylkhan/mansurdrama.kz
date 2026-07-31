import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import { createUploadTicket } from '@/lib/supabase-storage';
import type { UploadSubdir } from '@/lib/upload';

/**
 * POST /api/upload/sign
 *
 * Үлкен файлдар (видео) үшін — байт ағыны Vercel serverless
 * функциясынан ӨТПЕЙДІ (4.5MB body лимитін айналып өтеді).
 * Клиент осы жерден signed upload URL алады да, файлды ТІКЕЛЕЙ
 * Supabase Storage-қа жібереді.
 *
 * Body: { filename: string, size: number, mimeType: string, subdir: "videos" | "posters" | "avatars" }
 * Response: { path, token, publicUrl, signedUrl }
 */

const ALLOWED_SUBDIRS: UploadSubdir[] = ['posters', 'videos', 'avatars'];

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await request.json();
    const { filename, size, mimeType, subdir } = body ?? {};

    if (!ALLOWED_SUBDIRS.includes(subdir)) {
      return NextResponse.json(
        { error: 'subdir posters/videos/avatars болуы керек' },
        { status: 400 },
      );
    }
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'filename қажет' }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json({ error: 'size қажет' }, { status: 400 });
    }
    if (!mimeType || typeof mimeType !== 'string') {
      return NextResponse.json({ error: 'mimeType қажет' }, { status: 400 });
    }

    const ticket = await createUploadTicket(filename, size, mimeType, subdir);
    return NextResponse.json(ticket, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signed URL жасау мүмкін болмады';
    console.error('POST /api/upload/sign error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
