import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";

export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Using separate try-catch for each count to ensure one failure doesn't break everything
    const totalDramas = await prisma.drama.count().catch(() => 0);
    const totalEpisodes = await prisma.episode.count().catch(() => 0);
    const totalUsers = await prisma.user.count().catch(() => 0);

    const viewsAgg = await prisma.drama.aggregate({ _sum: { views: true } }).catch(() => ({ _sum: { views: 0 } }));
    const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING' } }).catch(() => 0);
    const approvedPayments = await prisma.payment.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));
    const activeTariffs = await prisma.tariff.count({ where: { isActive: true } }).catch(() => 0);

    const stats = {
      totalDramas,
      totalEpisodes,
      totalUsers,
      totalViews: viewsAgg._sum?.views || 0,
      pendingPayments,
      totalRevenue: approvedPayments._sum?.amount || 0,
      activeTariffs,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({
      totalDramas: 0,
      totalEpisodes: 0,
      totalUsers: 0,
      totalViews: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      activeTariffs: 0
    }, { status: 200 }); // Return empty stats instead of 500 to avoid crashing the UI
  }
}
