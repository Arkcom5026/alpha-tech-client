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
  selectedSupplier: null,
  advancePayments: [], // ✅ เพิ่ม state สำหรับเก็บรายการชำระเงินล่วงหน้า

  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),

  // ✅ สร้างการชำระเงินให้ Supplier (Action)
  createSupplierPaymentAction: async (paymentData) => {
    set({ isSupplierPaymentSubmitting: true, supplierPaymentError: null });
    try {
      const response = await createSupplierPayment(paymentData); // ✅ ส่งตรง receiptItems
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

  // ✅ ดึงข้อมูลการชำระเงินล่วงหน้าตาม Supplier พร้อมตั้งค่า Supplier ด้วย
  fetchAdvancePaymentsBySupplierAction: async (supplierId) => {
    try {
      const data = await getAdvancePaymentsBySupplier(supplierId);
      console.log('fetchAdvancePaymentsBySupplierAction data : ', data);
      if (data?.length > 0) {
        set({ advancePayments: data, selectedSupplier: data[0].supplier });
      } else {
        set({ advancePayments: [], selectedSupplier: null });
      }
    } catch (err) {
      console.error('❌ fetchAdvancePaymentsBySupplierAction error:', err);
    }
  },
}));

export default useSupplierPaymentStore;
