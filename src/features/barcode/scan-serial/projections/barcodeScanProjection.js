const clean = (value) => String(value ?? '').trim();

export const projectScanInput = (input, maybeSerialNumber) => {
  const source = typeof input === 'object' && input !== null ? input : {};
  const nested = source.barcode && typeof source.barcode === 'object' ? source.barcode : null;

  const barcode = clean(nested?.barcode ?? source.barcode ?? input);
  const serialNumber = clean(nested?.serialNumber ?? source.serialNumber ?? maybeSerialNumber);
  const keepSN = nested?.keepSN === true || source.keepSN === true;

  if (!barcode) throw new Error('Missing barcode');

  return {
    barcode,
    serialNumber: serialNumber || null,
    keepSN,
    sourceInput: input,
  };
};

export const projectReceivePayload = (input, maybeSerialNumber) => {
  const scan = projectScanInput(input, maybeSerialNumber);
  if (!scan.serialNumber && !scan.keepSN) return { barcode: scan.barcode };

  return {
    barcode: {
      barcode: scan.barcode,
      ...(scan.serialNumber ? { serialNumber: scan.serialNumber } : {}),
    },
    keepSN: scan.keepSN,
  };
};

export const projectCommitScanItems = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const barcode = clean(item?.barcode);
      const sn = clean(item?.sn ?? item?.serialNumber);
      if (!barcode) return null;
      return sn ? { barcode, sn } : { barcode };
    })
    .filter(Boolean);

export const projectCommitScanResult = (response = {}) => ({
  ok: response?.ok === true,
  committed: Array.isArray(response?.committed) ? response.committed : [],
  errors: Array.isArray(response?.errors) ? response.errors : [],
  message: clean(response?.message) || null,
  sourceResponse: response,
});

export const projectBarcodeScanError = (error, fallback = 'บันทึกข้อมูลการสแกนไม่สำเร็จ') => {
  const backendMessage = clean(error?.response?.data?.message);
  if (backendMessage) return backendMessage;

  const message = clean(error?.message);
  if (message && !/^request failed with status code\s+\d+$/i.test(message) && message !== 'Network Error') {
    return message;
  }
  return fallback;
};
