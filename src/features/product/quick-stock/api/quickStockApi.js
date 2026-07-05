// src/features/product/quick-stock/api/quickStockApi.js
//
// Phase 1 adapter file.
// QuickStock runtime is now isolated under product/quick-stock.
// API calls are still delegated through quickReceiveStore actions inside the runtime page
// to preserve behavior during migration.

export const QUICK_STOCK_RUNTIME_API_PHASE = "PHASE_1_STORE_ADAPTER";

export default {
  phase: QUICK_STOCK_RUNTIME_API_PHASE,
};
