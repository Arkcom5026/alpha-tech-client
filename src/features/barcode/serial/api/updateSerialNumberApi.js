import apiClient from '@/utils/apiClient';

export const updateSerialNumberApi = async ({ barcode, serialNumber }) => {
  const response = await apiClient.patch('/barcodes/update-serial-number', {
    barcode,
    serialNumber,
  });

  return response.data;
};
