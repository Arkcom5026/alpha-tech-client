const toNullableNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const getPaidAmount = (sale) => {
  const candidates = [
    sale?.paidAmount,
    sale?.paidTotal,
    sale?.paid,
    sale?.paidSum,
    sale?.totalPaid,
  ];

  for (const candidate of candidates) {
    const parsed = toNullableNumber(candidate);
    if (parsed != null) return parsed;
  }

  if (Array.isArray(sale?.payments)) {
    return round2(
      sale.payments.reduce(
        (sum, payment) => sum + (toNullableNumber(payment?.amount ?? payment?.receivedAmount) || 0),
        0
      )
    );
  }

  return 0;
};

const getGrossAmount = (sale) => {
  const totalAmount = toNullableNumber(sale?.totalAmount);
  const totalBeforeDiscount = toNullableNumber(sale?.totalBeforeDiscount);

  if (totalAmount != null && totalBeforeDiscount != null) {
    return round2(
      Math.abs(totalAmount - totalBeforeDiscount) <= 0.05
        ? totalAmount
        : Math.min(totalAmount, totalBeforeDiscount)
    );
  }

  if (totalBeforeDiscount != null) return round2(totalBeforeDiscount);
  if (totalAmount != null) return round2(totalAmount);

  const beforeVat = toNullableNumber(
    sale?.beforeVat ?? sale?.totalBeforeVat ?? sale?.subTotal ?? sale?.subtotalAmount
  );
  const vatAmount = toNullableNumber(
    sale?.vatAmount ?? sale?.vat ?? sale?.taxAmount ?? sale?.vatTotal
  );

  if (beforeVat != null && vatAmount != null) return round2(beforeVat + vatAmount);

  for (const candidate of [
    sale?.grandTotal,
    sale?.totalWithVat,
    sale?.totalInclVat,
    sale?.totalAmountGross,
    sale?.totalFinal,
    sale?.amountTotal,
    sale?.total,
  ]) {
    const parsed = toNullableNumber(candidate);
    if (parsed != null) return round2(parsed);
  }

  return round2(beforeVat || vatAmount || 0);
};

const getBalanceAmount = (sale) => {
  for (const candidate of [
    sale?.remainingAmount,
    sale?.balanceDue,
    sale?.unpaidAmount,
    sale?.dueAmount,
    sale?.balanceAmount,
  ]) {
    const parsed = toNullableNumber(candidate);
    if (parsed != null) return parsed;
  }

  return Math.max(0, round2(getGrossAmount(sale) - getPaidAmount(sale)));
};

export const DELIVERY_NOTE_SEARCH_POLICY = Object.freeze({
  id: 'DELIVERY_NOTE',
  queryParams: Object.freeze({ onlyUnpaid: 1 }),
  isEligible: (sale) => {
    if (getBalanceAmount(sale) > 0.0001) return true;
    if (sale?.isPaid === false) return true;
    return String(sale?.paymentStatus || '').toUpperCase() === 'UNPAID';
  },
  projectRow: (sale) => {
    const createdAt = sale?.createdAt ?? sale?.soldAt ?? null;
    const createdAtMs = createdAt ? new Date(createdAt).getTime() : 0;
    const agingDays = createdAtMs
      ? Math.floor(Math.max(0, Date.now() - createdAtMs) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      id: sale?.id,
      code: sale?.code,
      companyName: sale?.companyName ?? sale?.customer?.companyName ?? '-',
      customerName: sale?.customerName ?? sale?.customer?.name ?? '-',
      customerPhone: sale?.customerPhone ?? sale?.customer?.phone ?? '-',
      totalAmount: getGrossAmount(sale),
      paidAmount: getPaidAmount(sale),
      balanceAmount: getBalanceAmount(sale),
      createdAt,
      agingDays,
      lastPaidAt: sale?.lastPaidAt ?? sale?.lastReceivedAt ?? null,
      employeeName: sale?.employeeName ?? sale?.employee?.name ?? '-',
    };
  },
});
