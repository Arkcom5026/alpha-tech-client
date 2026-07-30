// stockItemStore.js — compatibility store while StockItem capabilities migrate to owned slices
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  markStockItemsAsSold,
  getAvailableStockItemsByProduct,
} from '../api/stockItemApi';
import {
  receiveAllPendingStockItems,
  receiveScannedStockItem,
} from '../receive';
import { searchStockItem } from '../search';

const useStockItemStore = create(
  devtools((set, get) => ({
    scannedList: [],
    loading: false,
    error: null,

    receiveSNAction: async ({ barcode, serialNumber, receiptItemId, keepSN } = {}) => {
      const normalizedBarcode = String(barcode || '').trim();
      const normalizedSerialNumber = String(serialNumber || '').trim();
      const shouldKeepSN = keepSN === true;
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

      if (shouldKeepSN && !normalizedSerialNumber) {
        set((state) => ({
          scannedList: [
            ...state.scannedList,
            { barcode: code, status: 'error', error: 'กรุณาระบุ SN' },
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
          serialNumber: normalizedSerialNumber,
          receiptItemId,
          keepSN: shouldKeepSN,
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

    updateStockItemsToSoldAction: async (stockItemIds = []) => {
      const ids = Array.isArray(stockItemIds)
        ? [...new Set(stockItemIds.map((value) => Number(value)).filter(Number.isFinite))]
        : [];

      if (ids.length === 0) {
        const error = new Error('ไม่มีรายการสินค้าที่ต้องอัปเดตเป็นขายแล้ว');
        set({ error: error.message });
        throw error;
      }

      set({ loading: true, error: null });

      try {
        return await markStockItemsAsSold(ids);
      } catch (error) {
        const status = error?.response?.status;
        const payload = error?.response?.data;

        if (status === 409) {
          const message = payload?.message || 'มีบางรายการไม่สามารถเปลี่ยนเป็นขายแล้วได้';
          set({ error: message });

          const mappedError = new Error(message);
          mappedError.name = 'StockItemNotSellableError';
          mappedError.status = 409;
          mappedError.code = payload?.code;
          mappedError.details = payload;
          throw mappedError;
        }

        const message = payload?.message || error?.message || 'อัปเดตสถานะขายแล้วไม่สำเร็จ';
        set({ error: message });
        console.error('❌ อัปเดต stockItem ล้มเหลว:', error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    searchStockItemAction: async (query) => {
      try {
        return await searchStockItem(query);
      } catch (error) {
        console.error('❌ ค้นหา stockItem ล้มเหลว:', error);
        return null;
      }
    },

    loadAvailableStockItemsAction: async (productId) => {
      try {
        return await getAvailableStockItemsByProduct(productId);
      } catch (error) {
        console.error('❌ ดึง stockItem ที่พร้อมขายล้มเหลว:', error);
        return [];
      }
    },

    clearScannedList: () => set({ scannedList: [] }),
    removeScannedItem: (barcode) =>
      set((state) => ({
        scannedList: state.scannedList.filter((item) => item.barcode !== barcode),
      })),
    undoLastScan: () =>
      set((state) => ({ scannedList: state.scannedList.slice(0, -1) })),
  }))
);

export default useStockItemStore;
