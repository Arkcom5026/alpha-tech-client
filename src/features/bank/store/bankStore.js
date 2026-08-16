import { create } from 'zustand';
import {
  getAllBanks,
  getBankById,
  createBank,
  updateBank as apiUpdateBank,
  deleteBank as apiDeleteBank,
} from '@/features/bank/api/bankApi';

const sortByNameAsc = (arr) =>
  [...arr].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'th'));

const parseBankError = (err, fallback) =>
  err?.response?.data?.error?.message ||
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const useBankStore = create((set, get) => ({
  banks: [],
  bankLoading: false,
  bankSaving: false,
  bankDeletingId: null,
  bankError: null,

  query: '',
  includeInactive: false,
  selectedBank: null,

  setQueryAction: (query) => set({ query: query ?? '' }),
  setIncludeInactiveAction: (includeInactive) => set({ includeInactive: Boolean(includeInactive) }),
  clearErrorAction: () => set({ bankError: null }),
  clearBanksAction: () => set({ banks: [] }),

  fetchBanksAction: async (params = {}) => {
    const q = params.q ?? get().query;
    const includeInactive = params.includeInactive ?? get().includeInactive;

    set({ bankLoading: true, bankError: null, query: q, includeInactive });
    try {
      const banks = await getAllBanks({ q, includeInactive });
      const normalized = Array.isArray(banks) ? banks : banks?.items || banks?.data || [];
      set({ banks: sortByNameAsc(normalized), bankLoading: false });
      return normalized;
    } catch (err) {
      set({
        bankLoading: false,
        bankError: parseBankError(err, 'ไม่สามารถโหลดรายชื่อธนาคารได้'),
      });
      return null;
    }
  },

  fetchBankByIdAction: async (id) => {
    set({ bankLoading: true, bankError: null, selectedBank: null });
    try {
      const bank = await getBankById(id);
      set({ selectedBank: bank, bankLoading: false });
      return bank;
    } catch (err) {
      set({
        bankLoading: false,
        bankError: parseBankError(err, 'ไม่สามารถโหลดข้อมูลธนาคารได้'),
      });
      return null;
    }
  },

  createBankAction: async (payload) => {
    if (get().bankSaving || get().bankDeletingId) {
      throw new Error('กำลังบันทึกข้อมูลธนาคารอยู่ กรุณารอสักครู่');
    }
    set({ bankSaving: true, bankError: null });
    try {
      const created = await createBank(payload);
      set({ banks: sortByNameAsc([...(get().banks || []), created]), bankSaving: false });
      return created;
    } catch (err) {
      set({ bankSaving: false, bankError: parseBankError(err, 'สร้างธนาคารไม่สำเร็จ') });
      throw err;
    }
  },

  updateBankAction: async (id, payload) => {
    if (get().bankSaving || get().bankDeletingId) {
      throw new Error('กำลังบันทึกข้อมูลธนาคารอยู่ กรุณารอสักครู่');
    }
    set({ bankSaving: true, bankError: null });
    try {
      const updated = await apiUpdateBank(id, payload);
      const next = (get().banks || []).map((bank) => (bank.id === updated.id ? updated : bank));
      set({ banks: sortByNameAsc(next), selectedBank: updated, bankSaving: false });
      return updated;
    } catch (err) {
      set({ bankSaving: false, bankError: parseBankError(err, 'แก้ไขธนาคารไม่สำเร็จ') });
      throw err;
    }
  },

  toggleBankActiveAction: async (id) => {
    if (get().bankSaving || get().bankDeletingId) return null;
    const current = (get().banks || []).find((bank) => bank.id === id);
    if (!current) return null;

    return get().updateBankAction(id, { active: !Boolean(current.active) });
  },

  deleteBankAction: async (id) => {
    if (get().bankSaving || get().bankDeletingId) {
      throw new Error('กำลังบันทึกข้อมูลธนาคารอยู่ กรุณารอสักครู่');
    }
    set({ bankDeletingId: id, bankError: null });
    try {
      await apiDeleteBank(id);
      set((state) => ({
        banks: state.banks.filter((bank) => bank.id !== id),
        selectedBank: state.selectedBank?.id === id ? null : state.selectedBank,
        bankDeletingId: null,
      }));
      return true;
    } catch (err) {
      set({
        bankDeletingId: null,
        bankError: parseBankError(err, 'ลบธนาคารไม่สำเร็จ'),
      });
      throw err;
    }
  },
}));

export default useBankStore;
