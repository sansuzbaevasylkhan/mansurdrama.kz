import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Find episodes that are SCHEDULED and their time has come
      const episodesToPublish = await tx.episode.findMany({
        where: {
          status: "SCHEDULED",
          scheduledAt: {
            lte: now,
          },
        },
      });

      if (episodesToPublish.length === 0) {
        return { publishedCount: 0 };
      }

      const ids = episodesToPublish.map((e) => e.id);

      await tx.episode.updateMany({
        where: { id: { in: ids } },
        data: { status: "PUBLISHED" },
      });

      return { publishedCount: ids.length };
    });

    return NextResponse.json({
      success: true,
      publishedCount: result.publishedCount,
      message: `${result.publishedCount} эпизодтар жарияланды.`
    });
  } catch (error) {
    console.error("[PUBLISH_DUE_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Жариялау кезінде қате кетті"
    }, { status: 500 });
  }
}
