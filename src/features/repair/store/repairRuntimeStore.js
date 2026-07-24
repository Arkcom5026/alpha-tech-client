import { create } from 'zustand';
import repairApi from '../api/repairApi';

const normalizeCustomer = (payload) => {
  const customer = payload?.customer || payload?.data?.customer || payload?.data || payload;
  return customer?.id ? customer : null;
};

const initialState = {
  intakeLookup: '',
  intakeContext: null,
  selectedCustomer: null,
  customerWarrantyAssets: [],
  jobs: [],
  claims: [],
  activeJob: null,
  activeClaim: null,
  loading: false,
  submitting: false,
  error: null,
  errorCode: null,
  lastLoadedAt: null,
};

const useRepairRuntimeStore = create((set, get) => ({
  ...initialState,

  setIntakeLookup: (value) => set({ intakeLookup: String(value || '') }),
  clearError: () => set({ error: null, errorCode: null }),
  resetIntake: () => set({ intakeLookup: '', intakeContext: null, selectedCustomer: null, customerWarrantyAssets: [], error: null, errorCode: null }),

  clearSelectedCustomer: () =>
    set({ selectedCustomer: null, customerWarrantyAssets: [], intakeContext: null, error: null, errorCode: null }),

  selectCustomer: async (customerPayload) => {
    const customer = normalizeCustomer(customerPayload);
    if (!customer?.id) {
      set({ error: 'ไม่พบ Customer ID จากข้อมูลที่เลือก', errorCode: 'REPAIR_CUSTOMER_ID_MISSING' });
      return null;
    }
    set({ selectedCustomer: customer, intakeContext: null, loading: true, error: null, errorCode: null });
    try {
      const payload = await repairApi.getCustomerWarrantyAssets(customer.id);
      const customerWarrantyAssets = Array.isArray(payload) ? payload : payload?.items || payload?.assets || [];
      set({ customerWarrantyAssets, loading: false, lastLoadedAt: new Date().toISOString() });
      return customerWarrantyAssets;
    } catch (error) {
      set({ customerWarrantyAssets: [], loading: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  loadCustomerWarrantyAssets: async () => {
    const customer = get().selectedCustomer;
    if (!customer?.id) return null;
    return get().selectCustomer(customer);
  },

  selectWarrantyAsset: async (asset) => {
    const identity = asset?.stockItem || asset?.identity || asset;
    const lookup = identity?.barcode || identity?.serialNumber;
    if (lookup) return get().searchIntake(lookup);

    const syntheticContext = {
      ...(asset?.context || {}),
      identity,
      warranty: asset?.warranty || identity?.warranty || null,
      latestSale: asset?.latestSale || null,
    };
    set({ intakeContext: syntheticContext, error: null, errorCode: null });
    return syntheticContext;
  },

  searchIntake: async (lookupInput) => {
    const lookup = String(lookupInput ?? get().intakeLookup).trim();
    if (!lookup) {
      set({ error: 'กรุณาสแกนบาร์โค้ดหรือหมายเลขซีเรียล', errorCode: 'REPAIR_INVALID_LOOKUP' });
      return null;
    }

    set({ loading: true, error: null, errorCode: null, intakeLookup: lookup });
    try {
      const intakeContext = await repairApi.getIntakeContext(lookup);
      set({ intakeContext, loading: false, lastLoadedAt: new Date().toISOString() });
      return intakeContext;
    } catch (error) {
      set({
        intakeContext: null,
        loading: false,
        error: error.message,
        errorCode: error.code,
      });
      return null;
    }
  },

  loadJobs: async (params = {}) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const jobs = await repairApi.listJobs(params);
      set({
        jobs: Array.isArray(jobs) ? jobs : jobs?.items || [],
        loading: false,
        lastLoadedAt: new Date().toISOString(),
      });
      return jobs;
    } catch (error) {
      set({ loading: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  loadClaims: async (params = {}) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const claims = await repairApi.listClaims(params);
      set({
        claims: Array.isArray(claims) ? claims : claims?.items || [],
        loading: false,
        lastLoadedAt: new Date().toISOString(),
      });
      return claims;
    } catch (error) {
      set({ loading: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  loadJob: async (id) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const activeJob = await repairApi.getJob(id);
      set({ activeJob, loading: false });
      return activeJob;
    } catch (error) {
      set({ activeJob: null, loading: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  loadClaim: async (id) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const activeClaim = await repairApi.getClaim(id);
      set({ activeClaim, loading: false });
      return activeClaim;
    } catch (error) {
      set({ activeClaim: null, loading: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  createJob: async (payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const created = await repairApi.createJob(payload);
      set({ submitting: false, activeJob: created });
      return created;
    } catch (error) {
      set({ submitting: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  transitionJob: async (id, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const updated = await repairApi.transitionJob(id, payload);
      set({ submitting: false, activeJob: updated });
      return updated;
    } catch (error) {
      set({ submitting: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  addPart: async (id, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      await repairApi.addPart(id, payload);
      const activeJob = await repairApi.getJob(id);
      set({ submitting: false, activeJob });
      return activeJob;
    } catch (error) {
      set({ submitting: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  openClaim: async (id, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const created = await repairApi.openClaim(id, payload);
      set({ submitting: false, activeClaim: created });
      return created;
    } catch (error) {
      set({ submitting: false, error: error.message, errorCode: error.code });
      return null;
    }
  },

  transitionClaim: async (id, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const updated = await repairApi.transitionClaim(id, payload);
      set({ submitting: false, activeClaim: updated });
      return updated;
    } catch (error) {
      set({ submitting: false, error: error.message, errorCode: error.code });
      return null;
    }
  },
}));

export default useRepairRuntimeStore;
