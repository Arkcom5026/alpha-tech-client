// supplierPaymentStore.js
// ✅ อัปเดตให้สอดคล้องกับการใช้งานใน PurchaseOrderForm
// - คง state เดิม `advancePayments` เพื่อ backwards-compat
// - เพิ่ม `advancePaymentsBySupplier: { [supplierId]: AdvancePayment[] }` ตามที่หน้า Form ใช้
// - ทุก action ลงท้ายด้วย Action (กฎ #64) และเรียก API ผ่าน ...Api เท่านั้น (กฎ #61)

import { create } from 'zustand';
import {
  createSupplierPayment,
  deleteSupplierPayment,
  getAllSupplierPayments,
  getAdvancePaymentsBySupplier,
  getSupplierPaymentsBySupplier,
} from '../api/supplierPaymentApi';

const useSupplierPaymentStore = create((set, get) => ({
  // ── State ───────────────────────────────────────────────────────────────────
  supplierPayments: [],
  isSupplierPaymentLoading: false,
  isSupplierPaymentSubmitting: false,
  supplierPaymentError: null,
  selectedSupplier: null,

  // เก็บลิสต์รวบยอดแบบเดิม (compat)
  advancePayments: [],
  // เก็บแบบ Map ตาม supplierId → ใช้ใน PurchaseOrderForm
  advancePaymentsBySupplier: {}, // { [supplierId: number]: AdvancePayment[] }

  // ── Setters ────────────────────────────────────────────────────────────────
  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),

  // ── Actions ────────────────────────────────────────────────────────────────
  // สร้างการชำระเงินให้ Supplier
  createSupplierPaymentAction: async (paymentData) => {
    set({ isSupplierPaymentSubmitting: true, supplierPaymentError: null });
    try {
      const response = await createSupplierPayment(paymentData);
      set({ isSupplierPaymentSubmitting: false });
      return response;
    } catch (err) {
      console.error('❌ [createSupplierPaymentAction] error:', err);
      set({ isSupplierPaymentSubmitting: false, supplierPaymentError: err?.message || 'เกิดข้อผิดพลาด' });
      return null;
    }
  },

  // ดึงรายการชำระเงินทั้งหมด
  fetchAllSupplierPaymentsAction: async () => {
    set({ isSupplierPaymentLoading: true, supplierPaymentError: null });
    try {
      const data = await getAllSupplierPayments();
      set({ supplierPayments: data, isSupplierPaymentLoading: false });
    } catch (err) {
      console.error('❌ [fetchAllSupplierPaymentsAction] error:', err);
      set({ isSupplierPaymentLoading: false, supplierPaymentError: err?.message || 'ไม่สามารถโหลดข้อมูลได้' });
    }
  },

  // ลบรายการชำระเงิน
  deleteSupplierPaymentAction: async (paymentId) => {
    try {
      await deleteSupplierPayment(paymentId);
      const current = get().supplierPayments || [];
      const updated = current.filter((p) => p.id !== paymentId);
      set({ supplierPayments: updated });
    } catch (err) {
      console.error('❌ [deleteSupplierPaymentAction] error:', err);
      set({ supplierPaymentError: err?.message || 'ลบข้อมูลไม่สำเร็จ' });
    }
  },

  // ดึงข้อมูลการชำระเงินทั้งหมดของ Supplier
  fetchSupplierPaymentsBySupplierIdAction: async (supplierId) => {
    try {
      const data = await getSupplierPaymentsBySupplier(supplierId);
      if (Array.isArray(data) && data.length > 0) {
        set({ supplierPayments: data, selectedSupplier: data[0].supplier || null });
      } else {
        set({ supplierPayments: [], selectedSupplier: null });
      }
    } catch (err) {
      console.error('❌ [fetchSupplierPaymentsBySupplierIdAction] error:', err);
    }
  },

  // ดึงข้อมูลการชำระเงินล่วงหน้าตาม Supplier และแคชเป็น Map
  fetchAdvancePaymentsBySupplierAction: async (supplierId) => {
    if (!supplierId) return;
    try {
      const data = await getAdvancePaymentsBySupplier(supplierId);
      // อัปเดตทั้งแบบเก่า (array) และแบบ Map ตาม supplierId
      set((state) => ({
        advancePayments: Array.isArray(data) ? data : [],
        advancePaymentsBySupplier: {
          ...state.advancePaymentsBySupplier,
          [supplierId]: Array.isArray(data) ? data : [],
        },
        selectedSupplier: data?.[0]?.supplier || state.selectedSupplier || null,
      }));
    } catch (err) {
      console.error('❌ [fetchAdvancePaymentsBySupplierAction] error:', err);
      // กรณี error ให้เคลียร์เฉพาะช่องของ supplierId นั้น ๆ แต่ไม่ยุ่งกับช่องอื่น
      set((state) => ({
        advancePaymentsBySupplier: { ...state.advancePaymentsBySupplier, [supplierId]: [] },
      }));
    }
  },

  // Utility: ล้างแคชมัดจำของซัพพลายเออร์รายใดรายหนึ่ง
  clearAdvancePaymentsCacheAction: (supplierId) => {
    if (!supplierId) return;
    set((state) => {
      const next = { ...state.advancePaymentsBySupplier };
      delete next[supplierId];
      return { advancePaymentsBySupplier: next };
    });
  },
}));

export default useSupplierPaymentStore;



