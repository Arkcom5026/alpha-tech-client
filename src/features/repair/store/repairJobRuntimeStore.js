import { create } from 'zustand';
import {
  listRepairJobs,
  getRepairJob,
  updateRepairJobStatus,
  addRepairPart,
  openWarrantyClaimFromRepair,
} from '../api/repairApi';

const initialState = {
  jobs: [],
  selectedJob: null,
  loading: false,
  submitting: false,
  error: null,
  errorCode: null,
  filters: { status: '', stockItemId: '', customerId: '' },
};

const useRepairJobRuntimeStore = create((set, get) => ({
  ...initialState,

  patchFiltersAction: (patch) =>
    set((state) => ({ filters: { ...state.filters, ...patch } })),

  clearErrorAction: () => set({ error: null, errorCode: null }),

  loadJobsAction: async (override = {}) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const filters = { ...get().filters, ...override };
      const jobs = await listRepairJobs(
        Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
      );
      set({ jobs: Array.isArray(jobs) ? jobs : [], loading: false, filters });
      return jobs;
    } catch (error) {
      set({
        loading: false,
        error: error?.message || 'ไม่สามารถโหลดรายการงานซ่อมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },

  loadJobAction: async (repairJobId) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const job = await getRepairJob(repairJobId);
      set({ selectedJob: job, loading: false });
      return job;
    } catch (error) {
      set({
        selectedJob: null,
        loading: false,
        error: error?.message || 'ไม่สามารถโหลดรายละเอียดงานซ่อมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },

  updateStatusAction: async (repairJobId, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const job = await updateRepairJobStatus(repairJobId, payload);
      set({ selectedJob: job, submitting: false });
      return job;
    } catch (error) {
      set({
        submitting: false,
        error: error?.message || 'ไม่สามารถอัปเดตสถานะงานซ่อมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },

  addPartAction: async (repairJobId, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const part = await addRepairPart(repairJobId, payload);
      const refreshed = await getRepairJob(repairJobId);
      set({ selectedJob: refreshed, submitting: false });
      return part;
    } catch (error) {
      set({
        submitting: false,
        error: error?.message || 'ไม่สามารถเบิกอะไหล่ได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },

  openClaimAction: async (repairJobId, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const claim = await openWarrantyClaimFromRepair(repairJobId, payload);
      const refreshed = await getRepairJob(repairJobId);
      set({ selectedJob: refreshed, submitting: false });
      return claim;
    } catch (error) {
      set({
        submitting: false,
        error: error?.message || 'ไม่สามารถเปิดรายการเคลมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },
}));

export default useRepairJobRuntimeStore;
