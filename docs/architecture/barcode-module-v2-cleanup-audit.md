# Barcode Module Architecture v2 Cleanup Audit

## Mission

Clean the Barcode module after the procurement-to-stock ownership separation while preserving existing user-facing behavior.

This increment is quality and boundary cleanup. It is not a new feature and it must not move StockItem receiving back into Barcode.

## Starting Authority

Base commit:

`8e5b07db0620c8c7220deacca952d50758cfd45f`

The previous increment established:

- Barcode owns barcode generation, detail/listing, scan input, validation, audit, serial update, print/reprint, and barcode completion.
- StockItem owns stock receiving and inventory lifecycle.
- PurchaseOrderReceipt owns receipt finalization.
- Local evidence supplied by the operator: 88 test files / 291 tests passed, typecheck passed, and production build passed.

## Initial Findings

### 1. Barcode store still consumes the compatibility facade

`src/features/barcode/store/barcodeStore.js` imports multiple operations from `src/features/barcode/api/barcodeApi.js`.

The facade remains useful for legacy consumers, but the Barcode store is an internal module consumer and should eventually call slice public boundaries directly. Keeping internal runtime behind the legacy facade makes dependency retirement harder and obscures slice ownership.

### 2. Legacy generation compatibility adapter remains

`src/features/barcode/runtime/generationCompatibilityAdapter.js` provides:

- `generateBarcodesForLegacyStore`
- `runGenerationForLegacyPrintBatch`

The adapter also contains legacy barcode normalization. Its consumers must be identified before removal. No adapter is removed until all current consumers are proven and cut over.

### 3. Barcode normalization is duplicated

`barcodeStore.js` and `generationCompatibilityAdapter.js` both normalize barcode identity, product fields, stock item identity, serial number, and stock status.

This creates drift risk. The target is not a generic shared utility outside the module. The target is one Barcode-owned projection/mapper with explicit consumers inside the Barcode module.

### 4. Cross-module receipt calls require boundary review

`barcodeStore.js` directly imports `finalizeReceiptIfNeeded` and `getReceiptById` from the PurchaseOrderReceipt compatibility API.

The workflow may legitimately initiate receipt queries/finalization, but it should consume the PurchaseOrderReceipt public slice boundary rather than internal or broad compatibility surfaces when a narrower boundary exists.

## Ordered Increment Plan

1. Map all consumers of `barcodeApi.js`, `generationCompatibilityAdapter.js`, and Barcode runtime adapters.
2. Classify every consumer as internal Barcode, external legacy, page-level composition, or test-only.
3. Cut internal Barcode consumers over to slice public boundaries.
4. Consolidate duplicated Barcode normalization under Barcode ownership.
5. Remove only compatibility exports and adapters with zero remaining production consumers.
6. Add contracts preventing internal Barcode code from importing the legacy facade.
7. Run focused tests, full `vitest run`, typecheck, and production build.

## Safety Rules

- No compatibility export is deleted based only on filename or assumption.
- External consumers are migrated before adapter removal.
- No StockItem receive endpoint or receive service may return to Barcode.
- No PurchaseOrderReceipt mutation implementation may move into Barcode.
- Bundle optimization is out of scope until module cleanup is complete and measured separately.
- Runtime PASS requires fresh execution evidence after the final code changes.
