import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Авторизация қажет" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, reason } = body;

    if (!paymentId || !reason) {
      return NextResponse.json({ error: "Төлем ID және себебі міндетті" }, { status: 400 });
    }

    // Check if refund already exists for this payment
    const existingRefund = await prisma.refundRequest.findUnique({
      where: { paymentId },
    });

    if (existingRefund) {
      return NextResponse.json({ error: "Бұл төлем бойынша өтініш бұрын жіберілген" }, { status: 400 });
    }

    const refund = await prisma.refundRequest.create({
      data: {
        paymentId,
        userId: session.userId,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, refund });
  } catch (error) {
    console.error("[REFUND_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Өтініш жіберу кезінде қате кетті" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Авторизация қажет" }, { status: 401 });
    }

    const refunds = await prisma.refundRequest.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { payment: true },
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("[REFUND_GET_ERROR]", error);
    return NextResponse.json({ error: "Деректерді алу мүмкін болмады" }, { status: 500 });
  }
}
