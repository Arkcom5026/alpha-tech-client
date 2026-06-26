import { create } from 'zustand';
import { validateReceiptQuantities } from '../engines/receiptValidationEngine';

export const useGoodsReceiptStore = create((set, get) => ({
  receivedItems: [],
  isReceiptValid: true,
  errorMsg: null,

  initializeReceipt: async (poId) => {
    // สมมติการดึงข้อมูลตั้งต้นจาก PO ดั้งเดิมเข้ามาแปลงสเตทรับเข้า
    const mockPOItems = [
      { productId: 'prod-001', name: 'MacBook Air M3', orderedQty: 5, receivedQty: 0, unitCost: 39000, productType: 'SERIAL', serialNumbers: [] },
      { productId: 'prod-002', name: 'Simple RJ45 Connector', orderedQty: 100, receivedQty: 0, unitCost: 5, productType: 'SIMPLE', serialNumbers: [] }
    ];
    set({ receivedItems: mockPOItems, isReceiptValid: true, errorMsg: null });
  },

  // จัดการการพิมพ์หรือปรับเปลี่ยนค่าตัวเลขโดยตรงบนหน้าจอ
  updateReceivedQty: (productId, qty) => {
    set((state) => ({
      receivedItems: state.receivedItems.map((item) =>
        item.productId === productId ? { ...item, receivedQty: Number(qty) } : item
      )
    }));
    get().recalculateValidity();
  },

  // ดักจับรหัสผ่านการสแกนด้วยปืนยิงบาร์โค้ด
  addSerialNumber: (productId, serialNumber) => {
    set((state) => ({
      receivedItems: state.receivedItems.map((item) => {
        if (item.productId === productId && !item.serialNumbers.includes(serialNumber)) {
          const updatedSerials = [...item.serialNumbers, serialNumber];
          return {
            ...item,
            serialNumbers: updatedSerials,
            receivedQty: updatedSerials.length // ตราจรับเพิ่มขึ้นทีละชิ้นตามจำนวนการยิงบาร์โค้ด
          };
        }
        return item;
      })
    }));
    get().recalculateValidity();
  },

  addBarcodeItem: (barcode) => {
    // ฟังก์ชันยิงแอดบาร์โค้ดเพื่อหาตัวสินค้าและเพิ่มจำนวน +1 (สำหรับ SIMPLE)
    set((state) => ({
      receivedItems: state.receivedItems.map((item) => {
        if (item.productId === barcode && item.productType === 'SIMPLE') {
          return { ...item, receivedQty: item.receivedQty + 1 };
        }
        return item;
      })
    }));
    get().recalculateValidity();
  },

  recalculateValidity: () => {
    const { receivedItems } = get();
    let allValid = true;
    let finalError = null;

    for (const item of receivedItems) {
      const check = validateReceiptQuantities(item);
      if (!check.isValid) {
        allValid = false;
        finalError = check.message;
        break;
      }
    }

    set({ isReceiptValid: allValid, errorMsg: finalError });
  }
}));