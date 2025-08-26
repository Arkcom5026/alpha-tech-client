// ✅ bankStore.js – จัดการสถานะธนาคารด้วย Zustand (CRUD + ฟิลเตอร์)
import { create } from 'zustand';
import {
  getAllBanks,
  getBankById,
  createBank,
  updateBank as apiUpdateBank,
  deleteBank as apiDeleteBank,
} from '@/features/bank/api/bankApi';

const sortByNameAsc = (arr) =>
  [...arr].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'th')); // เรียงตามชื่อ (ไทย/อังกฤษ)

const useBankStore = create((set, get) => ({
  // --- state ---
  banks: [],
  bankLoading: false,
  bankSaving: false, // ใช้ตอน create/update
  bankDeletingId: null, // ใช้ตอน delete เฉพาะรายการ
  bankError: null,

  // ฟิลเตอร์การค้นหา
  query: '',
  includeInactive: false,

  // รายการที่เลือก (สำหรับหน้าแก้ไข/รายละเอียด)
  selectedBank: null,

  // --- actions ---
  setQuery: (q) => set({ query: q ?? '' }),
  setIncludeInactive: (val) => set({ includeInactive: !!val }),
  clearError: () => set({ bankError: null }),
  clearBanks: () => set({ banks: [] }),

  // โหลดรายการธนาคารทั้งหมดตามฟิลเตอร์
  fetchBanksAction: async (params = {}) => {
    try {
      const q = params.q ?? get().query;
      const includeInactive = params.includeInactive ?? get().includeInactive;
      set({ bankLoading: true, bankError: null });
      const banks = await getAllBanks({ q, includeInactive });
      set({ banks: sortByNameAsc(banks) });
    } catch (err) {
      console.error('❌ โหลดธนาคารล้มเหลว:', err);
      set({ bankError: 'ไม่สามารถโหลดรายชื่อธนาคารได้' });
    } finally {
      set({ bankLoading: false });
    }
  },

  // โหลดธนาคารรายตัวเพื่อแก้ไข/ดูรายละเอียด
  fetchBankByIdAction: async (id) => {
    try {
      set({ bankLoading: true, bankError: null, selectedBank: null });
      const bank = await getBankById(id);
      set({ selectedBank: bank });
      return bank;
    } catch (err) {
      console.error('❌ โหลดธนาคารรายตัวล้มเหลว:', err);
      set({ bankError: 'ไม่สามารถโหลดข้อมูลธนาคารได้' });
      return null;
    } finally {
      set({ bankLoading: false });
    }
  },

  // สร้างธนาคารใหม่
  createBankAction: async (payload) => {
    try {
      set({ bankSaving: true, bankError: null });
      const created = await createBank(payload);
      const next = sortByNameAsc([...(get().banks || []), created]);
      set({ banks: next });
      return created;
    } catch (err) {
      console.error('❌ สร้างธนาคารไม่สำเร็จ:', err);
      // โยน error ต่อเพื่อให้หน้า UI แสดงข้อความจาก backend ได้ (เช่น 409 ซ้ำ)
      set({ bankError: 'สร้างธนาคารไม่สำเร็จ' });
      throw err;
    } finally {
      set({ bankSaving: false });
    }
  },

  // อัปเดตธนาคาร
  updateBankAction: async (id, payload) => {
    try {
      set({ bankSaving: true, bankError: null });
      const updated = await apiUpdateBank(id, payload);
      const next = (get().banks || []).map((b) => (b.id === updated.id ? updated : b));
      set({ banks: sortByNameAsc(next), selectedBank: updated });
      return updated;
    } catch (err) {
      console.error('❌ แก้ไขธนาคารไม่สำเร็จ:', err);
      set({ bankError: 'แก้ไขธนาคารไม่สำเร็จ' });
      throw err;
    } finally {
      set({ bankSaving: false });
    }
  },

  // ลบธนาคาร
  deleteBankAction: async (id) => {
    try {
      set({ bankDeletingId: id, bankError: null });
      await apiDeleteBank(id);
      const next = (get().banks || []).filter((b) => b.id !== id);
      set({ banks: next });
      if (get().selectedBank?.id === id) set({ selectedBank: null });
      return true;
    } catch (err) {
      console.error('❌ ลบธนาคารไม่สำเร็จ:', err);
      set({ bankError: 'ลบธนาคารไม่สำเร็จ' });
      throw err;
    } finally {
      set({ bankDeletingId: null });
    }
  },
}));

export default useBankStore;
