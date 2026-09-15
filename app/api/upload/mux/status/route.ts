import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import { getUploadStatus } from '@/lib/mux';

/**
 * GET /api/upload/mux/status?uploadId=...
 *
 * Клиент upload аяқталған соң, Mux видеоны өңдеп бітіргенше
 * (playbackId дайын болғанша) осы route-ты polling жасайды.
 */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const uploadId = request.nextUrl.searchParams.get('uploadId');
  if (!uploadId) {
    return NextResponse.json({ error: 'uploadId қажет' }, { status: 400 });
  }

  try {
    const status = await getUploadStatus(uploadId);
    return NextResponse.json(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Mux статусын алу мүмкін болмады';
    console.error('GET /api/upload/mux/status error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
