import { uploadFile, type SavedFile } from './firebase-storage';

export type ReceiptUploadResult = SavedFile & { receiptUrl: string };

export async function uploadPaymentReceipt(file: File): Promise<ReceiptUploadResult> {
  // receipt subdir: payment-receipts
  const saved = await uploadFile(file, 'payment-receipts');
  return {
    ...saved,
    receiptUrl: saved.url,
  };
}


