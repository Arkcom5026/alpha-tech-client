import apiClient from '@/utils/apiClient';

/**
 * Module-owned HTTP transport boundary for barcode generation.
 */
export const generateMissingBarcodesApi = async (receiptId, options = {}) => {
  if (!receiptId) throw new Error('Missing receiptId');

  const { dryRun = false, lotLabelPerLot = 1 } = options || {};
  const payload = {
    dryRun: Boolean(dryRun),
    lotLabelPerLot: Number(lotLabelPerLot) || 1,
  };

  try {
    const { data } = await apiClient.post(
      `/barcodes/generate-missing/${receiptId}`,
      payload,
    );
    return data;
  } catch (error) {
    console.error('❌ generateMissingBarcodesApi error:', error);
    throw error;
  }
};

export default generateMissingBarcodesApi;
