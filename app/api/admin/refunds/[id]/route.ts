import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-guards";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/push";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const { id } = params;
    const body = await request.json();
    const { action, adminNote } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Жарамсыз әрекет" }, { status: 400 });
    }

    const refund = await prisma.refundRequest.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!refund) {
      return NextResponse.json({ error: "Өтініш табылмады" }, { status: 404 });
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    // Logic for approval: Revoke content access
    if (action === "approve") {
      const payment = refund.payment;
      if (payment) {
        if (payment.type === "SINGLE_EPISODE") {
          await prisma.unlockedContent.deleteMany({
            where: {
              userId: payment.userId,
              dramaId: payment.dramaId,
              episodeNumber: payment.episodeNumber,
            },
          });
        } else if (payment.type === "FULL_PACKAGE") {
          await prisma.unlockedContent.deleteMany({
            where: {
              userId: payment.userId,
              dramaId: payment.dramaId,
              episodeNumber: null,
            },
          });
        }
      }
    }

    const updatedRefund = await prisma.refundRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminComment: adminNote,
      },
    });

    // Consistent notification using lib/push
    await notifyUser(
      updatedRefund.userId,
      {
        title: action === "approve" ? "Қайтару мақұлданды! 💸" : "Қайтару өтініші қабылданбады",
        body: `${action === "approve" ? "Сіздің төлеміңізді қайтару мақұлданды. Қолжетімділік жойылды." : "Өтінішіңіз қабылданбады."} ${adminNote || ''}`,
        data: { type: 'REFUND', status: newStatus }
      },
      'payments'
    );

    return NextResponse.json({
      success: true,
      refund: updatedRefund,
      message: action === "approve" ? "Қолжетімділік жойылды. Ақшаны қолмен қайтаруды ұмытпаңыз." : "Өтініш қабылданбады."
    });
  } catch (error) {
    console.error("[REFUND_ADMIN_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Мәртебені өзгерту мүмкін болмады" }, { status: 500 });
  }
}
