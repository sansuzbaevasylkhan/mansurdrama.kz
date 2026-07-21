import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { setSiteStats } from "@/lib/firebase-helpers";

export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalDramas, totalEpisodes, totalUsers, viewsAgg] = await Promise.all([
      prisma.drama.count(),
      prisma.episode.count(),
      prisma.user.count(),
      prisma.drama.aggregate({ _sum: { views: true } }),
    ]);

    const stats = {
      totalDramas,
      totalEpisodes,
      totalUsers,
      totalViews: viewsAgg._sum.views || 0,
    };

    // RTDB-ға да жазу — StatsOverview live жаңарта алады.
    // Қате болса да, Prisma деректері қайтарылады (graceful degradation).
    setSiteStats({
      dramas: totalDramas,
      episodes: totalEpisodes,
      users: totalUsers,
      views: stats.totalViews,
    }).catch((err) => console.error("[stats] setSiteStats failed:", err));

    return NextResponse.json(stats);
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
