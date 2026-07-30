import { receiveStockItemApi } from '../api/receiveStockItemApi';
import {
  projectStockItemReceiveCommand,
  projectStockItemReceiveResult,
} from '../projections/stockItemReceiveProjection';

export const receiveScannedStockItem = async (input, maybeSerialNumber) => {
  const command = projectStockItemReceiveCommand(input, maybeSerialNumber);
  const sourceResponse = await receiveStockItemApi(command.payload);

  return {
    ...projectStockItemReceiveResult(sourceResponse),
    command,
  };
};
