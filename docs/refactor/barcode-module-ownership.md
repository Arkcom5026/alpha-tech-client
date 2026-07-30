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

## Current Increment — Generation Foundation

New testable boundary:

- `src/features/barcode/generation/api/generateMissingBarcodesApi.js`
- `src/features/barcode/generation/services/generateReceiptBarcodes.js`
- `src/features/barcode/generation/projections/barcodeGenerationProjection.js`
- `src/features/barcode/generation/index.js`

Focused contracts:

- receipt identity is normalized and validated before transport
- generation options are deterministic
- generated rows retain source evidence
- generic Axios status text is not exposed as a user-facing error
- API failures remain available to the caller for recovery decisions

The legacy Zustand store remains runtime authority. No route, API payload, print behavior, or production runtime ownership has been switched in this increment.
