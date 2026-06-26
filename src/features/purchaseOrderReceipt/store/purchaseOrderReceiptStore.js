// src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js
// 🏛️ Tenant-Safe Receipt Zustand Store: (Fixed Multi-Tenant Parameter Propagation & Mapping Layer)

import { create } from 'zustand';
import {
  getAllReceipts,
  getReceiptBarcodeSummaries,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  markReceiptAsCompleted,
  finalizeReceiptIfNeeded,
  markReceiptAsPrinted,
  createQuickReceipt,
  generateReceiptBarcodes,
  printReceipt,
  commitReceipt,
  getReceiptById,
} from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi';
import { getEligiblePurchaseOrders, getPurchaseOrderDetailById, updatePurchaseOrderStatus } from '@/features/purchaseOrder/api/purchaseOrderApi';
import { addReceiptItem, updateReceiptItem, deleteReceiptItem } from '@/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi';

let _createReceiptInFlight = null;

const usePurchaseOrderReceiptStore = create((set, get) => ({

  receipts: [],
  receiptBarcodeSummaries: [],
  receiptSummaries: [], 
  purchaseOrdersForReceipt: [],
  receiptsReadyToPay: [],
  barcodePreview: [], 
  currentReceipt: null,
  currentOrder: null,
  poItems: [],
  receiptItems: [],
  loading: false,
  creatingReceipt: false,
  receiptBarcodeLoading: false,
  receiptSummariesLoading: false,
  error: null,

  loadReceiptsAction: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getAllReceipts();
      set({ receipts: data, loading: false, error: null });
    } catch (error) {
      console.error('📛 loadReceiptsAction error:', error);
      set({ error, loading: false });
    }
  },

  loadReceiptSummariesAction: async (opts = {}) => {
    try {
      const wantPrinted = opts.printed ?? undefined;
      set({ loading: true, receiptSummariesLoading: true, error: null });

      const params = {};
      if (typeof wantPrinted === 'boolean') params.printed = wantPrinted;
      if (opts.q) params.q = opts.q;
      if (opts.supplier) params.supplier = opts.supplier;
      if (opts.shopSlug) params.shopSlug = opts.shopSlug; // 🟢 ส่งสิทธิ์ต่อท่อตามสาขา
      if (Number.isFinite(Number(opts.supplierId))) params.supplierId = Number(opts.supplierId);
      if (Number.isFinite(Number(opts.limit))) params.limit = Number(opts.limit);

      const all = await getAllReceipts(params);
      const list = Array.isArray(all)
        ? all
        : Array.isArray(all?.items)
          ? all.items
          : Array.isArray(all?.data)
            ? all.data
            : Array.isArray(all?.results)
              ? all.results
              : [];

      const normalized = list.map((r) => ({
        id: r.id,
        code: r.code || r.receiptCode || r.purchaseOrderReceiptCode || r.poReceiptCode,
        purchaseOrderCode: r.purchaseOrderCode || r.orderCode || r.poCode || r.purchaseOrder?.code,
        supplierId: r.supplierId || r.purchaseOrder?.supplier?.id || null,
        supplier: r.supplier || r.supplierName || r.supplier?.name || r.purchaseOrder?.supplier?.name,
        taxInvoiceNo: r.tax || r.taxInvoiceNo || r.taxInvoiceNumber || r.taxNumber,
        receivedAt: r.receivedAt || r.createdAt || r.date,
        totalItems: r.total || r.totalItems || r.itemsCount || r.receivedQty || 0,
        scannedCount: r.scanned || r.scannedCount || r.generatedCount || 0,
        printed: Boolean(r.printed ?? r.isPrinted ?? false),
      }));

      set({ receiptSummaries: normalized, loading: false, receiptSummariesLoading: false, error: null });
      return normalized;
    } catch (error) {
      console.error('📛 loadReceiptSummariesAction error:', error);
      set({ error, loading: false, receiptSummariesLoading: false });
      return [];
    }
  },

  loadReceiptBarcodeSummariesAction: async (opts = {}) => {
    try {
      set({ loading: true, receiptBarcodeLoading: true, error: null });
      const params = { printed: opts.printed ?? false, shopSlug: opts.shopSlug };
      const data = await getReceiptBarcodeSummaries(params);
      set({ receiptBarcodeSummaries: data, loading: false, receiptBarcodeLoading: false, error: null });
      return data;
    } catch (error) {
      console.error('📛 loadReceiptBarcodeSummariesAction error:', error);
      set({ error, loading: false, receiptBarcodeLoading: false });
      return [];
    }
  },

  createReceiptAction: async (payload) => {
    if (_createReceiptInFlight) return _createReceiptInFlight;

    const task = (async () => {
      try {
        set({ creatingReceipt: true, loading: true, error: null });
        const newReceipt = await createReceipt(payload);

        if (!newReceipt?.id) {
          throw new Error('createReceipt returned empty id');
        }

        set((state) => ({
          receipts: [newReceipt, ...state.receipts],
          currentReceipt: newReceipt,
          creatingReceipt: false,
          loading: false,
          error: null,
        }));
        return newReceipt;
      } catch (error) {
        console.error('📛 createReceiptAction error:', error);
        set({ error, creatingReceipt: false, loading: false });
        throw error;
      } finally {
        _createReceiptInFlight = null;
      }
    })();

    _createReceiptInFlight = task;
    return task;
  },

  updateReceiptAction: async (id, payload) => {
    try {
      set({ error: null });
      const updated = await updateReceipt(id, payload);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === id ? updated : r)),
        currentReceipt: updated,
        error: null,
      }));
      return updated;
    } catch (error) {
      console.error('📛 updateReceipt error:', error);
      set({ error });
      throw error;
    }
  },

  deleteReceiptAction: async (id) => {
    try {
      set({ error: null });
      await deleteReceipt(id);
      set((state) => ({
        receipts: state.receipts.filter((r) => r.id !== id),
        currentReceipt: state.currentReceipt?.id === id ? null : state.currentReceipt,
        error: null,
      }));
    } catch (error) {
      console.error('📛 deleteReceipt error:', error);
      set({ error });
      throw error;
    }
  },

  // 🟢 [LIVE TENANT CONFIGURATION FIXED] ขยายฟังก์ชันรับพารามิเตอร์รายบริษัทคั่นทางย่อย พร้อมจัดระเบียบรูปร่างโครงสร้างข้อมูล Array
  fetchPurchaseOrdersForReceiptAction: async (opts = {}) => {
    try {
      set({ loading: true, error: null });
      
      // ส่งผ่านค่า params ตัวแปรสาขา / สถานะ ดักกรองตรงไปยังฐานข้อมูลกลางหลังบ้าน Port 5000
      const params = {
        status: 'PENDING,PARTIALLY_RECEIVED',
        ...(opts.shopSlug ? { shopSlug: opts.shopSlug } : {})
      };

      const res = await getEligiblePurchaseOrders(params);
      
      // ดักเจาะกล่องวัตถุ ปรับค่า Array Shape ผูกเงื่อนไขป้องกันกรณี Schema ส่งข้อมูลซ้อนชั้นมา
      const rawList = Array.isArray(res) 
        ? res 
        : Array.isArray(res?.data) 
          ? res.data 
          : Array.isArray(res?.items) 
            ? res.items 
            : [];

      const normalizedOrders = rawList.map((po) => ({
        id: po.id,
        code: po.code || po.poNumber || po.purchaseOrderCode || '-',
        createdAt: po.createdAt || po.dateOrdered || null,
        status: po.status || 'PENDING',
        supplier: {
          id: po.supplier?.id || po.supplierId || null,
          name: po.supplier?.name || po.supplierName || po.Supplier?.name || 'ไม่ระบุชื่อคู่ค้าซัพพลายเออร์'
        }
      }));

      set({ purchaseOrdersForReceipt: normalizedOrders, loading: false, error: null });
      return normalizedOrders;
    } catch (err) {
      console.error('❌ โหลด Purchase Orders สำหรับใบรับสินค้าไม่สำเร็จ:', err);
      set({ error: err, loading: false });
      return [];
    }
  },

  loadOrderByIdAction: async (poId) => {
    try {
      set({ loading: true, error: null });
      const res = await getPurchaseOrderDetailById(poId);

      const items = Array.isArray(res?.items) ? res.items : [];
      const normalizedItems = items.map((it) => {
        const p = it?.product || {};
        const categoryName = it?.categoryName ?? p?.category?.name ?? p?.categoryName ?? '-';
        const productTypeName = it?.productTypeName ?? p?.productType?.name ?? p?.productTypeName ?? '-';
        const brandName = it?.brandName ?? p?.brand?.name ?? p?.brandName ?? '-';
        const profileName = it?.profileName ?? p?.productProfile?.name ?? p?.productProfileName ?? '-';
        const templateName = it?.templateName ?? p?.template?.name ?? p?.templateName ?? '-';
        const productName = it?.productName ?? p?.name ?? '-';
        const unitName = it?.unitName ?? p?.unit?.name ?? p?.template?.unit?.name ?? '-';

        return {
          ...it,
          productName,
          unitName,
          categoryName,
          productTypeName,
          brandName,
          profileName,
          templateName,
        };
      });

      set({ currentOrder: { ...res, items: normalizedItems }, poItems: normalizedItems, loading: false, error: null });
      return { ...res, items: normalizedItems };
    } catch (err) {
      console.error('❌ โหลด loadOrderById สำหรับใบรับสินค้าไม่สำเร็จ:', err);
      set({ error: err, loading: false });
      return null;
    }
  },

  addReceiptItemAction: async (payload) => {
    try {
      set({ error: null });
      const adaptedPayload = { ...payload };

      if (!adaptedPayload.purchaseOrderReceiptId && adaptedPayload.receiptId) {
        adaptedPayload.purchaseOrderReceiptId = adaptedPayload.receiptId;
      }
      delete adaptedPayload.receiptId;

      if (!adaptedPayload.purchaseOrderReceiptId) {
        throw new Error('Missing purchaseOrderReceiptId for addReceiptItem');
      }

      return await addReceiptItem(adaptedPayload);
    } catch (error) {
      console.error('📛 addReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  updateReceiptItemAction: async (payload) => {
    try {
      set({ error: null });
      return await updateReceiptItem(payload.id, payload);
    } catch (error) {
      console.error('📛 updateReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  deleteReceiptItemAction: async (id) => {
    try {
      set({ error: null });
      await deleteReceiptItem(id);
    } catch (error) {
      console.error('📛 deleteReceiptItem error:', error);
      set({ error });
      throw error;
    }
  },

  markReceiptAsCompletedAction: async ({ receiptId }) => {
    try {
      set({ error: null });
      const res = await markReceiptAsCompleted(receiptId);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === receiptId ? res : r)),
        currentReceipt: res,
        error: null,
      }));
      return res;
    } catch (err) {
      console.error('❌ markReceiptAsCompletedAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  markReceiptAsPrintedAction: async (payload) => {
    try {
      set({ error: null });
      const receiptId = typeof payload === 'object' && payload !== null ? payload.receiptId : payload;

      if (!receiptId) throw new Error('Missing receiptId');

      const res = await markReceiptAsPrinted(receiptId);

      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === receiptId ? res : r)),
        currentReceipt: res,
        receiptBarcodeSummaries: state.receiptBarcodeSummaries.map((s) =>
          s.id === receiptId ? { ...s, printed: true } : s
        ),
        receiptSummaries: Array.isArray(state.receiptSummaries)
          ? state.receiptSummaries.filter((s) => s.id !== receiptId)
          : state.receiptSummaries,
        error: null,
      }));

      return res;
    } catch (err) {
      console.error('❌ markReceiptAsPrintedAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  finalizeReceiptIfNeededAction: async (receiptId) => {
    try {
      set({ error: null });
      const res = await finalizeReceiptIfNeeded(receiptId);
      return res;
    } catch (err) {
      console.error('❌ finalizeReceiptIfNeededAction error:', err);
      set({ error: err });
      throw err;
    }
  },

  updatePurchaseOrderStatusAction: async ({ id, status }) => {
    try {
      set({ error: null, loading: true });
      const res = await updatePurchaseOrderStatus({ id, status });
      const prev = get().currentOrder;
      const next = prev
        ? {
            ...prev,
            status: res?.status ?? status,
            updatedAt: res?.updatedAt ?? prev?.updatedAt,
          }
        : res;

      set({ currentOrder: next, error: null, loading: false });
      return next;
    } catch (err) {
      console.error('❌ updatePurchaseOrderStatusAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  createQuickReceiptAction: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await createQuickReceipt(payload);
      set({ currentReceipt: res?.data ?? res ?? null, loading: false });
      return res;
    } catch (err) {
      console.error('❌ createQuickReceiptAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  generateBarcodesAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await generateReceiptBarcodes(receiptId);
      set({ loading: false });
      return res;
    } catch (err) {
      console.error('❌ generateBarcodesAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  printReceiptAction: async (receiptId, options = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await printReceipt(receiptId, options);
      set({ barcodePreview: res?.barcodes ?? [], loading: false });
      return res;
    } catch (err) {
      console.error('❌ printReceiptAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  commitReceiptAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const res = await commitReceipt(receiptId);
      const detail = await getReceiptById(receiptId);
      set({ currentReceipt: detail?.data ?? detail ?? null, loading: false });
      return res;
    } catch (err) {
      console.error('❌ commitReceiptAction error:', err);
      set({ error: err, loading: false });
      throw err;
    }
  },

  getReceiptAction: async (receiptId) => {
    set({ loading: true, error: null });
    try {
      const detail = await getReceiptById(receiptId);
      set({ currentReceipt: detail?.data ?? detail ?? null, loading: false });
      return detail;
    } catch (err) {
      console.error('❌ getReceiptAction error:', err);
      set({ error: err, loading: false });
      return null;
    }
  },

  loadReceipts: async () => get().loadReceiptsAction(),
  updateReceipt: async (id, payload) => get().updateReceiptAction(id, payload),
  deleteReceipt: async (id) => get().deleteReceiptAction(id),
  fetchPurchaseOrdersForReceipt: async () => get().fetchPurchaseOrdersForReceiptAction(),
  loadOrderById: async (poId) => get().loadOrderByIdAction(poId),

  clearCurrentReceipt: () => set({ currentReceipt: null }),
  clearErrorAction: () => set({ error: null }),
  clearError: () => set({ error: null }),
}));

export default usePurchaseOrderReceiptStore;