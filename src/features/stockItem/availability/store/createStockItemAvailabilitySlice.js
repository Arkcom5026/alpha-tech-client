import { loadAvailableStockItems } from '..';

export const createStockItemAvailabilitySlice = () => ({
  loadAvailableStockItemsAction: async (productId) => {
    try {
      return await loadAvailableStockItems(productId);
    } catch (error) {
      console.error('❌ ดึง stockItem ที่พร้อมขายล้มเหลว:', error);
      return [];
    }
  },
});
