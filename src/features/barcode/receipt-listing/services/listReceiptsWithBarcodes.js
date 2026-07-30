import { getReceiptsWithBarcodesApi } from '../api/getReceiptsWithBarcodesApi';
import {
  projectReceiptListingParams,
  projectReceiptListingResult,
} from '../projections/receiptListingProjection';

export const listReceiptsWithBarcodes = async (input = {}, dependencies = {}) => {
  const listApi = dependencies.listApi || getReceiptsWithBarcodesApi;
  const params = projectReceiptListingParams(input);
  const response = await listApi(params);

  return {
    params,
    receipts: projectReceiptListingResult(response),
    sourceResponse: response,
  };
};
