import apiClient from '@/utils/apiClient';

export const searchSaleItems = async (query) => {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) throw new Error('กรุณาระบุบาร์โค้ด, SN, ชื่อ หรือรุ่นสินค้า');

  const response = await apiClient.get('/sales/items/search', {
    params: { query: normalizedQuery },
  });

  const payload = response?.data || {};
  return {
    query: payload.query || normalizedQuery,
    matchMode: payload.matchMode || 'TEXT',
    autoSelect: Boolean(payload.autoSelect),
    total: Number(payload.total || 0),
    truncated: Boolean(payload.truncated),
    message: payload.message || null,
    items: Array.isArray(payload.items) ? payload.items : [],
  };
};

export const mapSaleSearchItemToCartLine = (item, priceType = 'retail') => {
  const type = String(item?.type || '').toUpperCase();
  const unitPrice = Number(item?.prices?.[priceType] ?? 0) || 0;
  const productId = Number(item?.productId ?? item?.product?.id);
  const common = {
    productId,
    quantity: 1,
    barcode: String(item?.barcode || ''),
    serialNumber: item?.serialNumber || null,
    productName: item?.product?.name || '',
    model: item?.product?.model || item?.product?.codeType || '',
    brandName: item?.product?.brandName || item?.product?.brand?.name || '',
    price: unitPrice,
    originalPrice: unitPrice,
    sellingPrice: unitPrice,
    discount: 0,
    discountWithoutBill: 0,
    billShare: 0,
  };

  if (type === 'STOCK') {
    const stockItemId = Number(item?.stockItemId);
    if (!Number.isInteger(stockItemId) || stockItemId <= 0 || !Number.isInteger(productId) || productId <= 0) {
      throw new Error('ข้อมูล StockItem จากระบบไม่ครบ');
    }
    return {
      ...common,
      lineId: `stock-${stockItemId}`,
      lineType: 'STOCK_ITEM',
      type: 'STOCK',
      stockItemId,
      simpleLotId: null,
      quantityAvailable: 1,
    };
  }

  if (type === 'SIMPLE') {
    const simpleLotId = Number(item?.simpleLotId);
    const quantityAvailable = Number(item?.quantityAvailable ?? item?.qtyRemaining ?? 0);
    if (item?.status !== 'ACTIVE') throw new Error('ล็อตสินค้าไม่อยู่ในสถานะ ACTIVE');
    if (!Number.isFinite(quantityAvailable) || quantityAvailable <= 0) throw new Error('ล็อตสินค้าไม่มีจำนวนคงเหลือ');
    if (!Number.isInteger(simpleLotId) || simpleLotId <= 0 || !Number.isInteger(productId) || productId <= 0) {
      throw new Error('ข้อมูล SimpleLot จากระบบไม่ครบ');
    }
    return {
      ...common,
      lineId: `simple-${simpleLotId}`,
      lineType: 'SIMPLE',
      type: 'SIMPLE',
      stockItemId: null,
      simpleLotId,
      quantityAvailable,
    };
  }

  throw new Error(`ไม่รองรับประเภทรายการขาย: ${type || 'UNKNOWN'}`);
};
