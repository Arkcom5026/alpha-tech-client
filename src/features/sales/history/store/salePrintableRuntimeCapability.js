import { searchPrintableSales } from '../api/saleHistoryApi';
import { devError } from '../../shared/saleStoreSupport';

export const createSalePrintableRuntimeCapability = (set) => ({
  printableSales: [],

  loadPrintableSalesAction: async (params = {}) => {
    const fromDate = params?.fromDate;
    const toDate = params?.toDate;
    const keyword = params?.keyword || '';
    const limitParsed = parseInt(params?.limit, 10);
    const limit = Math.min(Math.max(Number.isFinite(limitParsed) ? limitParsed : 100, 1), 500);

    set({ loading: true, error: null });

    try {
      const data = await searchPrintableSales({
        fromDate,
        toDate,
        keyword,
        limit,
        ...(params?.onlyUnpaid ? { onlyUnpaid: params.onlyUnpaid } : {}),
        ...(params?.onlyPaid ? { onlyPaid: params.onlyPaid } : {}),
      });

      set({ printableSales: Array.isArray(data) ? data : [] });
      return { ok: true };
    } catch (error) {
      devError('❌ [loadPrintableSalesAction] error:', error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'โหลดรายการใบขายย้อนหลังไม่สำเร็จ';
      set({ printableSales: [], error: message });
      return { ok: false, error: message };
    } finally {
      set({ loading: false });
    }
  },
});
