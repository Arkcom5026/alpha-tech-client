import {
  getReceiptsReadyToScanApi,
  getReceiptsReadyToScanSnApi,
} from '../api/getReceiptsReadyToScanApi';
import { projectScanReceiptListingResult } from '../projections/scanReceiptListingProjection';

export const listReceiptsReadyToScanSn = async () => {
  const response = await getReceiptsReadyToScanSnApi();
  return projectScanReceiptListingResult(response);
};

export const listReceiptsReadyToScan = async () => {
  const response = await getReceiptsReadyToScanApi();
  return projectScanReceiptListingResult(response);
};
