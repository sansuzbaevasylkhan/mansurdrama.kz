import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const request = new NextRequest(); // Mock request for guard
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const episodes = await prisma.episode.findMany({
      where: {
        status: { in: ["SCHEDULED", "DRAFT"] },
      },
      orderBy: { scheduledAt: "asc" },
      include: { drama: true },
    });

    return NextResponse.json({ episodes });
  } catch (error) {
    console.error("[SCHEDULED_GET_ERROR]", error);
    return NextResponse.json({ error: "Деректерді алу мүмкін болмады" }, { status: 500 });
  }
}
