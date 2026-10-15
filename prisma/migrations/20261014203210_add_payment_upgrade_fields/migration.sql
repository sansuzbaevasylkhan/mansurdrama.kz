-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "isUpgraded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "upgradeFromPaymentId" TEXT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_upgradeFromPaymentId_fkey" FOREIGN KEY ("upgradeFromPaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
