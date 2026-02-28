




// src/features/purchaseReport/store/purchaseReportStore.js
import { create } from 'zustand';
import { getPurchaseReport } from '../api/purchaseReportApi';

/**
 * ฟังก์ชันสำหรับสร้างช่วงวันที่ของเดือนปัจจุบัน
 * @returns {{firstDay: string, lastDay: string}} - วันที่แรกและวันที่สุดท้ายของเดือนในรูปแบบ<y_bin_46>-MM-DD
 */
const getCurrentMonthDateRange = () => {
  const date = new Date(); // ใช้เวลาปัจจุบัน
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // ฟังก์ชันช่วยแปลง Date object เป็น string 'YYYY-MM-DD'
  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    firstDay: formatDate(firstDay),
    lastDay: formatDate(lastDay),
  };
};

const { firstDay, lastDay } = getCurrentMonthDateRange();

export const usePurchaseReportStore = create((set, get) => ({
  // =================================================================
  // STATE (สถานะ)
  // =================================================================
  filters: {
    dateFrom: firstDay,
    dateTo: lastDay,
    supplierId: 'all',
    productId: 'all',
    // ✅ Receipt-level statuses (report is based on PurchaseOrderReceipt)
    receiptStatus: 'all',
    paymentStatus: 'all',
  },
  reportData: [],
  // ✅ อัปเดตโครงสร้าง summary ให้ตรงกับ API
  summary: {
    totalAmount: 0,
    totalItems: 0,
    uniqueReceipts: 0,
  },
  isLoading: false,
  error: null,

  // =================================================================
  // ACTIONS (การกระทำ)
  // =================================================================

  /**
   * Action สำหรับอัปเดตค่าใน filters
   * @param {object} newFilters - object ของ filter ใหม่
   */
  // ✅ Standard naming: *Action (keep backward compatibility)
  setFiltersAction: (newFilters) => {
    set({ filters: newFilters });
  },
  // Backward compatible alias (avoid breaking existing imports)
  setFilters: (newFilters) => {
    set({ filters: newFilters });
  },

  /**
   * Action สำหรับดึงข้อมูลรายงานการจัดซื้อจาก API
   */
  fetchPurchaseReportAction: async () => {
    // เริ่มต้นการโหลด
    set({ isLoading: true, error: null });
    try {
      // ดึงค่า filters ปัจจุบันจาก state
      const currentFilters = get().filters;

      // ✨ ตรวจสอบและแก้ไขค่า filters ก่อนส่งไป API
      const filtersToSend = { ...currentFilters };

      // Guard: dateFrom without dateTo -> same day
      if (filtersToSend.dateFrom && !filtersToSend.dateTo) {
        filtersToSend.dateTo = filtersToSend.dateFrom;
      }

      // Normalize: omit "all" to reduce noisy query params
      const normalizeAll = (v) => (v === 'all' || v === '' ? undefined : v);
      filtersToSend.supplierId = normalizeAll(filtersToSend.supplierId);
      filtersToSend.productId = normalizeAll(filtersToSend.productId);
      filtersToSend.receiptStatus = normalizeAll(filtersToSend.receiptStatus);
      filtersToSend.paymentStatus = normalizeAll(filtersToSend.paymentStatus);

      // Remove legacy key to avoid confusion
      delete filtersToSend.status;

      // เรียกใช้ API ด้วย filters ที่แก้ไขแล้ว
      const response = await getPurchaseReport(filtersToSend);

      // อัปเดต state ด้วยข้อมูลที่ได้รับจาก API
      set({
        reportData: response.data,
        summary: response.summary,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch purchase report:', err);
      // หากเกิดข้อผิดพลาด, อัปเดต state
      set({
        isLoading: false,
        error: 'ไม่สามารถดึงข้อมูลรายงานได้',
        reportData: [],
        summary: { totalAmount: 0, totalItems: 0, uniqueReceipts: 0 },
      });
    }
  },
  // Backward compatible alias (avoid breaking existing calls)
  fetchPurchaseReport: async () => {
    return get().fetchPurchaseReportAction();
  },
}));



