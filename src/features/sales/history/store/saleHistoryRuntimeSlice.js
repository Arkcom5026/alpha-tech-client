import { getAllSales, getSaleById, markSaleAsPaid, searchPrintableSales } from '../api/saleHistoryApi';
import { devError, normalizePrintableRows, normalizeSaleDetail } from '../../shared/saleStoreSupport';

export const createSaleHistoryRuntimeSlice = (set, get) => ({
  salesOverviewLoading: false,

  salesOverviewError: null,

  salesOverviewLastLoadedAt: null,

  clearSalesOverviewErrorAction: () => set({ salesOverviewError: null }),

  sales: [],

  currentSale: null,

  printableSales: [],

  markSalePaidAction: async (saleId) => {
    try {
      await markSaleAsPaid(saleId);
    } catch (err) {
      devError('❌ [markSalePaidAction]', err);
    }
  },

  fetchSalesDashboardOverviewAction: async (opts = {}) => {
    const scope = opts?.scope || 'today';

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
      if (s?.statusPayment) {
        const sp = String(s.statusPayment).toUpperCase();
        if (sp === 'PAID') return true;
        if (sp === 'CANCELLED') return true;
        if (s?.statusPayment && (sp === 'UNPAID' || sp === 'PARTIALLY_PAID' || sp === 'WAITING_APPROVAL')) return false;
      }

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
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'โหลดภาพรวมการขายไม่สำเร็จ';
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
      const data = await getSaleById(id, { includePayments: true, includeBranch: true });
      set({ currentSale: normalizeSaleDetail(data) });
    } catch (err) {
      devError('[getSaleByIdAction]', err);
      set({ currentSale: null });
    }
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
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'โหลดรายการใบขายย้อนหลังไม่สำเร็จ';
      set({ printableSales: [], error: msg });
      return { ok: false, error: msg };
    } finally {
      set({ loading: false });
    }
  },
});
