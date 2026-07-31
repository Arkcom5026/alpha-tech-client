export const projectReceiptBarcodeAuditCommand = (
  receiptId,
  { includeDetails = true } = {},
) => {
  if (!receiptId) throw new Error('Missing receiptId');

  return {
    receiptId,
    includeDetails: Boolean(includeDetails),
  };
};

export const projectReceiptBarcodeAuditResult = (sourceResponse) => ({
  sourceResponse,
});
