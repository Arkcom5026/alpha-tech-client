import { auditReceiptBarcodesApi } from '../api/auditReceiptBarcodesApi';
import {
  projectReceiptBarcodeAuditCommand,
  projectReceiptBarcodeAuditResult,
} from '../projections/receiptBarcodeAuditProjection';

export const auditReceiptBarcodes = async (receiptId, options = {}) => {
  const command = projectReceiptBarcodeAuditCommand(receiptId, options);
  const sourceResponse = await auditReceiptBarcodesApi(command);

  return {
    ...projectReceiptBarcodeAuditResult(sourceResponse),
    command,
  };
};
