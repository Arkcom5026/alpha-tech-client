const normalizeReceiptId = (receiptId) => {
  const value = Number(receiptId);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('receiptId ไม่ถูกต้อง');
  }

  return value;
};

export const projectReceiptBarcodeDetailInput = ({ receiptId, options = {} } = {}) => {
  const kind = options?.kind ? String(options.kind).trim().toUpperCase() : undefined;

  return {
    receiptId: normalizeReceiptId(receiptId),
    params: {
      ...(kind ? { kind } : {}),
      ...(options?.onlyUnscanned ? { onlyUnscanned: 1 } : {}),
      ...(options?.onlyUnactivated ? { onlyUnactivated: 1 } : {}),
    },
  };
};

export const projectReceiptBarcodeDetailResult = (response) => {
  const sourceResponse = response ?? {};
  const rows = Array.isArray(sourceResponse)
    ? sourceResponse
    : Array.isArray(sourceResponse?.barcodes)
      ? sourceResponse.barcodes
      : Array.isArray(sourceResponse?.data)
        ? sourceResponse.data
        : [];

  return {
    barcodes: rows,
    sourceResponse,
  };
};

export const projectReceiptBarcodeDetailError = (error) => {
  const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
  const rawMessage = serverMessage || error?.message;
  const isGenericTransportMessage = /^(network error|request failed with status code \d+)$/i.test(
    String(rawMessage || '').trim()
  );

  return {
    message: !rawMessage || isGenericTransportMessage
      ? 'โหลดบาร์โค้ดของใบรับสินค้าไม่สำเร็จ'
      : rawMessage,
    cause: error,
  };
};
