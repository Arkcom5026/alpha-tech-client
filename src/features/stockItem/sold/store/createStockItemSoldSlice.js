import { markStockItemsAsSold } from '..';

export const createStockItemSoldSlice = (set) => ({
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
});
