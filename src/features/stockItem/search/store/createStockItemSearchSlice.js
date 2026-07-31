import { searchStockItem } from '..';

export const createStockItemSearchSlice = () => ({
  searchStockItemAction: async (query) => {
    try {
      return await searchStockItem(query);
    } catch (error) {
      console.error('❌ ค้นหา stockItem ล้มเหลว:', error);
      return null;
    }
  },
});
