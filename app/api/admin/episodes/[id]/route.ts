import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { prisma } from "@/lib/prisma";
import { sendBroadcastNotification } from "@/lib/notifications";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const { id } = params;
    const episode = await prisma.episode.update({
      where: { id },
      data: { status: "PUBLISHED" },
      include: { drama: true },
    });

    // Notify users who might be interested in this drama
    // For simplicity, we'll notify all users who have a push token
    const users = await prisma.pushToken.findMany({ select: { userId: true } });
    const userIds = users.map(u => u.userId);

    await sendBroadcastNotification(
      userIds,
      `Жаңа серия шықты! 🎬`,
      `${episode.drama.title} — ${episode.episodeNumber}-серия енді қолжетімді!`,
      { dramaId: episode.dramaId, episodeId: id }
    );

    return NextResponse.json({ success: true, episode });
  } catch (error) {
    console.error("[EPISODE_PUBLISH_ERROR]", error);
    return NextResponse.json({ error: "Жариялау мүмкін болмады" }, { status: 500 });
  }
}
