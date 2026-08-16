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
  supplierPayments: [],
  isSupplierPaymentLoading: false,
  isSupplierPaymentSubmitting: false,
  supplierPaymentError: null,
  selectedSupplier: null,

  advancePayments: [],
  advancePaymentsBySupplier: {},

  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),

  createSupplierPaymentAction: async (paymentData) => {
    if (get().isSupplierPaymentSubmitting) {
      throw new Error('กำลังบันทึกการชำระเงินผู้ขายอยู่ กรุณารอสักครู่');
    }
    set({ isSupplierPaymentSubmitting: true, supplierPaymentError: null });
    try {
      return await createSupplierPayment(paymentData);
    } catch (err) {
      console.error('❌ [createSupplierPaymentAction] error:', err);
      set({ supplierPaymentError: err?.message || 'เกิดข้อผิดพลาด' });
      throw err;
    } finally {
      set({ isSupplierPaymentSubmitting: false });
    }
  },

  fetchAllSupplierPaymentsAction: async () => {
    set({ isSupplierPaymentLoading: true, supplierPaymentError: null });
    try {
      const data = await getAllSupplierPayments();
      set({ supplierPayments: data, isSupplierPaymentLoading: false });
      return data;
    } catch (err) {
      console.error('❌ [fetchAllSupplierPaymentsAction] error:', err);
      set({ isSupplierPaymentLoading: false, supplierPaymentError: err?.message || 'ไม่สามารถโหลดข้อมูลได้' });
      throw err;
    }
  },

  deleteSupplierPaymentAction: async (paymentId) => {
    if (get().isSupplierPaymentSubmitting) {
      throw new Error('กำลังบันทึกการชำระเงินผู้ขายอยู่ กรุณารอสักครู่');
    }
    set({ isSupplierPaymentSubmitting: true, supplierPaymentError: null });
    try {
      await deleteSupplierPayment(paymentId);
      const current = get().supplierPayments || [];
      const updated = current.filter((p) => p.id !== paymentId);
      set({ supplierPayments: updated });
      return true;
    } catch (err) {
      console.error('❌ [deleteSupplierPaymentAction] error:', err);
      set({ supplierPaymentError: err?.message || 'ลบข้อมูลไม่สำเร็จ' });
      throw err;
    } finally {
      set({ isSupplierPaymentSubmitting: false });
    }
  },

  fetchSupplierPaymentsBySupplierIdAction: async (supplierId) => {
    try {
      const data = await getSupplierPaymentsBySupplier(supplierId);
      if (Array.isArray(data) && data.length > 0) {
        set({ supplierPayments: data, selectedSupplier: data[0].supplier || null, supplierPaymentError: null });
      } else {
        set({ supplierPayments: [], selectedSupplier: null, supplierPaymentError: null });
      }
      return data;
    } catch (err) {
      console.error('❌ [fetchSupplierPaymentsBySupplierIdAction] error:', err);
      set({ supplierPaymentError: err?.message || 'ไม่สามารถโหลดประวัติการชำระเงินผู้ขายได้' });
      throw err;
    }
  },

  fetchAdvancePaymentsBySupplierAction: async (supplierId) => {
    if (!supplierId) return [];
    try {
      const data = await getAdvancePaymentsBySupplier(supplierId);
      const normalized = Array.isArray(data) ? data : [];
      set((state) => ({
        advancePayments: normalized,
        advancePaymentsBySupplier: {
          ...state.advancePaymentsBySupplier,
          [supplierId]: normalized,
        },
        selectedSupplier: normalized?.[0]?.supplier || state.selectedSupplier || null,
        supplierPaymentError: null,
      }));
      return normalized;
    } catch (err) {
      console.error('❌ [fetchAdvancePaymentsBySupplierAction] error:', err);
      set({ supplierPaymentError: err?.message || 'ไม่สามารถโหลดประวัติการชำระเงินล่วงหน้าได้' });
      throw err;
    }
  },

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
