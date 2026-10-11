import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";

export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalDramas, totalEpisodes, totalUsers, viewsAgg, pendingPayments, approvedPayments, activeTariffs] = await Promise.all([
      prisma.drama.count(),
      prisma.episode.count(),
      prisma.user.count(),
      prisma.drama.aggregate({ _sum: { views: true } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      }),
      prisma.tariff.count({ where: { isActive: true } }),
    ]);

    const stats = {
      totalDramas,
      totalEpisodes,
      totalUsers,
      totalViews: viewsAgg._sum.views || 0,
      pendingPayments,
      totalRevenue: approvedPayments._sum.amount || 0,
      activeTariffs,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
