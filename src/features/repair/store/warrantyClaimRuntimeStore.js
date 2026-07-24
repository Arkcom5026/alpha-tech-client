import { create } from 'zustand';
import {
  listWarrantyClaims,
  getWarrantyClaim,
  updateWarrantyClaimStatus,
} from '../api/repairApi';

const initialState = {
  claims: [],
  selectedClaim: null,
  loading: false,
  submitting: false,
  error: null,
  errorCode: null,
  filters: { status: '', stockItemId: '' },
};

const useWarrantyClaimRuntimeStore = create((set, get) => ({
  ...initialState,

  patchFiltersAction: (patch) =>
    set((state) => ({ filters: { ...state.filters, ...patch } })),

  loadClaimsAction: async (override = {}) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const filters = { ...get().filters, ...override };
      const claims = await listWarrantyClaims(
        Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
      );
      set({ claims: Array.isArray(claims) ? claims : [], loading: false, filters });
      return claims;
    } catch (error) {
      set({
        loading: false,
        error: error?.message || 'ไม่สามารถโหลดรายการเคลมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },

  loadClaimAction: async (claimId) => {
    set({ loading: true, error: null, errorCode: null });
    try {
      const claim = await getWarrantyClaim(claimId);
      set({ selectedClaim: claim, loading: false });
      return claim;
    } catch (error) {
      set({
        selectedClaim: null,
        loading: false,
        error: error?.message || 'ไม่สามารถโหลดรายละเอียดเคลมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },

  updateStatusAction: async (claimId, payload) => {
    set({ submitting: true, error: null, errorCode: null });
    try {
      const claim = await updateWarrantyClaimStatus(claimId, payload);
      set({ selectedClaim: claim, submitting: false });
      return claim;
    } catch (error) {
      set({
        submitting: false,
        error: error?.message || 'ไม่สามารถอัปเดตสถานะเคลมได้',
        errorCode: error?.code || 'REPAIR_REQUEST_FAILED',
      });
      return null;
    }
  },
}));

export default useWarrantyClaimRuntimeStore;
