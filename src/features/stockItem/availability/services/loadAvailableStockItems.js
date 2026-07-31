import { getAvailableStockItemsApi } from '../api/getAvailableStockItemsApi';
import {
  projectAvailableStockItemsCommand,
  projectAvailableStockItemsResult,
} from '../projections/stockItemAvailabilityProjection';

export const loadAvailableStockItems = async (productId) => {
  const command = projectAvailableStockItemsCommand(productId);
  const sourceResponse = await getAvailableStockItemsApi(command.productId);

  return projectAvailableStockItemsResult(sourceResponse);
};
