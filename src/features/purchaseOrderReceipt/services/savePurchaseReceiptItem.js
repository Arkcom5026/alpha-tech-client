const requireFunction = (value, name) => {
  if (typeof value !== 'function') {
    throw new TypeError(`${name} must be a function`);
  }
};

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
    throw new Error('ข้อมูลรายการรับสินค้าไม่ถูกต้อง');
  }

  let activeReceiptId = Number(receiptId) || null;
  let createdReceipt = null;

  if (!activeReceiptId) {
    createdReceipt = await createReceipt({
      purchaseOrderId: Number(purchaseOrderId),
      ...(receiptHeader || {}),
    });
    activeReceiptId = Number(createdReceipt?.id);
    if (!activeReceiptId) {
      throw new Error('createReceipt returned empty id');
    }
  }

  const savedItem = await addReceiptItem({
    purchaseOrderReceiptId: activeReceiptId,
    purchaseOrderItemId,
    quantity,
    costPrice,
    forceAccept: Boolean(item?.forceAccept),
  });

  return {
    receiptId: activeReceiptId,
    createdReceipt,
    savedItem,
  };
};
