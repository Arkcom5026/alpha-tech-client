import apiClient from '@/utils/apiClient';

export const updateBarcodeSerialNumberApi = async ({ barcode, serialNumber }) => {
  const { data } = await apiClient.patch('/barcodes/update-serial-number', {
    barcode,
    serialNumber,
  });
  return data;
};

export const commitReceiptScansApi = async ({ receiptId, items }) => {
  const { data } = await apiClient.post(`/receipts/${receiptId}/commit-scans`, { items });
  return data;
};
