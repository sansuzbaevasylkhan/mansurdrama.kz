import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import { createUploadTicket } from '@/lib/supabase-storage';
import type { UploadSubdir } from '@/lib/upload';

/**
 * POST /api/upload/sign
 *
 * Generates a signed upload URL for large files (videos/posters).
 * Security: Requires admin authentication.
 *
 * Body: { filename: string, size: number, mimeType: string, subdir: "videos" | "posters" | "avatars" }
 * Response: { success: true, data: { path, token, publicUrl, signedUrl } }
 */

const ALLOWED_SUBDIRS: UploadSubdir[] = ['posters', 'videos', 'avatars'];

export async function POST(request: NextRequest) {
  // 1. Authentication & Authorization
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { filename, size, mimeType, subdir } = body ?? {};

    // 2. Input Validation
    if (!filename || typeof filename !== 'string' || filename.trim() === '') {
      return NextResponse.json({ success: false, error: 'Valid filename is required' }, { status: 400 });
    }
    if (!size || typeof size !== 'number' || size <= 0) {
      return NextResponse.json({ success: false, error: 'Valid file size is required' }, { status: 400 });
    }
    if (!mimeType || typeof mimeType !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid MIME type is required' }, { status: 400 });
    }
    if (!subdir || !ALLOWED_SUBDIRS.includes(subdir)) {
      return NextResponse.json(
        { success: false, error: `Invalid subdir. Allowed: ${ALLOWED_SUBDIRS.join(', ')}` },
        { status: 400 },
      );
    }

    // 3. External Service Integration
    try {
      const ticket = await createUploadTicket(filename, size, mimeType, subdir);

      return NextResponse.json({
        success: true,
        data: ticket
      }, { status: 201 });
    } catch (providerErr: any) {
      console.error('[Upload Sign] Provider error:', providerErr);

      // Check if it's a configuration error (missing env vars)
      if (providerErr.message?.includes('API key') || providerErr.message?.includes('secret')) {
        return NextResponse.json(
          { success: false, error: 'Upload service is not configured on server' },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { success: false, error: 'External upload provider error' },
        { status: 503 },
      );
    }
  } catch (err: any) {
    console.error('POST /api/upload/sign error:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }
}
