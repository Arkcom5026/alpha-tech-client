const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculatePrintableDocumentTotal = (items = []) => (
  (Array.isArray(items) ? items : []).reduce((sum, item) => {
    const quantity = toNumber(item?.quantity);
    const unitPrice = toNumber(item?.price ?? item?.unitPrice ?? item?.unitAmount);
    return sum + (quantity * unitPrice);
  }, 0)
);

export const resolveDeliveryNotePrintableSale = ({
  sale,
  printableItems,
  preparationStatus,
  replacementAuthorityActive = false,
} = {}) => {
  if (!sale) return sale;

  const lockedDocumentAuthority = replacementAuthorityActive || preparationStatus === 'LOCKED';
  if (!lockedDocumentAuthority) return sale;

  return {
    ...sale,
    totalAmount: calculatePrintableDocumentTotal(printableItems),
  };
};
