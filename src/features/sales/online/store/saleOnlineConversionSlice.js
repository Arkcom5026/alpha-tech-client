import { convertOrderOnlineToSale } from '../api/saleOnlineConversionApi';
import { devError } from '../../shared/saleStoreSupport';

export const createSaleOnlineConversionSlice = () => ({
  convertOrderOnlineToSaleAction: async (orderOnlineId, stockSelections) => {
    try {
      const res = await convertOrderOnlineToSale(orderOnlineId, stockSelections);
      return res;
    } catch (err) {
      devError('❌ [convertOrderOnlineToSaleAction]', err);
      throw err;
    }
  },
});
