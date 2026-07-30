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

It may own supplier, product-type, brand, and product reference-data access when those files were created specifically for the Purchase Order workflow.

Must not own receipt-entry eligibility, receipt-specific detail projections, barcode generation, or stock activation.

### Purchase Order Receipt
Owns receipt documents, receipt items, partial/full receipt progress, receipt-entry eligibility, receipt-specific purchase-order projections, and receipt finalization.

Must not generate barcodes internally and must not create or activate StockItem records.

### Barcode
Owns barcode generation, listing, printing, reprinting, scanning input, barcode validation, audit, and barcode completion.

Must not own StockItem receiving, inventory activation, ready-for-sale state, cost, warehouse, shelf, or stock lifecycle rules.

### StockItem
Owns receiving into stock, creating/activating sellable stock records, serial ownership after receipt, cost, branch/warehouse/shelf placement, availability, reservation, and inventory lifecycle.

## Cross-Module Rule

File ownership follows business responsibility, not the domain from which the file reads data.

A module may own an adapter, query, mapper, hook, or helper that reads another domain when that file exists specifically to complete the owning module's workflow.

A module may initiate the next business step from its UI, but it must call the public boundary of the target module. It must not import the target module's internal service, repository, projection, or implementation details.

## Initial Audit Finding

At base commit `826373ae73dee042bc50f89a4c62e5cf412f3e1e`, `src/features/barcode/store/barcodeStore.js` imports `receiveStockItem` from the Barcode compatibility facade. That facade delegates to `src/features/barcode/scan`, whose API posts to `/stock-items/receive-sn`.

This means StockItem receiving is currently implemented inside a Barcode slice even though the endpoint and business responsibility belong to StockItem.

The user-facing sequence remains valid: a user can scan from the Barcode workflow and then trigger stock receipt. The correction is to move runtime ownership to StockItem while Barcode only coordinates the transition through StockItem's public interface.

## Purchase Order Upstream Audit

The Purchase Order API contained a generic `getEligiblePurchaseOrders` query using `PENDING,PARTIALLY_RECEIVED` status filtering. Its purpose was to supply PurchaseOrderReceipt entry rather than to operate the Purchase Order workflow itself.

PurchaseOrderReceipt already owns explicit receipt-facing boundaries:

- `/purchase-orders/eligible-for-receipt`
- `/purchase-orders/:poId/detail-for-receipt`

The generic receipt-entry helper was therefore removed from `purchaseOrderApi.js`. A repository contract now locks the following decisions:

- Receipt eligibility and receipt-specific purchase-order detail belong to PurchaseOrderReceipt.
- Supplier, product-type, brand, and product queries created for Purchase Order creation remain owned by Purchase Order even though they read other domains.
- Purchase Order remains the upstream owner of ordering and purchase-order lifecycle only.

The complete Purchase Order surface was then reviewed across API, store, hooks, components, schema, mappers, policies, projections, controllers, and pages. No downstream implementation import from PurchaseOrderReceipt, Barcode, or StockItem was found in the certified runtime surface.

An unused `getPurchaseOrdersBySupplier` API helper was removed because no Purchase Order workflow consumed it. The ownership contract now also prevents downstream module imports/endpoints and prevents that unused helper from returning without an explicit business owner.

Repository conclusion for Purchase Order:

- Business ownership is self-contained.
- Cross-domain reference data remains locally owned because it exists for Purchase Order creation/editing.
- Receipt-entry operations are excluded.
- Barcode and StockItem runtime operations are excluded.
- Runtime and production-build certification remain pending local execution evidence.

## Increment Order

1. Establish this authority map and audit all four module surfaces.
2. Audit and certify Purchase Order as the upstream owner; move receipt-entry concerns to PurchaseOrderReceipt.
3. Audit PurchaseOrderReceipt ownership and remove Barcode-facing or StockItem-facing files that do not belong to receipt confirmation.
4. Verify Barcode owns only barcode identity, generation, printing, validation, audit, and scan input.
5. Verify StockItem owns receiving, activation, availability, and stock lifecycle.
6. Run focused tests, module regression, and production build.

## Completion Standard

The increment is complete only when repository boundaries are clean and local runtime evidence confirms tests and production build pass. Repository review alone is not runtime certification.
