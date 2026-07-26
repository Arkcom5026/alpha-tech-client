import apiClient from '@/utils/apiClient';

export const searchSaleItems = async (query) => {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) throw new Error('กรุณาระบุบาร์โค้ดที่ต้องการค้นหา');

  const response = await apiClient.get('/sales/items/search', {
    params: { query: normalizedQuery },
  });

  const items = Array.isArray(response?.data?.items) ? response.data.items : [];
  return { items };
};

export const mapSaleSearchItemToCartLine = (item, priceType = 'retail') => {
  const type = String(item?.type || '').toUpperCase();
  const unitPrice = Number(item?.prices?.[priceType] ?? 0) || 0;
  const productId = Number(item?.productId ?? item?.product?.id);

  if (type === 'STOCK') {
    const stockItemId = Number(item?.stockItemId);
    if (!Number.isInteger(stockItemId) || stockItemId <= 0 || !Number.isInteger(productId) || productId <= 0) {
      throw new Error('ข้อมูล StockItem จากระบบไม่ครบ');
    }

    return {
      lineId: `stock-${stockItemId}`,
      lineType: 'STOCK_ITEM',
      type: 'STOCK',
      stockItemId,
      simpleLotId: null,
      productId,
      quantity: 1,
      quantityAvailable: 1,
      barcode: String(item?.barcode || ''),
      productName: item?.product?.name || '',
      model: item?.product?.model || '',
      price: unitPrice,
      originalPrice: unitPrice,
      sellingPrice: unitPrice,
      discount: 0,
      discountWithoutBill: 0,
      billShare: 0,
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
      lineId: `simple-${simpleLotId}`,
      lineType: 'SIMPLE',
      type: 'SIMPLE',
      stockItemId: null,
      simpleLotId,
      productId,
      quantity: 1,
      quantityAvailable,
      barcode: String(item?.barcode || ''),
      productName: item?.product?.name || '',
      model: item?.product?.model || '',
      price: unitPrice,
      originalPrice: unitPrice,
      sellingPrice: unitPrice,
      discount: 0,
      discountWithoutBill: 0,
      billShare: 0,
    };
  }

  throw new Error(`ไม่รองรับประเภทรายการขาย: ${type || 'UNKNOWN'}`);
};
