import { markSaleAsPaid } from '../api/saleHistoryApi';
import {
  projectSaleSettlementFailure,
  projectSaleSettlementSuccess,
} from '../services/saleSettlementResult';
import { devError } from '../../shared/saleStoreSupport';
import { createSaleDashboardRuntimeCapability } from './saleDashboardRuntimeCapability';
import { createSaleHistoryQueryRuntimeCapability } from './saleHistoryQueryRuntimeCapability';
import { createSalePrintableRuntimeCapability } from './salePrintableRuntimeCapability';

export const createSaleHistoryRuntimeSlice = (set, get) => ({
  ...createSaleDashboardRuntimeCapability(set),
  ...createSaleHistoryQueryRuntimeCapability(set, get),
  ...createSalePrintableRuntimeCapability(set),

  markSalePaidAction: async (saleId) => {
    try {
      const data = await markSaleAsPaid(saleId);
      return projectSaleSettlementSuccess(data);
    } catch (error) {
      devError('❌ [markSalePaidAction]', error);
      return projectSaleSettlementFailure(error);
    }
  },
});
