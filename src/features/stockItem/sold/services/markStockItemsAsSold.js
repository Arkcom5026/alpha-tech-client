import { markStockItemsAsSoldApi } from '../api/markStockItemsAsSoldApi';
import {
  normalizeStockItemIdsForSold,
  projectStockItemSoldError,
} from '../projections/stockItemSoldProjection';

export const markStockItemsAsSold = async (stockItemIds = []) => {
  const ids = normalizeStockItemIdsForSold(stockItemIds);

  if (ids.length === 0) {
    throw new Error('ไม่มีรายการสินค้าที่ต้องอัปเดตเป็นขายแล้ว');
  }

  try {
    return await markStockItemsAsSoldApi(ids);
  } catch (error) {
    throw projectStockItemSoldError(error);
  }
};
