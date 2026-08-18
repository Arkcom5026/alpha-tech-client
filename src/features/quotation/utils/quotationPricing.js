const moneyNumber = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const normalizeRate = (value) => {
  const rate = Number(value || 0);
  return Number.isFinite(rate) && rate > 0 ? rate : 0;
};

export const isVatInclusiveQuotation = (quotation) => {
  if (!quotation) return true;
  if (!quotation.issuedSnapshot) return true;
  return quotation?.issuedSnapshot?.totals?.vatInclusive === true;
};

export const calculateQuotationTotals = ({
  grossTotal = 0,
  vatEnabled = true,
  vatRate = 7,
  vatInclusive = true,
} = {}) => {
  const gross = Math.max(0, moneyNumber(grossTotal));
  const rate = vatEnabled ? normalizeRate(vatRate) : 0;

  if (!rate) {
    return {
      grossTotal: gross,
      taxableBase: gross,
      vatAmount: 0,
      grandTotal: gross,
    };
  }

  if (vatInclusive) {
    const vatAmount = moneyNumber(gross * rate / (100 + rate));
    return {
      grossTotal: gross,
      taxableBase: moneyNumber(gross - vatAmount),
      vatAmount,
      grandTotal: gross,
    };
  }

  const vatAmount = moneyNumber(gross * rate / 100);
  return {
    grossTotal: gross,
    taxableBase: gross,
    vatAmount,
    grandTotal: moneyNumber(gross + vatAmount),
  };
};
