import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { ensureUniqueSlug } from "@/lib/slug";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const drama = await prisma.drama.findUnique({
      where: { id },
      include: { episodes: { orderBy: { episodeNumber: "asc" } } },
    });
    if (!drama) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ drama });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { title, slug, description, posterUrl, isPublished, episodes } = body;

    if (!title || !slug || !posterUrl) {
      return NextResponse.json(
        { success: false, error: "Міндетті өрістерді толтырыңыз" },
        { status: 400 }
      );
    }

    // Check unique slug (excluding current drama)
    const existing = await prisma.drama.findMany({
      where: { NOT: { id } },
      select: { slug: true },
    });

    const existingSlugs = existing
      .map((d) => d.slug)
      .filter((s): s is string => typeof s === 'string');

    const finalSlug =
      slug === (await prisma.drama.findUnique({ where: { id } }))?.slug
        ? slug
        : ensureUniqueSlug(slug, async (candidate) => {
            return existingSlugs.includes(candidate);
          });

    // Replace episodes strategy: delete and recreate
    await prisma.episode.deleteMany({ where: { dramaId: id } });

    const drama = await prisma.drama.update({
      where: { id },
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
    console.error("Update drama error:", err);
    return NextResponse.json(
      { success: false, error: "Дорама жаңарту қатесі" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.drama.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete drama error:", err);
    return NextResponse.json({ success: false, error: "Жою қатесі" }, { status: 500 });
  }
}
