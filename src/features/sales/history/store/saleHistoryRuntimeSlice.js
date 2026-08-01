import { createSaleDashboardRuntimeCapability } from './saleDashboardRuntimeCapability';
import { createSaleHistoryQueryRuntimeCapability } from './saleHistoryQueryRuntimeCapability';
import { createSalePrintableRuntimeCapability } from './salePrintableRuntimeCapability';
import { createSaleSettlementRuntimeCapability } from './saleSettlementRuntimeCapability';

export const createSaleHistoryRuntimeSlice = (set, get) => ({
  ...createSaleDashboardRuntimeCapability(set),
  ...createSaleHistoryQueryRuntimeCapability(set, get),
  ...createSalePrintableRuntimeCapability(set),
  ...createSaleSettlementRuntimeCapability(),
});
