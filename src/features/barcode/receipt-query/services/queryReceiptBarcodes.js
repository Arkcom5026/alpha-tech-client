import { getReceiptBarcodeSummariesApi } from '../api/getReceiptBarcodeSummariesApi';
import {
  projectReceiptBarcodeQueryParams,
  projectReceiptBarcodeQueryResult,
} from '../projections/receiptBarcodeQueryProjection';

export const queryReceiptBarcodes = async (
  input = {},
  dependencies = {}
) => {
  const queryApi = dependencies.queryApi || getReceiptBarcodeSummariesApi;
  const params = projectReceiptBarcodeQueryParams(input);
  const response = await queryApi(params);

  return {
    ...projectReceiptBarcodeQueryResult(response),
    params,
  };
};
