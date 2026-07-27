/**
 * Supabase Admin client — серверде ғана қолданылады (service_role кілтімен).
 *
 * Prisma-ның singleton үлгісін қайталайды: HMR кезінде globalThis
 * арқылы бір дана сақталады.
 *
 * Қауіпсіздік: SUPABASE_SERVICE_ROLE_KEY ешқашан NEXT_PUBLIC_* болмауы керек —
 * ол RLS-ті аттап өтеді, тек серверде қолданылады (Storage upload/delete).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin?: SupabaseClient;
};

function isConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin(): SupabaseClient {
  if (globalForSupabase.supabaseAdmin) return globalForSupabase.supabaseAdmin;

  if (!isConfigured()) {
    throw new Error(
      "Supabase конфигурацияланбаған. .env файлында SUPABASE_URL және SUPABASE_SERVICE_ROLE_KEY болуы керек."
    );
  }

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  globalForSupabase.supabaseAdmin = client;
  return client;
}

/** Конфигурация бар болса client қайтарады, жоқ болса null (graceful degradation). */
export function getSupabaseAdminOrNull(): SupabaseClient | null {
  if (!isConfigured()) return null;
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export const isSupabaseAdminConfigured = isConfigured;
