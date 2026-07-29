# Remaining Legacy Document Consumer Reference Audit

## Mission

Classify every remaining repository reference to the legacy Sale document surfaces after the Bill and Delivery Note cutovers.

Audited symbols:

- `printableSales`
- `loadPrintableSalesAction`
- `currentSale`
- `setCurrentSale`
- `getSaleByIdAction`
- `updateSaleDocumentLinesAction`

## Authority Rule

A reference is a **document consumer** only when it owns or renders an opened Bill, Delivery Note, receipt, tax invoice, or other printable Sale document.

A reference is not removed in this PR when it belongs to:

- Sale return workflows
- Payment workflows
- Sale creation/completion workflows
- Compatibility state/actions retained until runtime evidence exists

## Branch-Authoritative Findings

### Audited document consumers

The following consumers have already been cut over and no longer depend on the legacy Sale Store document surfaces:

- `src/features/bill/pages/PrintBillListPage.jsx`
- `src/features/deliveryNote/pages/DeliveryNoteListPage.jsx`
- `src/features/bill/pages/PrintBillPageFullTax.jsx`
- `src/features/bill/pages/PrintBillPageShortTax.jsx`
- `src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx`

Their current owners are:

- Sale Document Search boundary for document lists
- Bill Store for Bill hydration/payment projection
- Sale Document Workspace API for Delivery Note hydration
- Sale Document Workspace editor/controller for document-line mutation

### Compatibility-only owners

`src/features/sales/history/store/saleHistoryRuntimeSlice.js` still declares:

- `currentSale`
- `printableSales`
- `setCurrentSale`
- `getSaleByIdAction`
- `loadPrintableSalesAction`

These are retained compatibility surfaces. No audited Bill or Delivery Note consumer uses them after the cutovers.

`src/features/sales/documents/store/saleDocumentRuntimeSlice.js` still declares:

- `updateSaleDocumentLinesAction`

This is also a retained compatibility surface. The audited Bill and Delivery Note workspaces now use the Sale Document Workspace controller/editor instead.

### Non-document runtime consumers

`src/features/saleReturn/pages/CreateReturnPage.jsx` still references `getSaleByIdAction` for the Sale Return workflow. This is not a printable-document workspace and must not be migrated or deleted as part of this PR.

Other `currentSale` references under Sale creation/payment surfaces belong to active transaction state, not opened-document authority.

## Decision

Repository-level document ownership migration is complete for the audited Bill and Delivery Note surfaces.

Do not delete legacy compatibility fields/actions in this PR because:

1. Runtime evidence has not yet proven all indirect consumers safe.
2. Sale Return and transaction workflows remain outside this document-ownership increment.
3. Compatibility deletion would mix a destructive cleanup with an already large ownership extraction.

## Next Gate

The next meaningful action is repository verification and runtime planning, not further document consumer migration.

Compatibility removal requires a separate atomic increment after:

- executable contract/test evidence
- production or equivalent runtime evidence
- confirmation that no indirect imports rely on the retained surfaces
