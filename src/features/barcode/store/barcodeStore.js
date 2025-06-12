// src/features/barcode/store/barcodeStore.js
import { create } from 'zustand';
import {
  generateMissingBarcodes,
  getBarcodesByReceiptId,
  getReceiptsWithBarcodes,
  receiveStockItem,
  updateSerialNumber,
} from '../api/barcodeApi';

const useBarcodeStore = create((set, get) => ({
  barcodes: [],
  scannedList: [],
  receipts: [],
  loading: false,
  error: null,

  // ✅ โหลดบาร์โค้ดตาม receiptId
  loadBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await getBarcodesByReceiptId(receiptId);
      set({
        barcodes: (res.barcodes || []).map((b) => ({
          ...b,
          stockItem: b.stockItem
            ? {
                id: b.stockItem.id,
                serialNumber: b.stockItem.serialNumber,
                barcode: b.stockItem.barcode,
                status: b.stockItem.status,
              }
            : null,
        })),
        loading: false,
      });
      console.log('res getBarcodesByReceiptId : ',res)
    } catch (err) {
      console.error('[loadBarcodesAction]', err);
      set({ error: err.message || 'โหลดบาร์โค้ดล้มเหลว', loading: false });
    }
  },

  // ✅ สร้างบาร์โค้ดที่ยังไม่ถูกสร้าง
  generateBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await generateMissingBarcodes(receiptId);
      set({ barcodes: res.barcodes || [], loading: false });
    } catch (err) {
      console.error('[generateBarcodesAction]', err);
      set({ error: err.message || 'สร้างบาร์โค้ดล้มเหลว', loading: false });
    }
  },

  // ✅ โหลดใบตรวจรับที่มีการสร้างบาร์โค้ดแล้วเท่านั้น
  loadReceiptsWithBarcodesAction: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getReceiptsWithBarcodes();
      set({ receipts: data || [], loading: false });
    } catch (err) {
      console.error('[loadReceiptsWithBarcodesAction]', err);
      set({ error: err.message || 'โหลดใบตรวจรับล้มเหลว', loading: false });
    }
  },

  // ✅ ยิง barcode → เพิ่ม StockItem → เก็บไว้ใน scannedList
  receiveSNAction: async (barcode) => {
    if (!barcode) return;
    try {
      const res = await receiveStockItem(barcode);
      set((state) => ({
        scannedList: [...state.scannedList, res.stockItem],
      }));
    } catch (err) {
      console.error('[receiveSNAction]', err);
      set({ error: err.message || 'ยิงบาร์โค้ดล้มเหลว' });
    }
  },

  updateSerialNumberAction: async (barcode, serialNumber) => {
    try {
      const res = await updateSerialNumber(barcode, serialNumber);
      console.log('SN อัปเดตสำเร็จ:', res);

      const receiptId = res?.stockItem?.purchaseOrderReceiptItem?.receiptId;

      // ✅ อัปเดต Store ชั่วคราวก่อน
      set((state) => ({
        barcodes: state.barcodes.map((item) =>
          item.barcode === barcode
            ? {
                ...item,
                stockItem: {
                  ...(item.stockItem || {}),
                  serialNumber: serialNumber,
                },
              }
            : item
        ),
      }));
      
      if (receiptId) {
        const { loadBarcodesAction } = get();
        await loadBarcodesAction(receiptId);
      }

    } catch (err) {
      console.error('❌ อัปเดต SN ล้มเหลว:', err);
    }
  },

  deleteSerialNumberAction: async (barcode) => {
    try {
      const updated = await updateSerialNumber(barcode, null); // ✅ ลบ SN = set null
      set((state) => ({
        barcodes: state.barcodes.map((item) =>
          item.barcode === barcode
            ? { ...item, serialNumber: null } // ✅ clear SN ใน Store
            : item
        ),
      }));
      console.log('✅ SN ลบสำเร็จ:', updated);
    } catch (error) {
      console.error('❌ ลบ SN ล้มเหลว:', error);
    }
  },
  


  // ✅ รีเซต
  clearAll: () =>
    set({
      barcodes: [],
      scannedList: [],
      receipts: [],
      error: null,
    }),
}));

export default useBarcodeStore;
