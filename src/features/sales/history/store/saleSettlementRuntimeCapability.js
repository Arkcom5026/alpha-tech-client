import { markSaleAsPaid } from '../api/saleHistoryApi';
import {
  projectSaleSettlementFailure,
  projectSaleSettlementSuccess,
} from '../services/saleSettlementResult';
import { devError } from '../../shared/saleStoreSupport';

export const createSaleSettlementRuntimeCapability = () => ({
  markSalePaidAction: async (saleId) => {
    try {
      const data = await markSaleAsPaid(saleId);
      return projectSaleSettlementSuccess(data);
    } catch (err) {
      devError('❌ [markSalePaidAction]', err);
      return projectSaleSettlementFailure(err);
    }
  },
});
