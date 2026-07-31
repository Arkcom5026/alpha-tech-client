# Barcode Runtime Cutover Plan

## Mission

Move production runtime ownership from the legacy `barcodeStore` and monolithic barcode API into the verified Barcode feature slices without changing routes, endpoint contracts, payloads, print layout, scan behavior, receipt finalization authority, or stock lifecycle authority.

## Preconditions

The following additive foundations have focused test and production build evidence:

- renderer ownership
- generation
- receipt query
- print / reprint
- scan / serial assignment
- audit / receipt completion

Runtime cutover must happen in independently reversible increments. A slice is not retired until its consuming runtime surface has focused tests, production build evidence, and operational evidence.

## Legacy Runtime Concentration

`src/features/barcode/store/barcodeStore.js` currently combines:

- barcode generation
- receipt barcode loading
- print batch assembly
- reprint lookup and loading
- scan and serial assignment
- receipt readiness queries
- stock-item receiving integration
- purchase receipt finalization integration
- shared loading and error state

This store must not be replaced in one commit.

## Cutover Order

### Cutover 1 — Generation Action

Legacy entry:

- `generateBarcodesAction`
- generation portion of `fetchPrintBatchAction`

Target authority:

- `src/features/barcode/generation/`

Rules:

- retain the existing Zustand action names and return shape as compatibility adapters
- switch only transport, validation, projection, and error projection to the new Generation service
- preserve `barcodes`, `loading`, and `error` state behavior
- do not change Page imports in this increment

Rollback boundary:

- one store import and two action implementations

### Cutover 2 — Barcode Receipt Loading

Legacy entries:

- `loadBarcodesAction`
- `fetchBarcodesByReceiptIdAction`
- aliases that delegate to the fetch action
- SN/LOT filtered receipt loading actions

Target authority:

- print/reprint barcode loading boundary for printable rows
- scan/serial loading boundary for scan candidates

Rules:

- preserve normalized row fields consumed by existing pages and controllers
- preserve silent loading behavior
- retain current aliases until all consumers are known

### Cutover 3 — Receipt Query Page

Legacy surface:

- `BarcodeReceiptListPage`
- `purchaseOrderReceiptStore.loadReceiptSummariesAction`

Target authority:

- `src/features/barcode/receipt-query/`

Rules:

- page-level hook owns query mode, filters, debounce, projection, loading, and error
- Purchase Order Receipt remains owner of receipt business data; Barcode owns barcode-oriented receipt discovery
- preserve URL, localStorage keys, filter behavior, and table rendering

Rollback boundary:

- one page hook/import cutover

### Cutover 4 — Print / Reprint Actions

Legacy entries:

- `reprintBarcodesAction`
- `searchReprintReceiptsAction`
- `markBarcodesAsPrintedAction`
- printable label expansion helper

Target authority:

- `src/features/barcode/print-reprint/`

Rules:

- preserve barcode row shape and LOT label duplication
- preserve print and reprint endpoints
- do not change CSS, paper size, browser print behavior, or print controllers

### Cutover 5 — Scan / Serial Actions

Legacy entries:

- receive scan action
- serial update action
- draft scan commit action
- row-level error projection

Target authority:

- `src/features/barcode/scan-serial/`

Rules:

- preserve string and object input compatibility
- preserve partial commit semantics
- preserve stock-item module ownership of stock lifecycle
- preserve retryable row errors and successful committed rows

### Cutover 6 — Audit / Completion Integration

Legacy entries:

- audit calls
- `finalizeReceiptIfNeededAction`

Target authority:

- `src/features/barcode/audit-completion/`

Rules:

- audit must complete before finalization is requested
- Barcode owns audit evidence and workflow integration only
- Purchase Order Receipt remains finalization authority
- preserve server idempotency

### Cutover 7 — Page and Controller Import Migration

Migrate pages/controllers from broad store access to slice-specific hooks or narrow selectors.

Rules:

- one runtime surface per commit
- no route changes
- no visual redesign
- no shared/common workflow component extraction

### Cutover 8 — Legacy Store Retirement

Allowed only when repository search proves no runtime references remain for retired actions.

Retirement order:

1. remove compatibility action implementations
2. remove unused state fields
3. remove obsolete API imports
4. remove legacy API functions after all callers use slice APIs
5. delete the legacy store only if no valid Barcode runtime responsibility remains

## Verification Matrix

Each cutover increment requires:

1. focused unit/contract tests for the target slice
2. compatibility tests for the retained store action or page hook
3. relevant existing Barcode tests
4. production build
5. working tree clean
6. operational evidence for the affected UI path before legacy retirement

## Prohibited Combined Changes

Do not combine any runtime cutover with:

- endpoint redesign
- backend payload changes
- route migration
- print-layout redesign
- stock lifecycle changes
- receipt status rule changes
- visual redesign
- legacy deletion for a different slice

## First Implementation Increment

Begin with **Cutover 1 — Generation Action Adapter** because it has the smallest rollback surface and does not require page or route changes.
