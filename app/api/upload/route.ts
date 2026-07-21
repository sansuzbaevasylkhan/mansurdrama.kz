import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import { saveUploadedFile, type UploadSubdir } from '@/lib/upload';

export const runtime = 'nodejs';
// Allow uploads up to 1GB. Next 15 honours `bodySize` per route.
export const maxDuration = 300;

// Қолдау көрсетілетін қалталар (және олардың жалқы формалары)
const ALLOWED_SUBDIRS: UploadSubdir[] = ['posters', 'videos', 'avatars'];
const ALLOWED_KINDS = new Set(['poster', 'video', 'avatar']);

/**
 * `subdir` (дұрыс форма) немесе `kind` (жұмыс істейтін форма) — екеуін де қабылдайды.
 * Жалқы формаларды (poster/video/avatar) көпше формаға (posters/videos/avatars) ауыстырады.
 */
function resolveSubdir(raw: unknown): UploadSubdir | null {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return 'posters';
  if (ALLOWED_SUBDIRS.includes(value as UploadSubdir)) {
    return value as UploadSubdir;
  }
  // Клиент жалқы форманы жіберген болса — "s" жалғау
  if (value.endsWith('s') && ALLOWED_KINDS.has(value)) {
    return `${value}s` as UploadSubdir;
  }
  if (ALLOWED_KINDS.has(value)) {
    return `${value}s` as UploadSubdir;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const form = await request.formData();
    const subdir = resolveSubdir(form.get('subdir') ?? form.get('kind'));
    if (!subdir) {
      return NextResponse.json(
        { error: 'subdir posters/videos/avatars болуы керек' },
        { status: 400 },
      );
    }
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл табылмады' }, { status: 400 });
    }
    const saved = await saveUploadedFile(file, subdir);
    return NextResponse.json(saved, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Файлды жүктеу мүмкін болмады';
    console.error('POST /api/upload error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
