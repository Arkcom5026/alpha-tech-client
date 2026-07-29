const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeSalesDashboardRows = (rows) => {
  if (Array.isArray(rows)) return rows;
  if (!rows || typeof rows !== 'object') return [];

  const direct = [rows.items, rows.sales, rows.data];
  for (const candidate of direct) {
    if (Array.isArray(candidate)) return candidate;
  }

  const nested = rows.result;
  if (nested && typeof nested === 'object') {
    const candidates = [nested.items, nested.sales, nested.data];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
  }

  return [];
};

export const isSalesDashboardPaidSale = (sale) => {
  const statusPayment = String(sale?.statusPayment || '').toUpperCase();
  if (statusPayment === 'PAID' || statusPayment === 'CANCELLED') return true;
  if (['UNPAID', 'PARTIALLY_PAID', 'WAITING_APPROVAL'].includes(statusPayment)) return false;

  if (sale?.isPaid === true || sale?.paid === true || sale?.paidAt) return true;

  const fallbackStatuses = [sale?.paymentStatus, sale?.status, sale?.lifecycleStatus]
    .map((value) => String(value || '').toUpperCase());
  if (fallbackStatuses.includes('PAID')) return true;

  const payments = Array.isArray(sale?.payments)
    ? sale.payments
    : Array.isArray(sale?.paymentList)
      ? sale.paymentList
      : [];

  return payments.reduce(
    (sum, payment) => sum + toNumber(payment?.amount ?? payment?.paidAmount ?? payment?.value),
    0
  ) > 0;
};

export const projectSalesDashboardOverview = ({
  rows,
  monthRows,
  scope = 'today',
} = {}) => {
  const sales = normalizeSalesDashboardRows(rows);
  const monthSales = normalizeSalesDashboardRows(monthRows);
  const pickAmount = (sale) => toNumber(
    sale?.totalAmount
      ?? sale?.total
      ?? sale?.grandTotal
      ?? sale?.finalTotal
      ?? sale?.amount
      ?? sale?.netTotal
  );

  return {
    todaySalesAmount: sales.reduce((sum, sale) => sum + pickAmount(sale), 0),
    todaySalesCount: sales.length,
    unpaidCount: sales.reduce((sum, sale) => sum + (isSalesDashboardPaidSale(sale) ? 0 : 1), 0),
    monthSalesAmount: monthRows == null
      ? undefined
      : monthSales.reduce((sum, sale) => sum + pickAmount(sale), 0),
    todaySalesAmountHint: scope === 'today'
      ? 'ยอดรวมช่วงวันนี้'
      : 'ยอดรวมตามช่วงเวลาที่เลือก',
    todaySalesCountHint: scope === 'today'
      ? 'จำนวนบิลช่วงวันนี้'
      : 'จำนวนบิลตามช่วงเวลาที่เลือก',
    unpaidHint: 'รายการที่ยังไม่เป็น PAID (อิง statusPayment ก่อน แล้ว fallback paid/paidAt)',
    monthSalesAmountHint: scope === 'today'
      ? 'ยอดสะสมเดือนนี้ (month-to-date)'
      : 'ยอดสะสมเดือนนี้ (อิงช่วงเวลาที่เลือก)',
  };
};
