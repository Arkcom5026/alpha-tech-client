import { getReceiptBarcodesApi } from '../api/getReceiptBarcodesApi';
import {
  projectReceiptBarcodeDetailError,
  projectReceiptBarcodeDetailInput,
  projectReceiptBarcodeDetailResult,
} from '../projections/receiptBarcodeDetailProjection';

export const loadReceiptBarcodes = async (input = {}, dependencies = {}) => {
  const queryApi = dependencies.queryApi || getReceiptBarcodesApi;
  const { receiptId, params } = projectReceiptBarcodeDetailInput(input);

  try {
    const response = await queryApi(receiptId, params);
    return projectReceiptBarcodeDetailResult(response);
  } catch (error) {
    const projectedError = projectReceiptBarcodeDetailError(error);
    const nextError = new Error(projectedError.message);
    nextError.cause = projectedError.cause;
    throw nextError;
  }
};

export default loadReceiptBarcodes;
