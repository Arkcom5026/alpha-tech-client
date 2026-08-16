import {
  receiveAllPendingStockItems,
  receiveScannedStockItem,
} from '..';

const busyError = () => new Error('มีรายการรับสินค้ากำลังดำเนินการอยู่ กรุณารอให้รายการปัจจุบันเสร็จก่อน');

export const createStockItemReceiveSlice = (set, get) => ({
  scannedList: [],
  loading: false,
  error: null,
  mutationAction: null,

  receiveSNAction: async ({ barcode, serialNumber, receiptItemId } = {}) => {
    const command = {
      barcode: String(barcode || '').trim(),
      serialNumber: String(serialNumber || '').trim() || null,
      receiptItemId: receiptItemId ?? null,
    };
    const code = command.barcode;

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

    if (get().mutationAction) throw busyError();
    set({ loading: true, error: null, mutationAction: 'RECEIVE_SCAN' });

    try {
      const result = await receiveScannedStockItem(command);
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
      if (get().mutationAction === 'RECEIVE_SCAN') {
        set({ loading: false, mutationAction: null });
      }
    }
  },

  receiveAllPendingNoSNAction: async ({ receiptId } = {}) => {
    const command = { receiptId: receiptId ?? null };
    if (get().mutationAction) throw busyError();
    set({ loading: true, error: null, mutationAction: 'RECEIVE_ALL_PENDING' });

    try {
      return await receiveAllPendingStockItems(command);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'รับสินค้าค้างรับทั้งหมดไม่สำเร็จ';
      set({ error: message });
      console.error('❌ receiveAllPendingNoSNAction ล้มเหลว:', error);
      throw error;
    } finally {
      if (get().mutationAction === 'RECEIVE_ALL_PENDING') {
        set({ loading: false, mutationAction: null });
      }
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
