# Barcode Module Ownership Migration

## Mission

Consolidate barcode-specific frontend ownership under `src/features/barcode/` without changing current runtime behavior.

## Permanent Boundary

The barcode module owns:

- barcode generation and identity presentation
- receipt barcode query
- print and reprint workflows
- scan and serial assignment workflows
- barcode audit evidence
- barcode-specific rendering primitives

Other modules retain their own business authority:

- purchase receipt finalization remains owned by `purchaseOrderReceipt`
- stock lifecycle remains owned by `stockItem`
- product history remains owned by `productTrace`

## Migration Rules

1. Move one independently verifiable slice at a time.
2. Keep legacy imports as compatibility shims until all consumers migrate.
3. Do not switch runtime ownership and delete legacy paths in the same increment.
4. Preserve existing routes, UI behavior, API payloads, and user-visible results during structural migration.
5. Require focused runtime evidence before retiring each shim.

## Planned Slices

1. Renderer ownership
2. Generation
3. Receipt query
4. Print and reprint
5. Scan and serial assignment
6. Audit and receipt-completion integration
7. Runtime cutover
8. Legacy path retirement

## Completed Increment — Renderer Ownership

New authority:

- `src/features/barcode/components/BarcodeRenderer.jsx`
- `src/features/barcode/components/BarcodeWithQRRenderer.jsx`
- `src/features/barcode/components/index.js`

Compatibility shims retained:

- `src/components/shared/barcode/BarcodeRenderer.jsx`
- `src/components/shared/barcode/BarcodeWithQRRenderer.jsx`

Focused production build evidence: PASS at commit `c5195d853fb8949839bec4bfaa4438c884e3582e`.

## Completed Increment — Generation Foundation

New testable boundary:

- `src/features/barcode/generation/api/generateMissingBarcodesApi.js`
- `src/features/barcode/generation/services/generateReceiptBarcodes.js`
- `src/features/barcode/generation/projections/barcodeGenerationProjection.js`
- `src/features/barcode/generation/index.js`

Verified contracts:

- receipt identity is normalized and validated before transport
- generation options are deterministic
- generated rows retain source evidence
- generic Axios status text is not exposed as a user-facing error
- API failures remain available to the caller for recovery decisions

Focused verification at commit `fdf73d8d651257236205ebc423627c8eec9eb3e4`:

- 2 test files passed
- 6 tests passed
- production build passed

## Current Increment — Receipt Barcode Query Foundation

New testable boundary:

- `src/features/barcode/receipt-query/api/getReceiptBarcodeSummariesApi.js`
- `src/features/barcode/receipt-query/services/queryReceiptBarcodes.js`
- `src/features/barcode/receipt-query/projections/receiptBarcodeQueryProjection.js`
- `src/features/barcode/receipt-query/index.js`

Focused contracts:

- UNPRINTED and REPRINT modes project deterministic `printed` filters
- code, supplier ID, and supplier keyword filters are normalized
- supplier ID takes precedence over supplier text
- result rows retain original receipt and response evidence
- generic Axios status text is replaced with workflow-specific UI fallback
- original API failures remain available to the caller for recovery decisions

The legacy Purchase Order Receipt store and Barcode page remain runtime authority. No route, UI behavior, endpoint, payload, or production runtime ownership has been switched.
