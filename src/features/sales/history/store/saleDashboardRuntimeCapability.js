import { searchPrintableSales } from '../api/saleHistoryApi';
import { devError, normalizePrintableRows } from '../../shared/saleStoreSupport';

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = (value) => {
  const date = startOfDay(value);
  date.setDate(1);
  return date;
};

const endOfDayExclusive = (value) => {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
};

const toISODate = (value) => {
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const pickNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
};

const isPaidSale = (sale) => {
  if (sale?.statusPayment) {
    const statusPayment = String(sale.statusPayment).toUpperCase();
    if (statusPayment === 'PAID' || statusPayment === 'CANCELLED') return true;
    if (['UNPAID', 'PARTIALLY_PAID', 'WAITING_APPROVAL'].includes(statusPayment)) return false;
  }

  if (sale?.isPaid === true || sale?.paid === true || sale?.paidAt) return true;
  if (sale?.paymentStatus && String(sale.paymentStatus).toUpperCase() === 'PAID') return true;
  if (sale?.status && String(sale.status).toUpperCase() === 'PAID') return true;
  if (sale?.lifecycleStatus && String(sale.lifecycleStatus).toUpperCase() === 'PAID') return true;

  const payments = Array.isArray(sale?.payments)
    ? sale.payments
    : Array.isArray(sale?.paymentList)
    ? sale.paymentList
    : null;

  if (payments?.length) {
    const sum = payments.reduce(
      (accumulator, payment) => accumulator + pickNumber(payment?.amount, payment?.paidAmount, payment?.value),
      0,
    );
    if (sum > 0) return true;
  }

  return false;
};

export const createSaleDashboardRuntimeCapability = (set) => ({
  salesOverviewLoading: false,
  salesOverviewError: null,
  salesOverviewLastLoadedAt: null,

  clearSalesOverviewErrorAction: () => set({ salesOverviewError: null }),

  fetchSalesDashboardOverviewAction: async (opts = {}) => {
    const scope = opts?.scope || 'today';
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
      const rows = await searchPrintableSales({ fromDate, toDate, keyword: '', limit });
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
        monthSalesAmount = monthSales.reduce(
          (accumulator, sale) =>
            accumulator +
            pickNumber(sale?.totalAmount, sale?.total, sale?.grandTotal, sale?.finalTotal, sale?.amount, sale?.netTotal),
          0,
        );
      }

      const data = {
        todaySalesAmount: sales.reduce(
          (accumulator, sale) =>
            accumulator +
            pickNumber(sale?.totalAmount, sale?.total, sale?.grandTotal, sale?.finalTotal, sale?.amount, sale?.netTotal),
          0,
        ),
        todaySalesCount: sales.length,
        unpaidCount: sales.reduce((accumulator, sale) => (isPaidSale(sale) ? accumulator : accumulator + 1), 0),
        monthSalesAmount: monthSalesAmount == null ? undefined : monthSalesAmount,
        todaySalesAmountHint: scope === 'today' ? 'ยอดรวมช่วงวันนี้' : 'ยอดรวมตามช่วงเวลาที่เลือก',
        todaySalesCountHint: scope === 'today' ? 'จำนวนบิลช่วงวันนี้' : 'จำนวนบิลตามช่วงเวลาที่เลือก',
        unpaidHint: 'รายการที่ยังไม่เป็น PAID (อิง statusPayment ก่อน แล้ว fallback paid/paidAt)',
        monthSalesAmountHint: scope === 'today' ? 'ยอดสะสมเดือนนี้ (month-to-date)' : 'ยอดสะสมเดือนนี้ (อิงช่วงเวลาที่เลือก)',
      };

      set({ salesOverviewLastLoadedAt: new Date().toISOString() });
      return data;
    } catch (error) {
      devError('❌ [fetchSalesDashboardOverviewAction] error:', error);
      const message =
        error?.response?.data?.error || error?.response?.data?.message || error?.message || 'โหลดภาพรวมการขายไม่สำเร็จ';
      set({ salesOverviewError: message });
      throw error;
    } finally {
      set({ salesOverviewLoading: false });
    }
  },
});
