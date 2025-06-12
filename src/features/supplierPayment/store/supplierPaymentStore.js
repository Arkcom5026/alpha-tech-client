import { create } from 'zustand';
import {
  createSupplierPayment,
  getSupplierPaymentsByPO,
  deleteSupplierPayment,
  getAllSupplierPayments,
  getAdvancePaymentsBySupplier,
} from '../api/supplierPaymentApi';

const useSupplierPaymentStore = create((set, get) => ({
  supplierPayments: [],
  isSupplierPaymentLoading: false,
  isSupplierPaymentSubmitting: false,
  supplierPaymentError: null,

  // ✅ สร้างการชำระเงินให้ Supplier
  createSupplierPaymentAction: async (paymentData) => {
    set({ isSupplierPaymentSubmitting: true, supplierPaymentError: null });
    try {
      const response = await createSupplierPayment(paymentData);
      set({ isSupplierPaymentSubmitting: false });
      return response;
    } catch (err) {
      console.error('❌ [createSupplierPaymentAction] error:', err);
      set({ isSupplierPaymentSubmitting: false, supplierPaymentError: err.message || 'เกิดข้อผิดพลาด' });
      return null;
    }
  },

  // ✅ ดึงรายการชำระเงินทั้งหมด
  fetchAllSupplierPaymentsAction: async () => {
    set({ isSupplierPaymentLoading: true, supplierPaymentError: null });
    try {
      const data = await getAllSupplierPayments();
      set({ supplierPayments: data, isSupplierPaymentLoading: false });
    } catch (err) {
      console.error('❌ [fetchAllSupplierPaymentsAction] error:', err);
      set({ isSupplierPaymentLoading: false, supplierPaymentError: err.message || 'ไม่สามารถโหลดข้อมูลได้' });
    }
  },

  // ✅ ดึงรายการชำระเงินของ PO ใด PO หนึ่ง
  fetchSupplierPaymentsByPOAction: async (poId) => {
    set({ isSupplierPaymentLoading: true, supplierPaymentError: null });
    try {
      const data = await getSupplierPaymentsByPO(poId);
      set({ supplierPayments: data, isSupplierPaymentLoading: false });
    } catch (err) {
      console.error('❌ [fetchSupplierPaymentsByPOAction] error:', err);
      set({ isSupplierPaymentLoading: false, supplierPaymentError: err.message || 'ไม่สามารถโหลดข้อมูล PO นี้ได้' });
    }
  },

  // ✅ ลบรายการชำระเงิน
  deleteSupplierPaymentAction: async (paymentId) => {
    try {
      await deleteSupplierPayment(paymentId);
      const current = get().supplierPayments || [];
      const updated = current.filter((p) => p.id !== paymentId);
      set({ supplierPayments: updated });
    } catch (err) {
      console.error('❌ [deleteSupplierPaymentAction] error:', err);
      set({ supplierPaymentError: err.message || 'ลบข้อมูลไม่สำเร็จ' });
    }
  },



  fetchAdvancePaymentsBySupplierAction: async (supplierId) => {
    try {
      const data = await getAdvancePaymentsBySupplier(supplierId);
      set({ advancePayments: data });
    } catch (err) {
      console.error('❌ fetchAdvancePaymentsBySupplierAction error:', err);
    }
  },
}));


export default useSupplierPaymentStore;
