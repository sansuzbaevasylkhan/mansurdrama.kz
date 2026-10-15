import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Simple semver-like comparison
 * Returns:
 *  1 if v1 > v2
 *  0 if v1 == v2
 * -1 if v1 < v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const length = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < length; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');
    const platform = searchParams.get('platform');

    if (!version) {
      return NextResponse.json({ error: "version параметрі міндетті" }, { status: 400 });
    }

    const config = await prisma.appConfig.findUnique({
      where: { id: "singleton" },
    });

    if (!config) {
      return NextResponse.json({ error: "Конфигурация табылмады" }, { status: 404 });
    }

    let forceUpdate = false;

    // Compare current version with minimum supported version
    if (compareVersions(version, config.minimumSupportedVersion) === -1) {
      forceUpdate = true;
    }

    return NextResponse.json({
      forceUpdate,
      latestVersion: config.latestVersion,
      message: config.message,
      storeUrl: config.storeUrl,
    });
  } catch (error) {
    console.error("[APP_VERSION_ERROR]", error);
    return NextResponse.json({ error: "Сервер қатесі" }, { status: 500 });
  }
}
