const toPositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export class PurchaseReceiptDraftResumeError extends Error {
  constructor(message, { code, receiptId = null, purchaseOrderId = null, cause = null } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'PurchaseReceiptDraftResumeError';
    this.code = code || 'RESUME_FAILED';
    this.receiptId = receiptId;
    this.purchaseOrderId = purchaseOrderId;
    this.cause = cause;
  }
}

export const resumePurchaseReceiptDraft = async ({
  purchaseOrderId,
  receiptId,
  previousFailure,
  getReceipt,
}) => {
  if (typeof getReceipt !== 'function') {
    throw new TypeError('getReceipt must be a function');
  }

  const expectedPurchaseOrderId = toPositiveInt(purchaseOrderId);
  const candidateReceiptId = toPositiveInt(receiptId) || toPositiveInt(previousFailure?.receiptId);

  if (!expectedPurchaseOrderId) {
    throw new PurchaseReceiptDraftResumeError('ไม่พบรหัสใบสั่งซื้อสำหรับกลับมารับสินค้าต่อ', {
      code: 'PURCHASE_ORDER_ID_REQUIRED',
    });
  }

  if (!candidateReceiptId) {
    return {
      resumed: false,
      receiptId: null,
      receipt: null,
      reason: 'NO_RECOVERABLE_RECEIPT_ID',
    };
  }

  let receipt;
  try {
    receipt = await getReceipt(candidateReceiptId);
  } catch (error) {
    throw new PurchaseReceiptDraftResumeError(error?.message || 'โหลดใบรับสินค้าที่ค้างอยู่ไม่สำเร็จ', {
      code: 'RECEIPT_LOOKUP_FAILED',
      receiptId: candidateReceiptId,
      purchaseOrderId: expectedPurchaseOrderId,
      cause: error,
    });
  }

  const actualPurchaseOrderId = toPositiveInt(
    receipt?.purchaseOrderId ?? receipt?.purchaseOrder?.id
  );

  if (!receipt?.id || actualPurchaseOrderId !== expectedPurchaseOrderId) {
    throw new PurchaseReceiptDraftResumeError('ใบรับสินค้าที่พบไม่ใช่ของใบสั่งซื้อนี้', {
      code: 'RECEIPT_PURCHASE_ORDER_MISMATCH',
      receiptId: candidateReceiptId,
      purchaseOrderId: expectedPurchaseOrderId,
    });
  }

  const status = String(receipt?.statusReceipt || receipt?.status || '').toUpperCase();
  if (status === 'COMPLETED' || status === 'CANCELLED') {
    throw new PurchaseReceiptDraftResumeError('ใบรับสินค้านี้ถูกปิดแล้ว ไม่สามารถกลับมาแก้ไขต่อได้', {
      code: 'RECEIPT_NOT_RESUMABLE',
      receiptId: candidateReceiptId,
      purchaseOrderId: expectedPurchaseOrderId,
    });
  }

  return {
    resumed: true,
    receiptId: toPositiveInt(receipt.id),
    receipt,
    reason: previousFailure?.receiptId ? 'RECOVERED_FROM_ITEM_SAVE_FAILURE' : 'RESUMED_KNOWN_DRAFT',
  };
};
