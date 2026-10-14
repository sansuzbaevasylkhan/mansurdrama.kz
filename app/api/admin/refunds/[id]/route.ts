import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/notifications";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const { id } = params;
    const body = await request.json();
    const { status, adminComment } = body;

    if (!["APPROVED", "REJECTED", "PROCESSING", "REFUNDED"].includes(status)) {
      return NextResponse.json({ error: "Жарамсыз мәртебе" }, { status: 400 });
    }

    const refund = await prisma.refundRequest.update({
      where: { id },
      data: {
        status,
        adminComment,
      },
    });

    // Notify user about refund status change
    await prisma.notification.create({
      data: {
        userId: refund.userId,
        title: 'Қайтару өтінішінің мәртебесі',
        body: `Сіздің өтінішіңіздің мәртебесі өзгерді: ${status}. ${adminComment || ''}`,
        type: 'PAYMENT',
      }
    });

    await sendPushNotification(
      refund.userId,
      'Refund мәртебесі 💸',
      `Сіздің қайтару өтінішіңіздің мәртебесі өзгерді: ${status}.`,
      { type: 'REFUND_STATUS', refundId: id }
    );

    return NextResponse.json({ success: true, refund });
  } catch (error) {
    console.error("[REFUND_ADMIN_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Мәртебені өзгерту мүмкін болмады" }, { status: 500 });
  }
}
