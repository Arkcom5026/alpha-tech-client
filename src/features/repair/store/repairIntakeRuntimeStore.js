import { create } from 'zustand';
import { getRepairIntakeContext, createRepairJob } from '../api/repairApi';

const emptyDraft = {
  customerId: '',
  stockItemId: '',
  deviceModel: '',
  reportedSymptoms: '',
  depositPaid: 0,
  estimatedCost: 0,
  technicianId: '',
  technicianNotes: '',
  allowCustomerOverride: false,
};

const initialState = {
  lookup: '',
  context: null,
  loading: false,
  submitting: false,
  searched: false,
  error: null,
  errorCode: null,
  errorDetails: null,
  lastLoadedAt: null,
  createDraft: { ...emptyDraft },
};

const useRepairIntakeRuntimeStore = create((set, get) => ({
  ...initialState,

  setLookupAction: (lookup) => set({ lookup: String(lookup ?? '') }),

  patchCreateDraftAction: (patch) =>
    set((state) => ({
      createDraft: { ...state.createDraft, ...patch },
    })),

  prepareCreateDraftAction: () => {
    const context = get().context;
    set((state) => ({
      createDraft: {
        ...state.createDraft,
        stockItemId: context?.identity?.id || '',
        deviceModel:
          context?.identity?.product?.name ||
          context?.identity?.serialNumber ||
          '',
        customerId: context?.latestSale?.customerId || '',
      },
    }));
  },

  resetAction: () => set({ ...initialState, createDraft: { ...emptyDraft } }),

  loadContextAction: async (lookupInput) => {
    const lookup = String(lookupInput ?? get().lookup ?? '').trim();
    if (!lookup) {
      set({
        searched: true,
        error: 'กรุณาระบุบาร์โค้ดหรือหมายเลขซีเรียล',
        errorCode: 'REPAIR_INVALID_LOOKUP',
      });
      return null;
    }

    set({
      lookup,
      loading: true,
      searched: true,
      error: null,
      errorCode: null,
      errorDetails: null,
    });

    try {
      const context = await getRepairIntakeContext(lookup);
      set({
        context,
        loading: false,
        lastLoadedAt: new Date().toISOString(),
      });
      get().prepareCreateDraftAction();
      return context;
    } catch (error) {
      set({
        context: null,
        loading: false,
        error: error?.message || 'ไม่สามารถค้นหาข้อมูลรับซ่อมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
        errorDetails: error?.details || null,
      });
      return null;
    }
  },

  createRepairJobAction: async (payload) => {
    if (get().submitting) return null;
    set({ submitting: true, error: null, errorCode: null, errorDetails: null });

    try {
      const job = await createRepairJob(payload);
      set({ submitting: false });
      return job;
    } catch (error) {
      set({
        submitting: false,
        error: error?.message || 'ไม่สามารถเปิดใบรับซ่อมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
        errorDetails: error?.details || null,
      });
      return null;
    }
  },
}));

export default useRepairIntakeRuntimeStore;
