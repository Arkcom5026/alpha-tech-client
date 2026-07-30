import {
  fetchReceiptBarcodesForPrintApi,
  markReceiptBarcodesPrintedApi,
  reprintReceiptBarcodesApi,
  searchReceiptsForReprintApi,
} from '../api/barcodePrintApi';
import {
  projectBarcodePrintRows,
  projectReprintSearchParams,
} from '../projections/barcodePrintProjection';

const normalizeReceiptId = (receiptId) => {
  const normalized = Number(receiptId);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error('receiptId ไม่ถูกต้อง');
  }
  return normalized;
};

export const loadReceiptBarcodesForPrint = async (receiptId, options = {}) => {
  const normalizedReceiptId = normalizeReceiptId(receiptId);
  const response = await fetchReceiptBarcodesForPrintApi(normalizedReceiptId, options);
  return {
    receiptId: normalizedReceiptId,
    rows: projectBarcodePrintRows(response),
    sourceResponse: response,
  };
};

export const reprintReceiptBarcodes = async (receiptId) => {
  const normalizedReceiptId = normalizeReceiptId(receiptId);
  const response = await reprintReceiptBarcodesApi(normalizedReceiptId);
  return {
    receiptId: normalizedReceiptId,
    rows: projectBarcodePrintRows(response),
    sourceResponse: response,
  };
};

export const markReceiptBarcodesPrinted = async (receiptId) => {
  const normalizedReceiptId = normalizeReceiptId(receiptId);
  const response = await markReceiptBarcodesPrintedApi(normalizedReceiptId);
  return { receiptId: normalizedReceiptId, sourceResponse: response };
};

export const searchReceiptsForReprint = async (input = {}) => {
  const params = projectReprintSearchParams(input);
  if (!params.query && !params.supplierKeyword) {
    return { params, receipts: [], sourceResponse: [] };
  }

  const response = await searchReceiptsForReprintApi(params);
  const receipts = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  return { params, receipts, sourceResponse: response };
};
