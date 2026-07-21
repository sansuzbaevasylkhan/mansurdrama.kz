import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { ensureUniqueSlug } from "@/lib/slug";

export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dramas = await prisma.drama.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { episodes: true } } },
    });

    return NextResponse.json({
      dramas: dramas.map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        description: d.description,
        posterUrl: d.posterUrl,
        totalEpisodes: d._count.episodes,
        views: d.views,
        isPublished: d.isPublished,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Fetch dramas error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, description, posterUrl, isPublished, episodes } = body;

    if (!title || !slug || !posterUrl) {
      return NextResponse.json(
        { success: false, error: "Міндетті өрістерді толтырыңыз" },
        { status: 400 }
      );
    }

    // Check unique slug
    const existing = await prisma.drama.findMany({ select: { slug: true } });
    const slugs = existing
      .map((d) => d.slug)
      .filter((s): s is string => typeof s === 'string');

    const finalSlug = await ensureUniqueSlug(slug, async (candidate) => {
      return slugs.includes(candidate);
    });


    const drama = await prisma.drama.create({
      data: {
        title,
        slug: finalSlug,
        description: description || null,
        posterUrl,
        isPublished: isPublished ?? true,
        totalEpisodes: episodes?.length || 0,
        episodes: episodes
          ? {
              create: episodes.map((e: any) => ({
                episodeNumber: e.episodeNumber,
                title: e.title,
                videoUrl: e.videoUrl,
                duration: e.duration || 0,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, drama });
  } catch (err) {
    console.error("Create drama error:", err);
    return NextResponse.json(
      { success: false, error: "Дорама қосу қатесі" },
      { status: 500 }
    );
  }
}
