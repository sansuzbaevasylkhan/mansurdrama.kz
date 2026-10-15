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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: dramaId } = await params;
    const body = await req.json();

    const { episodeNumber, title, videoUrl, playbackId, muxAssetId, muxUploadId, duration, thumbnail, publishAt } = body;

    // Convert Asia/Almaty to UTC if publishAt is provided
    let utcPublishAt = null;
    if (publishAt) {
      utcPublishAt = new Date(publishAt);
    }

    const episode = await prisma.episode.create({
      data: {
        dramaId,
        episodeNumber,
        title,
        videoUrl,
        playbackId,
        muxAssetId,
        muxUploadId,
        duration,
        thumbnail,
        publishAt: utcPublishAt,
      },
    });

    return NextResponse.json({ episode }, { status: 201 });
  } catch (err) {
    console.error("POST episode error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
