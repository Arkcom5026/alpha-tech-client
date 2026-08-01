import { getAllSales, getSaleById } from '../api/saleHistoryApi';
import { devError, normalizeSaleDetail } from '../../shared/saleStoreSupport';

export const createSaleHistoryQueryRuntimeCapability = (set, get) => ({
  sales: [],
  currentSale: null,

  loadSalesAction: async () => {
    try {
      const data = await getAllSales();
      set({ sales: data });
    } catch (error) {
      devError('[loadSalesAction]', error);
    }
  },

  setCurrentSale: (saleData) => set({ currentSale: saleData }),
  setCurrentSaleAction: (saleData) => get().setCurrentSale(saleData),

  getSaleByIdAction: async (id) => {
    try {
      const data = await getSaleById(id, { includePayments: true, includeBranch: true });
      set({ currentSale: normalizeSaleDetail(data) });
    } catch (error) {
      devError('[getSaleByIdAction]', error);
      set({ currentSale: null });
    }
  },
});
