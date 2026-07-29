const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const BILL_DOCUMENT_SEARCH_POLICY = Object.freeze({
  id: 'BILL',
  queryParams: Object.freeze({ onlyPaid: 1 }),
  isEligible: (sale) => toNumber(sale?.paidAmount) > 0,
  projectRow: (sale) => {
    const gross = toNumber(sale?.totalAmount);
    const received = toNumber(sale?.paidAmount);
    const appliedPaid = Math.min(received, gross);

    return {
      ...sale,
      grossAmount: gross,
      receivedAmount: received,
      paidAmount: appliedPaid,
      changeAmount: Math.max(received - gross, 0),
      balanceAmount: Math.max(gross - appliedPaid, 0),
    };
  },
});
