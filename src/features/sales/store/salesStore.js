




// 📁 FILE: features/sales/store/salesStore.js

import { create } from 'zustand';

import {
  createSaleOrder,
  getAllSales,
  getSaleById,
  returnSale,
  markSaleAsPaid,
  searchPrintableSales,
  convertOrderOnlineToSale,
} from '../api/saleApi';

// ✅ Defensive normalizer (production-grade): กันเคส item หลุดรูปแบบ/stockItemId หายระหว่างทาง
const normalizeStockItemId = (item) => {
  const raw = item?.stockItemId ?? item?.stockItem?.id ?? item?.id ?? null;
  const n = raw == null ? null : Number(raw);
  return Number.isFinite(n) ? n : null;
};

// ✅ No console.* in production path (allow in DEV only)
const devError = (...args) => {
  try {
    if (import.meta?.env?.DEV) console.error(...args);
  } catch (_) {
    // ignore
  }
};

const useSalesStore = create((set, get) => ({
  // ✅ global state for UI-based alert/error block (no dialog)
  loading: false,
  error: null,

  saleItems: [],
  customerId: null,
  sales: [],
  currentSale: null,
  printableSales: [],

  // ✅ last created sale id (for post-confirm flows like print bill)
  lastCreatedSaleId: null,
  setLastCreatedSaleIdAction: (id) => set({ lastCreatedSaleId: id || null }),

  paymentList: [
    { method: 'CASH', amount: 0 },
    { method: 'TRANSFER', amount: 0 },
    { method: 'CREDIT', amount: 0 },
    { method: 'DEPOSIT', amount: 0 },
  ],

  cardRef: '',
  billDiscount: 0,
  sharedBillDiscountPerItem: 0,
  saleCompleted: false,

  setSaleCompleted: (val) => set({ saleCompleted: val }),
  clearErrorAction: () => set({ error: null }),
  setErrorAction: (msg) => set({ error: msg || null }),

  setPaymentAmount: (method, amount) => {
    set((state) => {
      const exists = state.paymentList.some((p) => p.method === method);
      const newList = exists
        ? state.paymentList.map((p) =>
            p.method === method ? { ...p, amount: Number(amount) || 0 } : p
          )
        : [...state.paymentList, { method, amount: Number(amount) || 0, note: '' }];
      return { paymentList: newList };
    });
  },

  // ✅ Alias ตามมาตรฐาน store (Action suffix) — backward compatible
  setPaymentAmountAction: (method, amount) => get().setPaymentAmount(method, amount),

  // ✅ ปรับการเฉลี่ยส่วนลดบิลแบบ Largest Remainder (หน่วยสตางค์) — ผลรวมตรง billDiscount เป๊ะ
  setBillDiscount: (amount) => {
    const billDiscount = Number(amount) || 0;
    const { saleItems } = get();

    if (!saleItems.length) {
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    const totalPrice = saleItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    if (totalPrice <= 0) {
      set({ billDiscount, sharedBillDiscountPerItem: 0 });
      return;
    }

    const totalPriceSatang = Math.round(totalPrice * 100);
    const totalDiscSatang = billDiscount > 0 ? Math.round(billDiscount * 100) : 0;

    if (totalDiscSatang <= 0) {
      const newItems = saleItems.map((item) => {
        const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
        return {
          ...item,
          billShare: 0,
          discountWithoutBill: baseDiscount,
          discount: baseDiscount,
        };
      });
      set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: 0 });
      return;
    }

    const provisional = saleItems.map((item) => {
      const price = Number(item.price) || 0;
      const priceSatang = Math.max(0, Math.round(price * 100));
      const baseDiscount = Number(item.discountWithoutBill ?? 0) || 0;
      const raw = (totalDiscSatang * priceSatang) / totalPriceSatang;
      const flo = Math.floor(raw);
      const frac = raw - flo;
      return { item, baseDiscount, flo, frac };
    });

    let used = provisional.reduce((s, x) => s + x.flo, 0);
    let remain = Math.max(0, totalDiscSatang - used);

    const order = [...provisional].sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < order.length && remain > 0; i += 1) {
      order[i].flo += 1;
      remain -= 1;
    }

    const floById = new Map(order.map((o) => [o.item.stockItemId, o.flo]));

    const newItems = provisional.map(({ item, baseDiscount, flo }) => {
      const finalFlo = floById.get(item.stockItemId) ?? flo;
      const billShare = finalFlo / 100;
      return {
        ...item,
        discountWithoutBill: baseDiscount,
        billShare,
        discount: baseDiscount + billShare,
      };
    });

    const avg = Math.floor((billDiscount / saleItems.length) * 100) / 100;
    set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: avg });
  },

  // ✅ Alias ตามมาตรฐาน store (Action suffix) — backward compatible
  setBillDiscountAction: (amount) => get().setBillDiscount(amount),

  // ✅ รองรับทั้ง 2 แบบ:
  // 1) UI คำนวณค่า avg แล้วส่งมา (preferred)
  // 2) ถ้าไม่ส่งมา → คำนวณจาก billDiscount/saleItems (backward compatible)
  setSharedBillDiscountPerItem: (value) => {
    const n = value == null ? null : Number(value);
    if (Number.isFinite(n)) {
      // keep 2 decimals (เงินบาท/สตางค์) เพื่อให้ UI/table แสดงตรง
      const safe = Math.floor(n * 100) / 100;
      set({ sharedBillDiscountPerItem: safe });
      return;
    }

    const { billDiscount, saleItems } = get();
    if (!saleItems?.length) {
      set({ sharedBillDiscountPerItem: 0 });
      return;
    }

    // fallback: average from billDiscount
    const avg = Math.floor(((Number(billDiscount) || 0) / saleItems.length) * 100) / 100;
    set({ sharedBillDiscountPerItem: avg });
  },

  // ✅ Alias ตามมาตรฐาน store (Action suffix) — backward compatible
  setSharedBillDiscountPerItemAction: (value) => get().setSharedBillDiscountPerItem(value),

  sumPaymentList: () => {
    const list = get().paymentList || [];
    return list.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  },

  finalPrice: () => {
    const base = get().saleItems.reduce(
      (sum, i) => sum + (Number(i.price) || 0) - (Number(i.discount ?? 0) || 0),
      0
    );
    return Math.max(base, 0);
  },

  receivedAmount: () => get().sumPaymentList(),
  changeAmount: () => {
    const totalPaid = get().sumPaymentList();
    const final = get().finalPrice();
    return Math.max(totalPaid - final, 0);
  },

  setCardRef: (val) => set({ cardRef: val }),
  setCardRefAction: (val) => get().setCardRef(val),
  setCustomerIdAction: (id) => set({ customerId: id }),

  addSaleItemAction: (item) => {
    try {
      const stockItemId = normalizeStockItemId(item);
      if (!stockItemId) {
        set({ error: 'ข้อมูลสินค้าไม่ครบ (ไม่มี stockItemId)' });
        return;
      }

      const safeItem = {
        ...item,
        stockItemId,
      };

      set((state) => {
        const exists = (state.saleItems || []).some((i) => normalizeStockItemId(i) === stockItemId);
        if (exists) return state;
        return { saleItems: [...(state.saleItems || []), safeItem] };
      });
    } catch (err) {
      set({ error: err?.message || 'เพิ่มรายการสินค้าไม่สำเร็จ' });
    }
  },

  removeSaleItemAction: (stockItemId) => {
    set((state) => ({
      saleItems: state.saleItems.filter((i) => i.stockItemId !== stockItemId),
    }));
  },

  clearSaleItemsAction: () => {
    set({ saleItems: [], customerId: null });
  },

  updateItemDiscountAction: (stockItemId, discount) => {
    const sid = Number(stockItemId) || 0;
    set((state) => ({
      saleItems: (state.saleItems || []).map((item) =>
        normalizeStockItemId(item) === sid
          ? {
              ...item,
              stockItemId: sid, // 🔒 กันหลุด
              discount: Number(discount) || 0,
            }
          : item
      ),
    }));
  },

  updateSaleItemAction: (stockItemId, newData) => {
    const sid = Number(stockItemId) || 0;
    set((state) => ({
      saleItems: (state.saleItems || []).map((item) =>
        normalizeStockItemId(item) === sid
          ? {
              ...item,
              ...newData,
              stockItemId: sid, // 🔒 กันหลุดเวลามีการ merge
            }
          : item
      ),
    }));
  },

  markSalePaidAction: async (saleId) => {
    try {
      await markSaleAsPaid(saleId);
    } catch (err) {
      devError('❌ [markSalePaidAction]', err);
    }
  },

  // ✅ ส่ง saleMode ให้ BE จัดการสถานะเอง
  // ✅ ส่ง saleMode ให้ BE จัดการสถานะเอง
  // Production hardening:
  // - เซ็ต loading/error ใน store เพื่อให้ UI แสดง error block ได้
  // - รองรับ backend 409 (ขายซ้ำ/สถานะไม่พร้อม/partial failure)
  confirmSaleOrderAction: async (saleMode, opts = {}) => {
    const { saleItems, customerId } = get();

    if (saleMode === 'CREDIT' && !customerId) {
      const msg = 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน';
      set({ error: msg });
      return { error: msg };
    }
    // ✅ validate: ต้องมี stockItemId ทุกชิ้น (กัน payload หลุด)
    const missingRows = (saleItems || [])
      .map((it, idx) => ({ idx, stockItemId: normalizeStockItemId(it) }))
      .filter((x) => !x.stockItemId)
      .map((x) => x.idx + 1);

    if (missingRows.length > 0) {
      const msg = `มีบางรายการไม่มี stockItemId (ข้อมูลสินค้าไม่ครบ) แถว: ${missingRows.join(', ')}`;
      set({ error: msg });
      return { error: msg };
    }

    if (saleItems.length === 0) {
      const msg = 'ยังไม่มีรายการสินค้า';
      set({ error: msg });
      return { error: msg };
    }

    set({ loading: true, error: null });

    try {
      const vatRate = 7;
      // ✅ คำนวณเงินแบบสตางค์ เพื่อความแม่นยำ
      const totalBeforeDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.price) || 0) * 100),
        0
      );
      const totalDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.discount) || 0) * 100),
        0
      );
      const totalNetSatang = Math.max(totalBeforeDiscountSatang - totalDiscountSatang, 0);
      const vatSatang = Math.round((totalNetSatang * vatRate) / 100);
      const totalAmountSatang = totalNetSatang + vatSatang;

      const totalBeforeDiscount = totalBeforeDiscountSatang / 100;
      const totalDiscount = totalDiscountSatang / 100;
      const vatAmount = vatSatang / 100;
      const totalAmount = totalAmountSatang / 100;

      const isCredit = saleMode === 'CREDIT';

      // ✅ CREDIT: default เป็น DELIVERY_NOTE เสมอ (บังคับพิมพ์) เพราะต้องมีเอกสารให้เซ็นรับของ
// ✅ CREDIT: ห้ามออกใบกำกับ/ใบเสร็จ (ยังไม่รับเงิน) — คุมที่ FE + BE
      // opts:
      // - deliveryNoteMode: 'PRINT' | 'NO_PRINT' (NOTE: CREDIT will be forced to PRINT)
      // - saleType: optional override (e.g. 'GOVERNMENT')
      const saleType = opts?.saleType;

      const payload = {
        customerId,
        totalBeforeDiscount,
        totalDiscount,
        vat: vatAmount,
        vatRate,
        totalAmount,
        note: '',
        items: saleItems
          .map((item) => ({
            stockItemId: normalizeStockItemId(item),
            basePrice: Number(item.price) || 0,
            // ✅ คิด VAT ต่อชิ้นจาก (ราคา - ส่วนลด) แบบสตางค์
            vatAmount:
              Math.round(
                (Math.max(
                  Math.round((Number(item.price) || 0) * 100) -
                    Math.round((Number(item.discount) || 0) * 100),
                  0
                ) *
                  vatRate) /
                  100
              ) / 100,
            // ✅ ราคาสุทธิหลังหักส่วนลด
            price:
              Math.max(
                Math.round((Number(item.price) || 0) * 100) -
                  Math.round((Number(item.discount) || 0) * 100),
                0
              ) / 100,
            discount: Number(item.discount) || 0,
            remark: '',
          })),
        // ✅ BE expects "mode" (single source of truth)
        mode: saleMode,
        // keep for backward compatibility (if any older endpoint still reads it)
        saleMode,

        // ✅ Explicit flags for BE (backward-compatible: BE can ignore unknown keys)
        isCredit,
        // Credit sale at sale-time: never issue tax invoice
        isTaxInvoice: isCredit ? false : undefined,
        saleType: saleType || undefined,

        // ✅ Only send delivery note mode for CREDIT + ORG
        // ✅ CREDIT always forces delivery note print as default (A)
        deliveryNoteMode: isCredit ? 'PRINT' : undefined,
      };

      const data = await createSaleOrder(payload);

      // ✅ normalize saleId เพื่อให้ FE เปิดหน้า print ได้แน่นอน (รองรับ backend หลายรูปแบบ)
      const saleId =
        data?.saleId ??
        data?.id ??
        data?.saleOrderId ??
        data?.sale?.id ??
        null;

      set({
        saleItems: [],
        customerId: null,
        lastCreatedSaleId: saleId,
        paymentList: [
          { method: 'CASH', amount: 0 },
          { method: 'TRANSFER', amount: 0 },
          { method: 'CREDIT', amount: 0 },
          { method: 'DEPOSIT', amount: 0 },
        ],
      });

      return { saleId, data, deliveryNoteMode: isCredit ? 'PRINT' : undefined };
    } catch (err) {
      const status = err?.response?.status;
      const payload = err?.response?.data;

      // ✅ 409: ขายไม่ได้/ขายซ้ำ/สถานะเปลี่ยน (backend hardening)
      if (status === 409) {
        const msg = payload?.message || 'มีบางรายการไม่สามารถทำรายการขายได้ (อาจถูกขายไปแล้ว)';
        set({ error: msg });
        return { error: msg, code: payload?.code, details: payload };
      }

      // 400/401/500 ฯลฯ
      const msg = payload?.message || err?.message || 'เกิดข้อผิดพลาดในการขาย';
      devError('❌ [confirmSaleOrderAction]', err);
      set({ error: msg });
      return { error: msg };
    } finally {
      set({ loading: false });
    }
  },

  loadSalesAction: async () => {
    try {
      const data = await getAllSales();
      set({ sales: data });
    } catch (err) {
      devError('[loadSalesAction]', err);
    }
  },

  setCurrentSale: (saleData) => set({ currentSale: saleData }),
  setCurrentSaleAction: (saleData) => get().setCurrentSale(saleData),

  getSaleByIdAction: async (id) => {
    try {
      const data = await getSaleById(id);
      set({ currentSale: data });
    } catch (err) {
      devError('[getSaleByIdAction]', err);
      set({ currentSale: null });
    }
  },

  returnSaleAction: async (saleOrderId, saleItemId) => {
    try {
      const data = await returnSale(saleOrderId, saleItemId);
      return data;
    } catch (err) {
      devError('[returnSaleAction]', err);
      return { error: 'เกิดข้อผิดพลาดในการคืนสินค้า' };
    }
  },

  resetSaleOrderAction: () => {
    set({
      saleItems: [],
      paymentList: [
        { method: 'CASH', amount: 0 },
        { method: 'TRANSFER', amount: 0 },
        { method: 'CREDIT', amount: 0 },
        { method: 'DEPOSIT', amount: 0 },
      ],
      billDiscount: 0,
      sharedBillDiscountPerItem: 0,
      cardRef: '',
      customerId: null,
    });
  },

  loadPrintableSalesAction: async (params = {}) => {
    const fromDate = params?.fromDate;
    const toDate = params?.toDate;
    const keyword = params?.keyword || '';
    const limitRaw = params?.limit;

    // ✅ optional server-side filters (keep FE light)
    // - Delivery Note list uses onlyUnpaid=1
    // - Print Bill list uses onlyPaid=1
    const onlyUnpaid = params?.onlyUnpaid;
    const onlyPaid = params?.onlyPaid;

    const limitParsed = parseInt(limitRaw, 10);
    const limit = Math.min(Math.max(Number.isFinite(limitParsed) ? limitParsed : 100, 1), 500);

    set({ loading: true, error: null });

    try {
      const data = await searchPrintableSales({
        fromDate,
        toDate,
        keyword,
        limit,
        // pass-through optional flags (BE will ignore if unsupported)
        ...(onlyUnpaid ? { onlyUnpaid } : {}),
        ...(onlyPaid ? { onlyPaid } : {}),
      });
      set({ printableSales: Array.isArray(data) ? data : [] });
      return { ok: true };
    } catch (err) {
      devError('❌ [loadPrintableSalesAction] error:', err);
      const msg = err?.response?.data?.message || err?.message || 'โหลดรายการใบขายย้อนหลังไม่สำเร็จ';
      set({ printableSales: [], error: msg });
      return { ok: false, error: msg };
    } finally {
      set({ loading: false });
    }
  },

  convertOrderOnlineToSaleAction: async (orderOnlineId, stockSelections) => {
    try {
      const res = await convertOrderOnlineToSale(orderOnlineId, stockSelections);
      return res;
    } catch (err) {
      devError('❌ [convertOrderOnlineToSaleAction]', err);
      throw err;
    }
  },
}));

export default useSalesStore;

















