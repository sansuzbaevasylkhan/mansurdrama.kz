import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { id: "singleton" },
    });

    if (!config) {
      return NextResponse.json({
        latestVersion: "1.0.0",
        minimumSupportedVersion: "1.0.0",
        forceUpdate: false,
        storeUrl: "",
        message: "Конфигурация табылмады"
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("[APP_VERSION_ERROR]", error);
    return NextResponse.json({ error: "Сервер қатесі" }, { status: 500 });
  }
}
