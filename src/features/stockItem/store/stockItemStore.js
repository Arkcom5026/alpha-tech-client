// stockItemStore.js — compatibility store while StockItem capabilities migrate to owned slices
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createStockItemAvailabilitySlice } from '../availability/store/createStockItemAvailabilitySlice';
import { createStockItemReceiveSlice } from '../receive/store/createStockItemReceiveSlice';
import { createStockItemSearchSlice } from '../search/store/createStockItemSearchSlice';
import { createStockItemSoldSlice } from '../sold/store/createStockItemSoldSlice';

const useStockItemStore = create(
  devtools((set, get) => ({
    ...createStockItemReceiveSlice(set, get),
    ...createStockItemSearchSlice(set, get),
    ...createStockItemAvailabilitySlice(set, get),
    ...createStockItemSoldSlice(set, get),
  }))
);

export default useStockItemStore;
