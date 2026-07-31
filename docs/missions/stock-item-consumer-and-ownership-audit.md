# StockItem Consumer and Ownership Audit

## Purpose

Record current StockItem frontend consumers and establish the migration authority for StockItem Module Architecture v2.

## Current broad owners

### Root API facade

`src/features/stockItem/api/stockItemApi.js`

Currently owns multiple unrelated capabilities:

- receive scanned stock item
- bulk receive pending non-SN items
- search stock item
- mark stock items as sold
- query available stock items by product

This file is a migration compatibility surface, not the final capability boundary.

### Root Zustand store

`src/features/stockItem/store/stockItemStore.js`

Currently owns:

- scan-session list state
- receive validation
- receive API orchestration
- bulk receive orchestration
- sold lifecycle mutation
- stock-item search
- availability query
- scan-session undo/remove/reset helpers

This is a hybrid owner and must be decomposed incrementally.

## Confirmed runtime consumers

### Receive workflow UI

`src/features/stockItem/pages/ScanBarcodeListPage.jsx`

Consumes:

- `useStockItemStore.receiveSNAction`
- `useStockItemStore.receiveAllPendingNoSNAction`

The page also consumes Barcode-owned receipt/barcode state. This is an intentional composition boundary:

- Barcode owns receipt barcode identity, scan state and serial update concerns.
- StockItem owns receive-into-inventory mutations.
- PurchaseOrderReceipt owns receipt finalization.

### Cross-module Barcode consumer

`src/features/barcode/scan-serial/services/barcodeScanService.js`

Consumes StockItem only through:

```text
@/features/stockItem/receive
```

This is the correct public-boundary direction and must remain protected.

## Existing StockItem slice foundation

`src/features/stockItem/receive/`

Already provides a module-owned receive boundary with API, service and projection responsibilities. The next migration increment will complete runtime ownership by moving root-store receive orchestration behind this slice without changing page behavior.

## Capability map

| Capability | Current owner | Target owner |
| --- | --- | --- |
| Receive scanned item | root API + root store + receive slice | `stockItem/receive` |
| Bulk receive non-SN | root API + root store | `stockItem/receive/bulk` or receive slice sub-capability |
| Search stock item | root API + root store | `stockItem/query/search` |
| Available by product | root API + root store | `stockItem/query/availability` |
| Mark sold | root API + root store | `stockItem/lifecycle/sold` |
| Scan-session state | root store | receive workflow state owner |

## Ownership invariants

1. StockItem owns inventory-item lifecycle and ready-for-sale availability.
2. Barcode must not own `/stock-items/*` transport.
3. PurchaseOrderReceipt must not own StockItem receive transport or stock lifecycle.
4. Sales may orchestrate sale completion but must consume StockItem through a public boundary.
5. Cross-module imports must target StockItem public slice entry points, not internal API files.
6. The broad root facade/store may be retired only after all consumers are proven migrated.

## Next increment

Create certification contracts that:

- identify the root API and root store as temporary compatibility surfaces;
- lock receive ownership to `stockItem/receive`;
- forbid Barcode and PurchaseOrderReceipt from importing StockItem internals;
- require the receive workflow page to consume a StockItem public workflow boundary after cutover;
- provide explicit retirement conditions for the root facade and root store.
