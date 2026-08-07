const requireFunction = (value, name) => {
  if (typeof value !== 'function') {
    throw new TypeError(`${name} must be a function`);
  }
};

export class PurchaseReceiptItemSaveError extends Error {
  constructor(message, { stage, receiptId = null, createdReceipt = null, cause = null } = {}) {
    super(message);
    this.name = 'PurchaseReceiptItemSaveError';
    this.stage = stage || 'UNKNOWN';
    this.receiptId = receiptId;
    this.createdReceipt = createdReceipt;
    this.cause = cause;
  }
}

export const savePurchaseReceiptItem = async ({
  receiptId,
  purchaseOrderId,
  receiptHeader,
  item,
  createReceipt,
  addReceiptItem,
}) => {
  requireFunction(createReceipt, 'createReceipt');
  requireFunction(addReceiptItem, 'addReceiptItem');

  const purchaseOrderItemId = Number(item?.purchaseOrderItemId ?? item?.id);
  const quantity = Number(item?.quantity);
  const costPrice = Number(item?.costPrice);

  if (!purchaseOrderItemId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(costPrice) || costPrice < 0) {
    throw new PurchaseReceiptItemSaveError('ข้อมูลรายการรับสินค้าไม่ถูกต้อง', {
      stage: 'VALIDATION',
      receiptId: Number(receiptId) || null,
    });
  }

  let activeReceiptId = Number(receiptId) || null;
  let createdReceipt = null;

  if (!activeReceiptId) {
    try {
      createdReceipt = await createReceipt({
        purchaseOrderId: Number(purchaseOrderId),
        ...(receiptHeader || {}),
      });
    } catch (error) {
      throw new PurchaseReceiptItemSaveError(error?.message || 'สร้างหัวใบรับสินค้าไม่สำเร็จ', {
        stage: 'CREATE_RECEIPT',
        cause: error,
      });
    }

    activeReceiptId = Number(createdReceipt?.id);
    if (!activeReceiptId) {
      throw new PurchaseReceiptItemSaveError('createReceipt returned empty id', {
        stage: 'CREATE_RECEIPT',
        createdReceipt,
      });
    }
  }

  let savedItem;
  try {
    savedItem = await addReceiptItem({
      purchaseOrderReceiptId: activeReceiptId,
      purchaseOrderItemId,
      quantity,
      costPrice,
      forceAccept: Boolean(item?.forceAccept),
    });
  } catch (error) {
    throw new PurchaseReceiptItemSaveError(error?.message || 'บันทึกรายการรับสินค้าไม่สำเร็จ', {
      stage: 'SAVE_ITEM',
      receiptId: activeReceiptId,
      createdReceipt,
      cause: error,
    });
  }

  return {
    receiptId: activeReceiptId,
    createdReceipt,
    savedItem,
  };
};
