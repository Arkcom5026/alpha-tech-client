// Compatibility composition for existing consumers.
// Runtime behavior is owned by workflow-specific Sales slices.
import { create } from 'zustand';

import { createSaleCreateRuntimeSlice } from '../create/store/saleCreateRuntimeSlice';
import { createSaleDocumentRuntimeSlice } from '../documents/store/saleDocumentRuntimeSlice';
import { createSaleHistoryRuntimeSlice } from '../history/store/saleHistoryRuntimeSlice';
import { createSaleOnlineConversionSlice } from '../online/store/saleOnlineConversionSlice';
import { createSaleReturnRuntimeSlice } from '../return/store/saleReturnRuntimeSlice';
import { createSaleSharedRuntimeSlice } from '../shared/store/saleSharedRuntimeSlice';

const useSalesStore = create((set, get) => ({
  ...createSaleSharedRuntimeSlice(set, get),
  ...createSaleCreateRuntimeSlice(set, get),
  ...createSaleHistoryRuntimeSlice(set, get),
  ...createSaleDocumentRuntimeSlice(set, get),
  ...createSaleReturnRuntimeSlice(set, get),
  ...createSaleOnlineConversionSlice(set, get),
}));

export default useSalesStore;
