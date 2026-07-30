// stockItemStore.js — compatibility store while StockItem capabilities migrate to owned slices
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { loadAvailableStockItems } from '../availability';
import { createStockItemReceiveSlice } from '../receive/store/createStockItemReceiveSlice';
import { searchStockItem } from '../search';
import { markStockItemsAsSold } from '../sold';

const useStockItemStore = create(
  devtools((set, get) => ({
    ...createStockItemReceiveSlice(set, get),

    updateStockItemsToSoldAction: async (stockItemIds = []) => {
      set({ loading: true, error: null });

      try {
        return await markStockItemsAsSold(stockItemIds);
      } catch (error) {
        const message = error?.message || 'อัปเดตสถานะขายแล้วไม่สำเร็จ';
        set({ error: message });
        console.error('❌ อัปเดต stockItem ล้มเหลว:', error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    searchStockItemAction: async (query) => {
      try {
        return await searchStockItem(query);
      } catch (error) {
        console.error('❌ ค้นหา stockItem ล้มเหลว:', error);
        return null;
      }
    },

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
