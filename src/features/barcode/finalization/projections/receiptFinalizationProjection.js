export const projectReceiptFinalizationCommand = (receiptId) => {
  if (!receiptId) throw new Error('Missing receiptId');

  return { receiptId };
};

export const projectReceiptFinalizationResult = (sourceResponse) => ({
  sourceResponse,
});
