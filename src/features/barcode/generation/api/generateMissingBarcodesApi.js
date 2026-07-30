import { generateMissingBarcodes as generateMissingBarcodesLegacy } from '../../api/barcodeApi';

/**
 * Module-owned API boundary for barcode generation.
 *
 * The legacy API implementation remains the HTTP transport authority during
 * additive migration. Consumers of the generation slice should depend on this
 * boundary instead of importing the broad barcode API directly.
 */
export const generateMissingBarcodesApi = async (receiptId, options = {}) =>
  generateMissingBarcodesLegacy(receiptId, options);

export default generateMissingBarcodesApi;
