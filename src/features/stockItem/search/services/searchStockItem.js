import { searchStockItemApi } from '../api/searchStockItemApi';
import {
  projectStockItemSearchError,
  projectStockItemSearchResult,
} from '../projections/stockItemSearchProjection';

export const searchStockItem = async (query) => {
  try {
    const sourceResponse = await searchStockItemApi(query);
    return projectStockItemSearchResult(sourceResponse);
  } catch (error) {
    const projected = projectStockItemSearchError(error);

    if (projected.handled) {
      return projected.result;
    }

    throw projected.error;
  }
};
