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

## Completed Increment — Receipt Barcode Query Foundation

New testable boundary:

- `src/features/barcode/receipt-query/api/getReceiptBarcodeSummariesApi.js`
- `src/features/barcode/receipt-query/services/queryReceiptBarcodes.js`
- `src/features/barcode/receipt-query/projections/receiptBarcodeQueryProjection.js`
- `src/features/barcode/receipt-query/index.js`

Verified contracts:

- UNPRINTED and REPRINT modes project deterministic `printed` filters
- code, supplier ID, and supplier keyword filters are normalized
- supplier ID takes precedence over supplier text
- result rows retain original receipt and response evidence
- generic Axios status text is replaced with workflow-specific UI fallback
- original API failures remain available to the caller for recovery decisions

Focused verification at commit `f0dc2f3e1876f70362f6aada14bd9b8ec8b66895`:

- 2 test files passed
- 5 tests passed
- production build passed

## Completed Increment — Print / Reprint Foundation

New testable boundary:

- `src/features/barcode/print-reprint/api/barcodePrintApi.js`
- `src/features/barcode/print-reprint/services/barcodePrintService.js`
- `src/features/barcode/print-reprint/projections/barcodePrintProjection.js`
- `src/features/barcode/print-reprint/index.js`

Verified contracts:

- receipt identity is normalized before print, reprint, and mark-printed transport
- reprint search mode and criteria are normalized deterministically
- empty reprint searches do not call the server
- barcode print rows preserve original source evidence
- LOT suggested label counts expand deterministically
- generic Axios status text is replaced by a workflow-specific fallback

Focused verification at commit `00c86be61d09aa8ac685a30ba1a6bbcc65365d5e`:

- 2 test files passed
- 7 tests passed
- production build passed

## Completed Increment — Scan / Serial Assignment Foundation

New testable boundary:

- `src/features/barcode/scan-serial/api/barcodeScanApi.js`
- `src/features/barcode/scan-serial/services/barcodeScanService.js`
- `src/features/barcode/scan-serial/projections/barcodeScanProjection.js`
- `src/features/barcode/scan-serial/index.js`

Verified contracts:

- legacy string and object scan inputs normalize to one deterministic shape
- receive payload keeps backward-compatible SN and keepSN behavior
- serial assignment requires both barcode and serial number
- invalid commit rows are removed before transport
- backend partial commit failures remain structured and retain source evidence
- generic Axios and network messages are replaced with a workflow-specific UI fallback

Focused verification at commit `449dce9542ca5e201412c4a7242a03d1a8806d77`:

- 2 test files passed
- 7 tests passed
- production build passed

## Current Increment — Audit / Receipt Completion Foundation

New testable boundary:

- `src/features/barcode/audit-completion/api/barcodeAuditCompletionApi.js`
- `src/features/barcode/audit-completion/services/barcodeAuditCompletionService.js`
- `src/features/barcode/audit-completion/projections/barcodeAuditCompletionProjection.js`
- `src/features/barcode/audit-completion/index.js`

Focused contracts:

- receipt identity and audit detail options are normalized before transport
- audit counts and detail rows retain original source evidence
- receipt finalization remains an integration call to Purchase Order Receipt authority
- unhealthy audit evidence prevents finalization
- healthy audit evidence allows idempotent finalization
- generic transport messages are replaced with a workflow-specific UI fallback

The legacy Barcode store, pages, and controllers remain runtime authority. Purchase Order Receipt remains the business owner of finalization. No route, UI behavior, endpoint, payload, completion policy, or production runtime ownership has been switched.
