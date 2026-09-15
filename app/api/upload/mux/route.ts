import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-guards';
import { createDirectUpload, isMuxConfigured } from '@/lib/mux';

/**
 * POST /api/upload/mux
 *
 * Видео файлдар үшін Mux Direct Upload URL жасайды. Клиент осы URL-ге
 * (@mux/upchunk арқылы) файлды ТІКЕЛЕЙ Mux-қа жібереді — Vercel-дің
 * 4.5MB body лимитін айналып өтеді, video транскодтауды Mux өз мойнына алады.
 *
 * Response: { uploadId, url }
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  if (!isMuxConfigured()) {
    return NextResponse.json(
      { error: 'Mux конфигурацияланбаған. MUX_TOKEN_ID, MUX_TOKEN_SECRET орнатыңыз.' },
      { status: 500 },
    );
  }

  try {
    const ticket = await createDirectUpload();
    return NextResponse.json(ticket, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Mux upload URL жасау мүмкін болмады';
    console.error('POST /api/upload/mux error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
