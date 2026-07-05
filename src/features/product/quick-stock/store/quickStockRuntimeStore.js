// src/features/product/quick-stock/store/quickStockRuntimeStore.js
//
// Phase 1 placeholder.
// QuickStock still uses quickReceiveStore while we migrate behavior incrementally.
// Keep this file as the future isolated runtime store boundary.

import { create } from "zustand";

const useQuickStockRuntimeStore = create(() => ({
  phase: "PHASE_1_STORE_BOUNDARY",
}));

export default useQuickStockRuntimeStore;
