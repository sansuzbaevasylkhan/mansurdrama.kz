import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Авторизация қажет" }, { status: 401 });
    }

    const body = await request.json();
    const { token, deviceType } = body;

    if (!token) {
      return NextResponse.json({ error: "Token міндетті" }, { status: 400 });
    }

    const pushToken = await prisma.pushToken.upsert({
      where: { userId: session.userId },
      update: {
        token,
        deviceType,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        token,
        deviceType,
      },
    });

    return NextResponse.json({ success: true, pushToken });
  } catch (error) {
    console.error("[PUSH_TOKEN_ERROR]", error);
    return NextResponse.json({ error: "Token-ді сақтау мүмкін болмады" }, { status: 500 });
  }
}
