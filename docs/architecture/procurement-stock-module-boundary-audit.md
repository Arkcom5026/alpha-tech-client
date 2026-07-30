# Procurement-to-Stock Module Boundary Audit

## Architecture Authority

The business pipeline is:

```text
Purchase Order
    -> Purchase Order Receipt
    -> Barcode
    -> StockItem
```

Each stage is a separate module and a separate business responsibility.

## Ownership Rules

### Purchase Order
Owns supplier ordering, ordered quantities, agreed prices, and purchase-order lifecycle.

Must not own barcode generation or stock activation.

### Purchase Order Receipt
Owns receipt documents, receipt items, partial/full receipt progress, and receipt finalization.

Must not generate barcodes internally and must not create or activate StockItem records.

### Barcode
Owns barcode generation, listing, printing, reprinting, scanning input, barcode validation, audit, and barcode completion.

Must not own StockItem receiving, inventory activation, ready-for-sale state, cost, warehouse, shelf, or stock lifecycle rules.

### StockItem
Owns receiving into stock, creating/activating sellable stock records, serial ownership after receipt, cost, branch/warehouse/shelf placement, availability, reservation, and inventory lifecycle.

## Cross-Module Rule

A module may initiate the next business step from its UI, but it must call the public boundary of the target module. It must not import the target module's internal service, repository, projection, or implementation details.

## Initial Audit Finding

At base commit `826373ae73dee042bc50f89a4c62e5cf412f3e1e`, `src/features/barcode/store/barcodeStore.js` imports `receiveStockItem` from the Barcode compatibility facade. That facade delegates to `src/features/barcode/scan`, whose API posts to `/stock-items/receive-sn`.

This means StockItem receiving is currently implemented inside a Barcode slice even though the endpoint and business responsibility belong to StockItem.

The user-facing sequence remains valid: a user can scan from the Barcode workflow and then trigger stock receipt. The correction is to move runtime ownership to StockItem while Barcode only coordinates the transition through StockItem's public interface.

## Increment Order

1. Establish this authority map and audit all four module surfaces.
2. Move StockItem receiving ownership out of Barcode without changing UI behavior.
3. Separate serial-number ownership according to whether the serial belongs to a pending barcode or an activated StockItem.
4. Verify Purchase Order and Purchase Order Receipt do not own downstream operations.
5. Verify Barcode owns only barcode responsibilities.
6. Run focused tests, module regression, and production build.

## Completion Standard

The increment is complete only when repository boundaries are clean and local runtime evidence confirms tests and production build pass. Repository review alone is not runtime certification.
