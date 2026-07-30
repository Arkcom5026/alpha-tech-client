// stockItemStore.js — compatibility store while StockItem capabilities migrate to owned slices
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { loadAvailableStockItems } from '../availability';
import { createStockItemReceiveSlice } from '../receive/store/createStockItemReceiveSlice';
import { createStockItemSearchSlice } from '../search/store/createStockItemSearchSlice';
import { createStockItemSoldSlice } from '../sold/store/createStockItemSoldSlice';

const useStockItemStore = create(
  devtools((set, get) => ({
    ...createStockItemReceiveSlice(set, get),
    ...createStockItemSearchSlice(set, get),
    ...createStockItemSoldSlice(set, get),

    loadAvailableStockItemsAction: async (productId) => {
      try {
        return await loadAvailableStockItems(productId);
      } catch (error) {
        console.error('❌ ดึง stockItem ที่พร้อมขายล้มเหลว:', error);
        return [];
      }
    },
  }))
);

export default useStockItemStore;
