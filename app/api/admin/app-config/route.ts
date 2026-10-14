import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { latestVersion, minimumSupportedVersion, forceUpdate, storeUrl, message } = body;

    const config = await prisma.appConfig.upsert({
      where: { id: "singleton" },
      update: {
        latestVersion,
        minimumSupportedVersion,
        forceUpdate,
        storeUrl,
        message,
      },
      create: {
        id: "singleton",
        latestVersion,
        minimumSupportedVersion,
        forceUpdate,
        storeUrl,
        message,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("[APP_CONFIG_ERROR]", error);
    return NextResponse.json({ error: "Конфигурацияны сақтау мүмкін болмады" }, { status: 500 });
  }
}
