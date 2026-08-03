import {
  receiveAllPendingStockItems,
  receiveScannedStockItem,
} from '..';

export const createStockItemReceiveSlice = (set, get) => ({
  scannedList: [],
  loading: false,
  error: null,

  receiveSNAction: async ({ barcode, serialNumber, receiptItemId } = {}) => {
    const normalizedBarcode = String(barcode || '').trim();
    const normalizedSerialNumber = String(serialNumber || '').trim();
    const code = normalizedBarcode;

    if (!code) {
      set((state) => ({
        scannedList: [
          ...state.scannedList,
          { barcode: '', status: 'error', error: 'กรุณาระบุบาร์โค้ด' },
        ],
      }));
      return;
    }

    const alreadyReceived = get().scannedList.some(
      (item) => item.barcode === code && item.status === 'success'
    );

    if (alreadyReceived) {
      set((state) => ({
        scannedList: [
          ...state.scannedList,
          { barcode: code, status: 'error', error: 'สแกนซ้ำในรอบนี้' },
        ],
      }));
      return;
    }

    set({ loading: true, error: null });

    try {
      const result = await receiveScannedStockItem({
        barcode: code,
        serialNumber: normalizedSerialNumber || null,
        receiptItemId,
      });
      const data = result?.sourceResponse ?? result;
      const kind = data?.stockItem ? 'SN' : data?.lot ? 'LOT' : undefined;
      const extra =
        kind === 'SN'
          ? { stockItemId: data?.stockItem?.id }
          : kind === 'LOT'
            ? {
                activated: true,
                receiptItemId: data?.lot?.receiptItemId,
                quantity: data?.lot?.quantity,
              }
            : {};

      set((state) => ({
        scannedList: [
          ...state.scannedList,
          { barcode: code, kind, status: 'success', ...extra, data },
        ],
      }));

      return result;
    } catch (error) {
      const message = error?.message || 'รับสินค้าไม่สำเร็จ';
      console.error('[receiveSNAction]', error);
      set((state) => ({
        error: message,
        scannedList: [
          ...state.scannedList,
          { barcode: code, status: 'error', error: message },
        ],
      }));
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  receiveAllPendingNoSNAction: async ({ receiptId } = {}) => {
    set({ loading: true, error: null });

    try {
      return await receiveAllPendingStockItems({ receiptId });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'รับสินค้าค้างรับทั้งหมดไม่สำเร็จ';
      set({ error: message });
      console.error('❌ receiveAllPendingNoSNAction ล้มเหลว:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearScannedList: () => set({ scannedList: [] }),
  removeScannedItem: (barcode) =>
    set((state) => ({
      scannedList: state.scannedList.filter((item) => item.barcode !== barcode),
    })),
  undoLastScan: () =>
    set((state) => ({ scannedList: state.scannedList.slice(0, -1) })),
});
