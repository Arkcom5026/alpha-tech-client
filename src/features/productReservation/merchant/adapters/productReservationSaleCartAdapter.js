const asPositiveInteger = (value, field) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`ข้อมูล ${field} ของใบจองไม่ครบ`);
  }
  return parsed;
};

const asMoney = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error('ราคาในใบจองไม่ถูกต้อง');
  return parsed;
};

export const mapProductReservationItemToSaleCartLine = (item) => {
  const productId = asPositiveInteger(item?.productId, 'Product');
  const quantity = asPositiveInteger(item?.quantity, 'จำนวนสินค้า');
  const unitPrice = asMoney(item?.price);
  const stockItemId = item?.stockItemId == null ? null : asPositiveInteger(item.stockItemId, 'StockItem');
  const simpleLotId = item?.simpleLotId == null ? null : asPositiveInteger(item.simpleLotId, 'SimpleLot');

  if (stockItemId && quantity !== 1) {
    throw new Error('สินค้าที่มี Serial Number ต้องขายครั้งละหนึ่งชิ้นต่อ StockItem');
  }
  if (!stockItemId && !simpleLotId) {
    throw new Error('ใบจองไม่มี StockItem หรือ SimpleLot authority');
  }

  const isSimple = Boolean(simpleLotId);
  return {
    lineId: isSimple ? `simple-${simpleLotId}` : `stock-${stockItemId}`,
    lineType: isSimple ? 'SIMPLE' : 'STOCK_ITEM',
    type: isSimple ? 'SIMPLE' : 'STOCK',
    productId,
    stockItemId,
    simpleLotId,
    quantity,
    quantityAvailable: quantity,
    barcode: '',
    serialNumber: null,
    displayIdentifier: isSimple ? `LOT-${simpleLotId}` : `STOCK-${stockItemId}`,
    identifierType: isSimple ? 'LOT' : 'STOCK',
    barcodeAuthority: null,
    productName: String(item?.productName || `Product #${productId}`),
    model: '',
    brandName: '',
    price: unitPrice,
    originalPrice: asMoney(item?.basePrice ?? unitPrice),
    sellingPrice: unitPrice,
    discount: asMoney(item?.discount ?? 0),
    discountWithoutBill: 0,
    billShare: 0,
    reservationItemId: asPositiveInteger(item?.id, 'ReservationItem'),
  };
};

export const createProductReservationSaleCart = (data) => {
  const reservation = data?.reservation;
  const items = Array.isArray(data?.items) ? data.items : [];
  if (!reservation?.id || !reservation?.code) throw new Error('ไม่พบ ProductReservation authority');
  if (!items.length) throw new Error('ใบจองไม่มีรายการสินค้าสำหรับนำเข้าสู่ POS');

  return {
    source: Object.freeze({
      sourceType: 'PRODUCT_RESERVATION',
      sourceId: Number(reservation.id),
      sourceCode: String(reservation.code),
      sourceVersion: Number(reservation.version || 0),
    }),
    lines: items.map(mapProductReservationItemToSaleCartLine),
  };
};
