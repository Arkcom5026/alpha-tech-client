export const prepareRefundReceiptPrintProjection = (saleReturn, branch, presentationAuthority = {}) => {
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

  const headerConfig = presentationAuthority?.headerConfig || null;
  const presentation = presentationAuthority?.presentation || null;

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
      name: headerConfig?.branchName || branch?.name || '-',
      address: headerConfig?.address || branch?.address || '-',
      phone: headerConfig?.phone || branch?.phone || '-',
      taxId: headerConfig?.taxId || branch?.taxId || '-',
      email: branch?.email || '-',
      contactName: branch?.contactName || '-',
      logoUrl: headerConfig?.logoUrl || null,
      headerStyle: headerConfig?.headerStyle || null,
    },
    presentation: {
      notes: presentation?.notes || '',
      customFooter: presentation?.customFooter || '',
    },
  };
};

export const formatRefundReceiptMoney = (value) => Number(value || 0).toFixed(2);
