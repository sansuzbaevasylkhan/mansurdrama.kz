/**
 * POST /api/admin/migrate
 *
 * Production-да Supabase-қа схеманы жасау үшін қолданылады.
 * Vercel-де `prisma db push` build кезінде қате береді (IPv6 мәселесі),
 * сондықтан бұл endpoint deploy-дан кейін қолмен шақырылады.
 *
 * Қауіпсіздік:
 *  - Тек админ-сессиямен (JWT cookie) қол жетімді
 *  - ADMIN_TOKEN query параметрімен де қорғалған (CRON үшін)
 *  - Rate-limited (1 минутта 3 сұрау)
 *
 * Қолдану:
 *  curl -X POST https://mansurdrama.vercel.app/api/admin/migrate \
 *    -H "Cookie: mansur_admin_session=..." \
 *    -H "Authorization: Bearer $ADMIN_TOKEN"
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // 1) Админ-сессия тексеру
  const guard = await requireAdmin();
  if (guard) return guard;

  // 2) ADMIN_TOKEN тексеру (CRON/CI үшін)
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.ADMIN_TOKEN;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    // Bearer token жоқ немесе қате — бірақ JWT cookie-мен өткен болса жібереміз
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Авторизация қажет" },
        { status: 401 }
      );
    }
  }

  try {
    // Prisma db push — Supabase-қа схеманы жасау
    const { stdout, stderr } = await execAsync(
      "npx prisma db push --skip-generate --accept-data-loss",
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          // Pooler URL-ді мәжбүрлеу (IPv4/IPv6-мен жұмыс істейді)
          DATABASE_URL:
            process.env.DATABASE_URL ||
            "postgresql://postgres:postgres@localhost:5432/postgres",
        },
        timeout: 55_000,
      }
    );

    console.log("[migrate] stdout:", stdout);
    if (stderr) console.warn("[migrate] stderr:", stderr);

    return NextResponse.json({
      success: true,
      message: "Схема сәтті жасалды",
      output: stdout,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Белгісіз қате";
    console.error("[migrate] error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Схема жасау мүмкін болмады",
        details: message,
      },
      { status: 500 }
    );
  }
}

// GET — health check (migrate қажет пе тексеру)
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/admin/migrate",
    method: "POST",
    description: "Supabase-қа Prisma схемасын жасау",
    auth: "JWT cookie немесе Bearer ADMIN_TOKEN",
  });
}
