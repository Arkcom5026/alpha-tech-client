export const mapHeldCartLinesToSaleItems = ({ cart, validation }) => {
  const validationByKey = new Map(
    (validation?.lines || []).map((item) => [item.lineKey, item])
  );

  return (cart?.lines || []).map((line) => ({
    lineId: line.lineKey,
    lineType: line.lineType,
    type: line.lineType === 'STOCK_ITEM' ? 'STOCK' : 'SIMPLE',
    stockItemId: line.stockItemId,
    simpleLotId: line.simpleLotId,
    productId: line.productId,
    quantity: Number(line.quantity),
    quantityAvailable: Number(line.quantity),
    barcode: line.barcode || '',
    productName: line.productName || '',
    model: line.modelName || '',
    price: Number(line.unitPrice),
    originalPrice: Number(line.unitPrice),
    sellingPrice: Number(line.unitPrice),
    discount: Number(line.discount || 0),
    discountWithoutBill: Number(line.discount || 0),
    billShare: 0,
    heldCartAvailability: validationByKey.get(line.lineKey) || null,
  }));
};

export const projectHeldCartWarning = (validation) => {
  if (!validation) return '';
  if (!validation.ready) {
    return '⚠️ ใบพักมีสินค้าที่ไม่พร้อมขาย กรุณาลบหรือเลือกสินค้าทดแทน';
  }
  if (validation.priceChanged) {
    return '⚠️ ราคาปัจจุบันเปลี่ยนจากวันที่พักรายการ กรุณาตรวจสอบก่อนขาย';
  }
  return '';
};