# StockItem Compatibility Store Consumer Audit

## Mission

Assess every current source consumer of `src/features/stockItem/store/stockItemStore.js` after Receive, Search, Availability, and Sold store ownership extraction.

## Audit Method

Repository-wide searches were performed for:

- `stockItemStore`
- `useStockItemStore`
- `@/features/stockItem/store/stockItemStore`
- `../../stockItem/store/stockItemStore`
- `deleteStockItem`

## Current Runtime Consumers

### 1. `src/features/stockItem/pages/ScanBarcodeListPage.jsx`

Imported API:

- `receiveSNAction`
- `receiveAllPendingNoSNAction`

Ownership assessment:

- Both actions are now implemented by `createStockItemReceiveSlice`.
- This page remains a real runtime consumer of the compatibility store.
- Retirement requires a dedicated receive-owned store boundary or direct public receive boundary adoption while preserving Zustand selector/runtime behavior.

Classification: **Valid migration consumer — must be migrated before retirement.**

### 2. `src/features/barcode/controllers/ReceivedSNTable.jsx`

Imported/fallback API:

- `stockItems`
- `deleteStockItem`

Ownership assessment:

- Neither member is produced by any current StockItem slice composed by `stockItemStore.js`.
- Repository search found no other `deleteStockItem` implementation or consumer.
- The component already prefers `items` props and uses the store only as a legacy fallback.
- Therefore this dependency is stale and cannot be treated as a valid reason to preserve the compatibility store.

Classification: **Stale legacy fallback — remove or replace before retirement.**

## Store Composition Result

`stockItemStore.js` now contains no inline workflow implementation. It only composes:

- `createStockItemReceiveSlice`
- `createStockItemSearchSlice`
- `createStockItemAvailabilitySlice`
- `createStockItemSoldSlice`

## Retirement Decision

**Do not delete the compatibility store yet.**

The store has one valid runtime consumer (`ScanBarcodeListPage.jsx`) that still relies on receive actions through the shared composition root. `ReceivedSNTable.jsx` is not a valid store contract and should have its stale fallback removed.

## Required Retirement Sequence

1. Remove the stale `ReceivedSNTable.jsx` fallback to `stockItems` and `deleteStockItem`.
2. Introduce or confirm an owned receive store boundary for `ScanBarcodeListPage.jsx`.
3. Migrate `ScanBarcodeListPage.jsx` to that receive-owned boundary.
4. Re-run repository-wide consumer search and contract tests.
5. Delete `stockItemStore.js` only when zero runtime consumers remain.

## Audit Conclusion

Compatibility Store Retirement status: **BLOCKED BY ONE VALID CONSUMER**.

The next safe increment is **ReceivedSNTable Legacy Fallback Retirement**, followed by **ScanBarcodeListPage Receive Store Boundary Cutover**.
