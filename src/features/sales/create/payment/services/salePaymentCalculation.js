const round2 = (value) => Number((Number(value) || 0).toFixed(2));

export const parseSalePaymentMoney = (value) => {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getItemPrice = (item) => parseSalePaymentMoney(
  item?.price ?? item?.sellPrice ?? item?.unitPrice ?? 0
);

const getItemDiscount = (item) => parseSalePaymentMoney(
  item?.discountWithoutBill ?? item?.discount ?? 0
);

export const projectSalePaymentCalculation = ({
  saleItems = [],
  billDiscount = 0,
  paymentList = [],
  depositUsed = 0,
  vatRate = 7,
} = {}) => {
  const items = Array.isArray(saleItems) ? saleItems : [];
  const payments = Array.isArray(paymentList) ? paymentList : [];

  const totalOriginalPrice = round2(items.reduce((sum, item) => sum + getItemPrice(item), 0));
  const totalDiscountOnly = round2(items.reduce((sum, item) => sum + getItemDiscount(item), 0));
  const safeBillDiscount = parseSalePaymentMoney(billDiscount);
  const totalDiscount = round2(totalDiscountOnly + safeBillDiscount);
  const totalToPay = round2(Math.max(totalOriginalPrice - totalDiscount, 0));
  const vatAmount = totalToPay > 0 ? round2((totalToPay * vatRate) / (100 + vatRate)) : 0;
  const priceBeforeVat = totalToPay > 0 ? round2(totalToPay - vatAmount) : 0;
  const safeDepositUsed = Math.min(parseSalePaymentMoney(depositUsed), totalToPay);

  const cashAmount = parseSalePaymentMoney(
    payments.find((payment) => payment?.method === 'CASH')?.amount || 0
  );
  const totalPaid = round2(
    payments.reduce((sum, payment) => sum + parseSalePaymentMoney(payment?.amount), 0)
  );
  const paidByOther = round2(totalPaid - cashAmount);
  const remainingToPay = round2(Math.max(totalToPay - paidByOther - safeDepositUsed, 0));
  const changeAmount = round2(Math.max(cashAmount - remainingToPay, 0));
  const totalPaidNet = round2(totalPaid - changeAmount);
  const grandTotalPaid = round2(totalPaidNet + safeDepositUsed);

  return {
    itemCount: items.length,
    totalOriginalPrice,
    totalDiscountOnly,
    safeBillDiscount,
    totalDiscount,
    totalToPay,
    vatRate,
    vatAmount,
    priceBeforeVat,
    safeDepositUsed,
    cashAmount,
    totalPaid,
    paidByOther,
    remainingToPay,
    changeAmount,
    totalPaidNet,
    grandTotalPaid,
  };
};
