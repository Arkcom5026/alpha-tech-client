import apiClient from '@/utils/apiClient';

export const updateSerialNumberApi = async ({ barcode, serialNumber }) => {
  const normalizedBarcode = String(barcode ?? '').trim();
  if (!normalizedBarcode) throw new Error('Missing barcode');

  const response = await apiClient.patch(
    `/stock-items/update-sn/${encodeURIComponent(normalizedBarcode)}`,
    {
      serialNumber: String(serialNumber ?? '').trim() || null,
    },
  );

  return response.data;
};
