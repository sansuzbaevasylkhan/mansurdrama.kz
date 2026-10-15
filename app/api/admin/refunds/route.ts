import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  const session = await getSessionFromToken(token);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ" }, { status: 403 });
  }

  try {
    const refunds = await prisma.refundRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
        payment: {
          include: {
            drama: {
              select: { title: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("[ADMIN_REFUND_GET_ERROR]", error);
    return NextResponse.json({ error: "Деректерді алу мүмкін болмады" }, { status: 500 });
  }
}
