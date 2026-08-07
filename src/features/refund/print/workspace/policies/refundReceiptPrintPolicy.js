export const prepareRefundReceiptPrintProjection = (saleReturn, branch) => {
  const source = saleReturn || {};
  const refundTransactions = Array.isArray(source.refundTransaction)
    ? source.refundTransaction
    : [];

  const totalRefund = Number(source.totalRefund || 0);
  const deductedAmount = Number(source.deductedAmount || 0);
  const totalAmount = refundTransactions.reduce(
    (sum, transaction) => sum + Number(transaction?.amount || 0),
    0,
  );

  return {
    code: source.code,
    createdAt: source.createdAt,
    customerName: source.sale?.customer?.name || '-',
    saleCode: source.sale?.code || '-',
    refundTransactions,
    totalRefund,
    refundedAmount: Number(source.refundedAmount || 0),
    deductedAmount,
    totalAmount,
    remainingAmount: totalRefund - totalAmount - deductedAmount,
    branch: {
      name: branch?.name || '-',
      address: branch?.address || '-',
      phone: branch?.phone || '-',
      taxId: branch?.taxId || '-',
      email: branch?.email || '-',
      contactName: branch?.contactName || '-',
    },
  };
};

export const formatRefundReceiptMoney = (value) => Number(value || 0).toFixed(2);
