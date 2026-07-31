import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createStockItemReceiveSlice } from './createStockItemReceiveSlice';

const useStockItemReceiveStore = create(
  devtools((set, get) => ({
    ...createStockItemReceiveSlice(set, get),
  }))
);

export default useStockItemReceiveStore;
