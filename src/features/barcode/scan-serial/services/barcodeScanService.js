import {
  commitReceiptScansApi,
  receiveScannedStockItemApi,
  updateBarcodeSerialNumberApi,
} from '../api/barcodeScanApi';
import {
  projectCommitScanItems,
  projectCommitScanResult,
  projectReceivePayload,
  projectScanInput,
} from '../projections/barcodeScanProjection';

const normalizeReceiptId = (receiptId) => {
  const value = Number(receiptId);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Missing receiptId');
  return value;
};

export const receiveScannedStockItem = async (input, maybeSerialNumber, dependencies = {}) => {
  const api = dependencies.receiveScannedStockItemApi || receiveScannedStockItemApi;
  return api(projectReceivePayload(input, maybeSerialNumber));
};

export const assignBarcodeSerialNumber = async (input, dependencies = {}) => {
  const api = dependencies.updateBarcodeSerialNumberApi || updateBarcodeSerialNumberApi;
  const scan = projectScanInput(input);
  if (!scan.serialNumber) throw new Error('Missing serialNumber');
  return api({ barcode: scan.barcode, serialNumber: scan.serialNumber });
};

export const commitReceiptScans = async (receiptId, items, dependencies = {}) => {
  const api = dependencies.commitReceiptScansApi || commitReceiptScansApi;
  const normalizedReceiptId = normalizeReceiptId(receiptId);
  const payloadItems = projectCommitScanItems(items);

  try {
    const response = await api({ receiptId: normalizedReceiptId, items: payloadItems });
    return projectCommitScanResult(response);
  } catch (error) {
    if (error?.response?.data) return projectCommitScanResult(error.response.data);
    throw error;
  }
};
