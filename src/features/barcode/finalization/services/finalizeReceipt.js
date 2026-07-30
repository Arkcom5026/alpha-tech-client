import { finalizeReceiptApi } from '../api/finalizeReceiptApi';
import {
  projectReceiptFinalizationCommand,
  projectReceiptFinalizationResult,
} from '../projections/receiptFinalizationProjection';

export const finalizeReceipt = async (receiptId) => {
  const command = projectReceiptFinalizationCommand(receiptId);
  const sourceResponse = await finalizeReceiptApi(command);

  return {
    ...projectReceiptFinalizationResult(sourceResponse),
    command,
  };
};
