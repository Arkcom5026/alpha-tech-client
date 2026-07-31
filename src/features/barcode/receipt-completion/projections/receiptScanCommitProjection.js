export const projectReceiptScanCommitCommand = (receiptId, items) => {
  if (!receiptId) throw new Error('Missing receiptId');

  const normalizedItems = Array.isArray(items)
    ? items
        .map((item) => {
          const barcode = String(item?.barcode ?? '').trim();
          const serialNumber = String(item?.sn ?? item?.serialNumber ?? '').trim();

          if (!barcode) return null;
          return serialNumber ? { barcode, sn: serialNumber } : { barcode };
        })
        .filter(Boolean)
    : [];

  return {
    receiptId,
    items: normalizedItems,
  };
};

export const projectReceiptScanCommitResult = (sourceResponse) => {
  const data = sourceResponse || {};

  return {
    ok: Boolean(data.ok),
    committed: Array.isArray(data.committed) ? data.committed : [],
    errors: Array.isArray(data.errors) ? data.errors : [],
    message: data.message,
    sourceResponse,
  };
};

export const projectReceiptScanCommitFailure = (error) => {
  const sourceResponse = error?.response?.data;

  if (sourceResponse) {
    return {
      ok: Boolean(sourceResponse.ok),
      committed: Array.isArray(sourceResponse.committed) ? sourceResponse.committed : [],
      errors: Array.isArray(sourceResponse.errors) ? sourceResponse.errors : [],
      message: sourceResponse.message || 'Server error',
      sourceResponse,
    };
  }

  return {
    ok: false,
    committed: [],
    errors: [],
    message: 'Network error',
    sourceResponse: undefined,
  };
};
