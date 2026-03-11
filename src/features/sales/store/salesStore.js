


// 📁 FILE: src/features/sales/store/salesStore.js

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

// ✅ Defensive normalizer (production-grade)
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

// ✅ Normalize printable response (รองรับหลายรูปแบบจาก BE)
const normalizePrintableRows = (rows) => {
  if (Array.isArray(rows)) return rows;

  if (rows && typeof rows === 'object') {
    if (Array.isArray(rows.items)) return rows.items;
    if (Array.isArray(rows.sales)) return rows.sales;
    if (Array.isArray(rows.data)) return rows.data;

    const r = rows.result;
    if (r && typeof r === 'object') {
      if (Array.isArray(r.items)) return r.items;
      if (Array.isArray(r.sales)) return r.sales;
      if (Array.isArray(r.data)) return r.data;
    }
  }

  return [];
};

// ✅ Normalize sale detail for print/doc screens (Delivery Note / Tax Invoice)
// - Flatten branch fields (taxId etc.) to reduce UI fragility
// - Keep backward compatibility with older BE shapes
const normalizeSaleDetail = (sale) => {
  if (!sale || typeof sale !== 'object') return sale;

  const branch = sale.branch || sale.Branch || sale?.employee?.branch || sale?.employee?.Branch || null;
  const normalizedBranch = branch && typeof branch === 'object' ? branch : null;

  const taxId =
    normalizedBranch?.taxId ??
    normalizedBranch?.taxNo ??
    normalizedBranch?.taxNumber ??
    normalizedBranch?.taxpayerId ??
    sale?.branchTaxId ??
    sale?.taxId ??
    null;

  return {
    ...sale,
    branch: normalizedBranch || sale.branch || null,

    // Convenience (prefer using sale.branch.taxId in UI, but this helps migration)
    branchTaxId: taxId,
  };
};

const useSalesStore = create((set, get) => ({
  // ✅ global state for UI-based alert/error block (no dialog)
  loading: false,
  error: null,

  // ✅ Sales Dashboard overview state (separate from global loading/error)
  salesOverviewLoading: false,
  salesOverviewError: null,
  salesOverviewLastLoadedAt: null,
  clearSalesOverviewErrorAction: () => set({ salesOverviewError: null }),

  saleItems: [],
  customerId: null,
  sales: [],
  currentSale: null,
  printableSales: [],

  // ✅ last created sale id
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
        ? state.paymentList.map((p) => (p.method === method ? { ...p, amount: Number(amount) || 0 } : p))
        : [...state.paymentList, { method, amount: Number(amount) || 0, note: '' }];
      return { paymentList: newList };
    });
  },
  setPaymentAmountAction: (method, amount) => get().setPaymentAmount(method, amount),

  // ✅ Largest Remainder (satang) — sum discount ตรง billDiscount เป๊ะ
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
        return { ...item, billShare: 0, discountWithoutBill: baseDiscount, discount: baseDiscount };
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
      return { ...item, discountWithoutBill: baseDiscount, billShare, discount: baseDiscount + billShare };
    });

    const avg = Math.floor((billDiscount / saleItems.length) * 100) / 100;
    set({ billDiscount, saleItems: newItems, sharedBillDiscountPerItem: avg });
  },
  setBillDiscountAction: (amount) => get().setBillDiscount(amount),

  setSharedBillDiscountPerItem: (value) => {
    const n = value == null ? null : Number(value);
    if (Number.isFinite(n)) {
      const safe = Math.floor(n * 100) / 100;
      set({ sharedBillDiscountPerItem: safe });
      return;
    }

    const { billDiscount, saleItems } = get();
    if (!saleItems?.length) {
      set({ sharedBillDiscountPerItem: 0 });
      return;
    }

    const avg = Math.floor(((Number(billDiscount) || 0) / saleItems.length) * 100) / 100;
    set({ sharedBillDiscountPerItem: avg });
  },
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

      const safeItem = { ...item, stockItemId };

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
    set((state) => ({ saleItems: state.saleItems.filter((i) => i.stockItemId !== stockItemId) }));
  },

  clearSaleItemsAction: () => {
    set({ saleItems: [], customerId: null });
  },

  updateItemDiscountAction: (stockItemId, discount) => {
    const sid = Number(stockItemId) || 0;
    set((state) => ({
      saleItems: (state.saleItems || []).map((item) =>
        normalizeStockItemId(item) === sid ? { ...item, stockItemId: sid, discount: Number(discount) || 0 } : item
      ),
    }));
  },

  updateSaleItemAction: (stockItemId, newData) => {
    const sid = Number(stockItemId) || 0;
    set((state) => ({
      saleItems: (state.saleItems || []).map((item) =>
        normalizeStockItemId(item) === sid ? { ...item, ...newData, stockItemId: sid } : item
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

  // ✅ ส่ง saleMode ให้ BE จัดการสถานะเอง (Production hardening)
  confirmSaleOrderAction: async (saleMode, opts = {}) => {
    const { saleItems, customerId } = get();

    if (saleMode === 'CREDIT' && !customerId) {
      const msg = 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน';
      set({ error: msg });
      return { error: msg };
    }

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

      const totalBeforeDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.price) || 0) * 100),
        0
      );
      const totalDiscountSatang = saleItems.reduce(
        (sum, item) => sum + Math.round((Number(item.discount) || 0) * 100),
        0
      );

      const totalAmountSatang = Math.max(totalBeforeDiscountSatang - totalDiscountSatang, 0);
      const vatSatang = Math.round((totalAmountSatang * vatRate) / (100 + vatRate));

      const totalBeforeDiscount = totalBeforeDiscountSatang / 100;
      const totalDiscount = totalDiscountSatang / 100;
      const vatAmount = vatSatang / 100;
      const totalAmount = totalAmountSatang / 100;

      const isCredit = saleMode === 'CREDIT';
      const saleType = opts?.saleType;

      const payload = {
        customerId,
        totalBeforeDiscount,
        totalDiscount,
        vat: vatAmount,
        vatRate,
        totalAmount,
        note: '',
        items: saleItems.map((item) => {
          const itemBaseSatang = Math.round((Number(item.price) || 0) * 100);
          const itemDiscountSatang = Math.round((Number(item.discount) || 0) * 100);
          const itemGrossSatang = Math.max(itemBaseSatang - itemDiscountSatang, 0);
          const itemVatSatang = Math.round((itemGrossSatang * vatRate) / (100 + vatRate));

          return {
            stockItemId: normalizeStockItemId(item),
            basePrice: Number(item.price) || 0,
            vatAmount: itemVatSatang / 100,
            price: itemGrossSatang / 100,
            discount: Number(item.discount) || 0,
            remark: '',
          };
        }),
        mode: saleMode,
        saleMode,
        isCredit,
        isTaxInvoice: isCredit ? false : undefined,
        saleType: saleType || undefined,
        deliveryNoteMode: isCredit ? 'PRINT' : undefined,
      };

      const data = await createSaleOrder(payload);

      const saleId = data?.saleId ?? data?.id ?? data?.saleOrderId ?? data?.sale?.id ?? null;

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

      if (status === 409) {
        const msg = payload?.message || 'มีบางรายการไม่สามารถทำรายการขายได้ (อาจถูกขายไปแล้ว)';
        set({ error: msg });
        return { error: msg, code: payload?.code, details: payload };
      }

      const msg = payload?.message || err?.message || 'เกิดข้อผิดพลาดในการขาย';
      devError('❌ [confirmSaleOrderAction]', err);
      set({ error: msg });
      return { error: msg };
    } finally {
      set({ loading: false });
    }
  },

  // ============================================================
  // ✅ Executive Dashboard (Sales) — Overview summary (manual load)
  // ============================================================

  fetchSalesDashboardOverviewAction: async (opts = {}) => {
    const scope = opts?.scope || 'today'; // today | custom

    const startOfDay = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const startOfMonth = (d) => {
      const x = startOfDay(d);
      x.setDate(1);
      return x;
    };

    const endOfDayExclusive = (d) => {
      const x = startOfDay(d);
      x.setDate(x.getDate() + 1);
      return x;
    };

    const toISODate = (d) => {
      const x = new Date(d);
      const yyyy = x.getFullYear();
      const mm = String(x.getMonth() + 1).padStart(2, '0');
      const dd = String(x.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const pickNumber = (...vals) => {
      for (const v of vals) {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
      return 0;
    };

    const isPaidSale = (s) => {
      // ✅ Prefer new canonical field (Prisma: Sale.statusPayment)
      // Treat CANCELLED as non-unpaid for dashboard purposes.
      if (s?.statusPayment) {
        const sp = String(s.statusPayment).toUpperCase();
        if (sp === 'PAID') return true;
        if (sp === 'CANCELLED') return true;
        if (sp === 'UNPAID' || sp === 'PARTIALLY_PAID' || sp === 'WAITING_APPROVAL') return false;
      }

      // ✅ Backward compatibility (older fields / mixed responses)
      if (s?.isPaid === true) return true;
      if (s?.paid === true) return true;
      if (s?.paidAt) return true;
      if (s?.paymentStatus && String(s.paymentStatus).toUpperCase() === 'PAID') return true;
      if (s?.status && String(s.status).toUpperCase() === 'PAID') return true;
      if (s?.lifecycleStatus && String(s.lifecycleStatus).toUpperCase() === 'PAID') return true;

      const payments = Array.isArray(s?.payments)
        ? s.payments
        : Array.isArray(s?.paymentList)
        ? s.paymentList
        : null;

      if (payments?.length) {
        const sum = payments.reduce((acc, p) => acc + pickNumber(p?.amount, p?.paidAmount, p?.value), 0);
        if (sum > 0) return true;
      }

      return false;
    };

    set({ salesOverviewLoading: true, salesOverviewError: null });

    try {
      let fromDate;
      let toDate;
      let monthFromDate;
      let monthToDate;

      if (scope === 'custom') {
        fromDate = opts?.fromDate || null;
        toDate = opts?.toDate || null;
      } else {
        const now = new Date();
        fromDate = toISODate(startOfDay(now));
        toDate = toISODate(endOfDayExclusive(now));
        monthFromDate = toISODate(startOfMonth(now));
        monthToDate = toDate;
      }

      const limit = Math.min(Math.max(Number(opts?.limit || 500) || 500, 50), 2000);

      const rows = await searchPrintableSales({
        fromDate,
        toDate,
        keyword: '',
        limit,
      });

      const sales = normalizePrintableRows(rows);

      const includeMonth = opts?.includeMonth !== false;
      let monthSalesAmount = null;

      if (includeMonth && monthFromDate && monthToDate) {
        const monthLimit = Math.min(Math.max(Number(opts?.monthLimit || 2000) || 2000, 200), 5000);
        const monthRows = await searchPrintableSales({
          fromDate: monthFromDate,
          toDate: monthToDate,
          keyword: '',
          limit: monthLimit,
        });
        const monthSales = normalizePrintableRows(monthRows);

        monthSalesAmount = monthSales.reduce((acc, s) => {
          const v = pickNumber(s?.totalAmount, s?.total, s?.grandTotal, s?.finalTotal, s?.amount, s?.netTotal);
          return acc + v;
        }, 0);
      }

      const todaySalesCount = sales.length;

      const todaySalesAmount = sales.reduce((acc, s) => {
        const v = pickNumber(s?.totalAmount, s?.total, s?.grandTotal, s?.finalTotal, s?.amount, s?.netTotal);
        return acc + v;
      }, 0);

      const unpaidCount = sales.reduce((acc, s) => (isPaidSale(s) ? acc : acc + 1), 0);

      const data = {
        todaySalesAmount,
        todaySalesCount,
        unpaidCount,
        monthSalesAmount: monthSalesAmount == null ? undefined : monthSalesAmount,
        todaySalesAmountHint: scope === 'today' ? 'ยอดรวมช่วงวันนี้' : 'ยอดรวมตามช่วงเวลาที่เลือก',
        todaySalesCountHint: scope === 'today' ? 'จำนวนบิลช่วงวันนี้' : 'จำนวนบิลตามช่วงเวลาที่เลือก',
        unpaidHint: 'รายการที่ยังไม่เป็น PAID (อิง statusPayment ก่อน แล้ว fallback paid/paidAt)',
        monthSalesAmountHint: scope === 'today' ? 'ยอดสะสมเดือนนี้ (month-to-date)' : 'ยอดสะสมเดือนนี้ (อิงช่วงเวลาที่เลือก)',
      };

      set({ salesOverviewLastLoadedAt: new Date().toISOString() });
      return data;
    } catch (err) {
      devError('❌ [fetchSalesDashboardOverviewAction] error:', err);
      const msg = err?.response?.data?.message || err?.message || 'โหลดภาพรวมการขายไม่สำเร็จ';
      set({ salesOverviewError: msg });
      throw err;
    } finally {
      set({ salesOverviewLoading: false });
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
      // ✅ Ask BE for related entities when supported (safe if BE ignores unknown params)
      // - includePayments: used by multiple pages already
      // - includeBranch: for Delivery Note header (taxId, address, phone)
      const data = await getSaleById(id, { includePayments: true, includeBranch: true });
      set({ currentSale: normalizeSaleDetail(data) });
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





