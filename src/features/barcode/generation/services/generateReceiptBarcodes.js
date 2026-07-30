import { generateMissingBarcodesApi } from '../api/generateMissingBarcodesApi';
import {
  projectBarcodeGenerationOptions,
  projectBarcodeGenerationResult,
} from '../projections/barcodeGenerationProjection';

export const generateReceiptBarcodes = async ({ receiptId, options = {} } = {}) => {
  const normalizedReceiptId = Number(receiptId);

  if (!Number.isFinite(normalizedReceiptId) || normalizedReceiptId <= 0) {
    throw new Error('receiptId ไม่ถูกต้อง');
  }

  const projectedOptions = projectBarcodeGenerationOptions(options);
  const response = await generateMissingBarcodesApi(
    normalizedReceiptId,
    projectedOptions
  );

  return projectBarcodeGenerationResult(response);
};

export default generateReceiptBarcodes;
