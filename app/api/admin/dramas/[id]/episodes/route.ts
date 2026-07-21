import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const episodes = await prisma.episode.findMany({
      where: { dramaId: id },
      orderBy: { episodeNumber: "asc" },
    });
    return NextResponse.json({ episodes });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
