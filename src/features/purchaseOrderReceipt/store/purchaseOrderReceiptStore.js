




// ✅ purchaseOrderReceiptStore.js — จัดการสถานะ Receipt + Items (รองรับ SIMPLE + STRUCTURED + QUICK)

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

// ✅ In-flight guard (module-level) to prevent duplicate receipt creation on rapid clicks
let _createReceiptInFlight = null;

const usePurchaseOrderReceiptStore = create((set, get) => ({

  receipts: [],
  receiptBarcodeSummaries: [],
  receiptSummaries: [], // ✅ เก็บ summary ของใบรับสินค้าโดยตรง
  purchaseOrdersForReceipt: [],
  receiptsReadyToPay: [],
  barcodePreview: [], // ✅ สำหรับ payload บาร์โค้ดที่ใช้พิมพ์
  currentReceipt: null,
  currentOrder: null,
  poItems: [],
  receiptItems: [],
  loading: false,
  creatingReceipt: false,
  receiptBarcodeLoading: false,
  receiptSummariesLoading: false,
  error: null,

  // ── โหลด/จัดการ Receipt เดิม ─────────────────────────────────────────────
  // ✅ Standard naming (Action) — aligned with production rule, keep legacy alias below
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

      const all = await getAllReceipts();
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
        supplier: r.supplier || r.supplierName || r.supplier?.name,
        taxInvoiceNo: r.tax || r.taxInvoiceNo || r.taxInvoiceNumber || r.taxNumber,
        receivedAt: r.receivedAt || r.createdAt || r.date,
        totalItems: r.total || r.totalItems || r.itemsCount || r.receivedQty || 0,
        scannedCount: r.scanned || r.scannedCount || r.generatedCount || 0,
        printed: Boolean(r.printed ?? r.isPrinted ?? false),
      }));

      const filtered =
        typeof wantPrinted === 'boolean'
          ? normalized.filter((x) => x.printed === wantPrinted)
          : normalized;

      set({ receiptSummaries: filtered, loading: false, receiptSummariesLoading: false, error: null });
      return filtered;
    } catch (error) {
      console.error('📛 loadReceiptSummariesAction error:', error);
      set({ error, loading: false, receiptSummariesLoading: false });
      return [];
    }
  },

  loadReceiptBarcodeSummariesAction: async (opts = {}) => {
    try {
      set({ loading: true, receiptBarcodeLoading: true, error: null });
      const params = { printed: opts.printed ?? false };
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
    // ✅ Idempotency guard (UI may trigger rapid clicks before receiptId is set)
    if (_createReceiptInFlight) return _createReceiptInFlight;

    const task = (async () => {
      try {
        set({ creatingReceipt: true, loading: true, error: null });
        const newReceipt = await createReceipt(payload);

        // Defensive: ensure we have an id for downstream actions
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

  // ✅ Standard naming (Action) — keep legacy name as alias to avoid breaking callers
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

  // ✅ Standard naming (Action) — keep legacy name as alias to avoid breaking callers
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

  fetchPurchaseOrdersForReceiptAction: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getEligiblePurchaseOrders();
      set({ purchaseOrdersForReceipt: res, loading: false, error: null });
      return res;
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

      // ✅ Normalize PO items for UI table (Category/Type/Brand/Profile/Template)
      // Support both shapes:
      // 1) Nested: item.product.{category/productType/brand/productProfile/template}
      // 2) Flattened (from BE): item.{categoryName, productTypeName, brandName, profileName, templateName, unitName, productName}
      const items = Array.isArray(res?.items) ? res.items : [];
      const normalizedItems = items.map((it) => {
        const p = it?.product || {};
        const categoryName =
          it?.categoryName ?? p?.category?.name ?? p?.categoryName ?? '-';
        const productTypeName =
          it?.productTypeName ?? p?.productType?.name ?? p?.productTypeName ?? '-';
        const brandName = it?.brandName ?? p?.brand?.name ?? p?.brandName ?? '-';
        const profileName =
          it?.profileName ?? p?.productProfile?.name ?? p?.productProfileName ?? '-';
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

      // ✅ รองรับทั้งรูปแบบใหม่และของเดิม
      // - ใหม่: payload.purchaseOrderReceiptId
      // - เดิม: payload.receiptId
      const adaptedPayload = { ...payload };

      if (!adaptedPayload.purchaseOrderReceiptId && adaptedPayload.receiptId) {
        adaptedPayload.purchaseOrderReceiptId = adaptedPayload.receiptId;
      }
      delete adaptedPayload.receiptId;

      // ✅ กันพลาด: ต้องมี purchaseOrderReceiptId เสมอ
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

  markReceiptAsPrintedAction: async (receiptId) => {
    try {
      set({ error: null });
      const res = await markReceiptAsPrinted(receiptId);
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === receiptId ? res : r)),
        currentReceipt: res,
        receiptBarcodeSummaries: state.receiptBarcodeSummaries.map((s) =>
          s.id === receiptId ? { ...s, printed: true } : s
        ),
        receiptSummaries: (state.receiptSummaries || []).map((s) =>
          s.id === receiptId ? { ...s, printed: true } : s
        ),
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

      // ✅ Minimal disruption: อย่าเขียนทับ currentOrder ทั้งก้อน
      // เพราะ endpoint status มัก include product แบบสั้น (id/name) ทำให้คอลัมน์หมวดหมู่/ประเภท/แบรนด์/... หาย
      // เรา merge เฉพาะฟิลด์สถานะไว้ แล้วคง items เดิมที่โหลดแบบละเอียดไว้
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
      // ✅ Important: throw so caller can show UI error block
      throw err;
    }
  },

  // ── QUICK + SIMPLE/STRUCTURED Actions ───────────────────────────────────────
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

  // ✅ Legacy aliases (do NOT remove yet)
  loadReceipts: async () => get().loadReceiptsAction(),
  updateReceipt: async (id, payload) => get().updateReceiptAction(id, payload),
  deleteReceipt: async (id) => get().deleteReceiptAction(id),
  fetchPurchaseOrdersForReceipt: async () => get().fetchPurchaseOrdersForReceiptAction(),
  loadOrderById: async (poId) => get().loadOrderByIdAction(poId),

  clearCurrentReceipt: () => set({ currentReceipt: null }),
  clearError: () => set({ error: null }),
}));

export default usePurchaseOrderReceiptStore;




