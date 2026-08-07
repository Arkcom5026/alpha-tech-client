export const mapHeldCartLinesToSaleItems = ({ cart, validation }) => {
  const validationByKey = new Map(
    (validation?.lines || []).map((item) => [item.lineKey, item])
  );

  return (cart?.lines || []).map((line) => {
    const availability = validationByKey.get(line.lineKey) || null;
    const priceAdjustment = Number.isFinite(Number(line.priceAdjustment))
      ? Number(line.priceAdjustment)
      : -Number(line.discount || 0);
    const lineBase = Number(line.unitPrice || 0) * Number(line.quantity || 1);
    const finalPrice = Number.isFinite(Number(line.finalPrice))
      ? Number(line.finalPrice)
      : Math.max(0, lineBase + priceAdjustment);

    return {
      lineId: line.lineKey,
      lineType: line.lineType,
      type: line.lineType === 'STOCK_ITEM' ? 'STOCK' : 'SIMPLE',
      stockItemId: line.stockItemId,
      simpleLotId: line.simpleLotId,
      productId: line.productId,
      quantity: Number(line.quantity),
      quantityAvailable: Number(
        availability?.quantityAvailable ??
          availability?.availableQuantity ??
          availability?.qtyRemaining ??
          line.quantityAvailable ??
          line.availableQuantity ??
          line.qtyRemaining ??
          line.quantity
      ),
      barcode: line.barcode || '',
      productName: line.productName || '',
      model: line.modelName || '',
      price: Number(line.unitPrice),
      originalPrice: Number(line.unitPrice),
      sellingPrice: finalPrice,
      priceAdjustment,
      adjustmentReason: line.adjustmentReason || '',
      discount: priceAdjustment < 0 ? Math.abs(priceAdjustment) : 0,
      discountWithoutBill: priceAdjustment < 0 ? Math.abs(priceAdjustment) : 0,
      billShare: 0,
      heldCartAvailability: availability,
    };
  });
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
