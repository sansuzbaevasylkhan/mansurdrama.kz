import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";

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

    return NextResponse.json(stats);
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
