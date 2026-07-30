import apiClient from '@/utils/apiClient';

const requestWithFallback = async (primaryPath, fallbackPath) => {
  try {
    const { data } = await apiClient.get(primaryPath);
    return data;
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
    const { data } = await apiClient.get(fallbackPath);
    return data;
  }
};

export const getReceiptsReadyToScanSnApi = async () =>
  requestWithFallback(
    '/barcodes/receipts-ready-to-scan-sn',
    '/barcodes/ready-to-scan-sn'
  );

export const getReceiptsReadyToScanApi = async () =>
  requestWithFallback(
    '/barcodes/receipts-ready-to-scan',
    '/barcodes/ready-to-scan'
  );
