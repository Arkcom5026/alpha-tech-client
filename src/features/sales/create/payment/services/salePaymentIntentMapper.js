import { parseSalePaymentMoney } from './salePaymentCalculation';

const normalizePaymentMethod = (method) => {
  const normalized = String(method || '').toUpperCase();
  return normalized === 'CARD' ? 'CREDIT' : normalized;
};

export const mapSalePaymentIntent = ({
  paymentList = [],
  changeAmount = 0,
  depositUsed = 0,
  selectedDeposit,
  cardRef,
} = {}) => {
  const payments = Array.isArray(paymentList) ? paymentList : [];
  const safeChangeAmount = parseSalePaymentMoney(changeAmount);

  const mappedPayments = payments.map((payment) => {
    const method = normalizePaymentMethod(payment?.method);
    const amount = parseSalePaymentMoney(payment?.amount);
    const appliedAmount = method === 'CASH'
      ? Math.max(amount - safeChangeAmount, 0)
      : amount;

    return {
      paymentMethod: method,
      amount: appliedAmount,
      note: payment?.note || null,
      cardRef: payment?.cardRef || (method === 'CREDIT' ? cardRef || null : null),
      customerDepositId: payment?.customerDepositId || null,
    };
  });

  const safeDepositUsed = parseSalePaymentMoney(depositUsed);
  if (safeDepositUsed > 0 && selectedDeposit?.id) {
    mappedPayments.push({
      paymentMethod: 'DEPOSIT',
      amount: safeDepositUsed,
      note: 'customer deposit',
      cardRef: null,
      customerDepositId: selectedDeposit.id,
    });
  }

  return {
    paymentItems: mappedPayments.filter((payment) => payment.amount > 0),
  };
};
