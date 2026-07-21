import { create } from 'zustand';
import { getProductTraceByBarcode } from '../api/productTraceApi';

const initialState = {
  lookup: '',
  trace: null,
  loading: false,
  error: null,
  errorCode: null,
  searched: false,
  lastLoadedAt: null,
};

const useProductTraceRuntimeStore = create((set, get) => ({
  ...initialState,

  setLookupAction: (lookup) => set({ lookup: String(lookup ?? '') }),

  clearResultAction: () =>
    set({
      trace: null,
      error: null,
      errorCode: null,
      searched: false,
      lastLoadedAt: null,
    }),

  resetAction: () => set({ ...initialState }),

  loadTraceAction: async (lookupInput) => {
    const lookup = String(lookupInput ?? get().lookup ?? '').trim();

    if (!lookup) {
      set({
        lookup,
        trace: null,
        loading: false,
        searched: true,
        error: 'กรุณาระบุบาร์โค้ดหรือหมายเลขซีเรียล',
        errorCode: 'BARCODE_REQUIRED',
      });
      return null;
    }

    if (get().loading) return null;

    set({
      lookup,
      loading: true,
      error: null,
      errorCode: null,
      searched: true,
    });

    try {
      const trace = await getProductTraceByBarcode(lookup);

      set({
        trace,
        loading: false,
        error: null,
        errorCode: null,
        lastLoadedAt: new Date().toISOString(),
      });

      return trace;
    } catch (error) {
      set({
        trace: null,
        loading: false,
        error: error?.message || 'ไม่สามารถโหลดประวัติสินค้าได้',
        errorCode: error?.code || 'PRODUCT_TRACE_REQUEST_FAILED',
      });
      return null;
    }
  },

  reloadTraceAction: async () => {
    const lookup = get().lookup;
    if (!lookup) return null;
    return get().loadTraceAction(lookup);
  },
}));

export default useProductTraceRuntimeStore;
