export const validateSaleCompletion = ({ saleItems, saleMode, customerId, isSubmitting }) => {
  if (!(saleItems || []).length || isSubmitting) {
    return { ok: false, error: 'ยังไม่มีรายการสินค้าในตะกร้า' };
  }

  if (saleMode === 'CREDIT' && !customerId) {
    return { ok: false, error: 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน' };
  }

  const invalidSimple = (saleItems || []).find((item) => (
    item.lineType === 'SIMPLE' && (
      !item.simpleLotId ||
      !item.productId ||
      Number(item.quantityAvailable) <= 0 ||
      Number(item.quantity) <= 0 ||
      Number(item.quantity) > Number(item.quantityAvailable)
    )
  ));

  if (invalidSimple) {
    return {
      ok: false,
      error: 'ข้อมูล SimpleLot ไม่พร้อมสำหรับการขาย',
      code: 'SIMPLE_LOT_NOT_SELLABLE',
    };
  }

  return { ok: true };
};
