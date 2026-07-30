import { commitReceiptScansApi } from '../api/commitReceiptScansApi';
import {
  projectReceiptScanCommitCommand,
  projectReceiptScanCommitFailure,
  projectReceiptScanCommitResult,
} from '../projections/receiptScanCommitProjection';

export const commitReceiptScans = async (receiptId, items) => {
  const command = projectReceiptScanCommitCommand(receiptId, items);

  try {
    const sourceResponse = await commitReceiptScansApi(command);
    return {
      ...projectReceiptScanCommitResult(sourceResponse),
      command,
    };
  } catch (error) {
    return {
      ...projectReceiptScanCommitFailure(error),
      command,
    };
  }
};
