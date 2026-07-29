# Sale Document Search Ownership Audit

## Mission

Create one search foundation for locating sale-backed documents while preserving separate Bill and Delivery Note policies, workspaces, projections, and renderers.

## Product Decision

```text
ONE DOCUMENT SEARCH FOUNDATION
MULTIPLE ENTRY POLICIES
SEPARATE DOCUMENT WORKSPACES
SEPARATE DOCUMENT RENDERERS
ONE SERVER-REVALIDATED SALE AUTHORITY AFTER SELECTION
```

## Current Consumers

- `src/features/bill/pages/PrintBillListPage.jsx`
- `src/features/deliveryNote/pages/DeliveryNoteListPage.jsx`

Both currently depend on the legacy `useSalesStore` printable-query surface:

- `printableSales`
- `loading`
- `error`
- `loadPrintableSalesAction`

## Shared Search Ownership

The shared search foundation may own:

- keyword, from-date, to-date, and limit query projection
- query validation
- printable-sale API execution
- rows, loading, error, last query, and last searched timestamp
- response normalization
- stable search command surface

## Consumer-specific Policies

### Bill Search Policy

- eligible rows are paid/received sales
- query currently requests `onlyPaid: 1`
- supports short/full Bill format selection
- selection opens a Bill workspace

### Delivery Note Search Policy

- eligible rows are unpaid/credit-oriented sales
- query currently requests `onlyUnpaid: 1`
- projects balance and aging information
- selection opens a Delivery Note workspace

## Explicit Non-goals

This Slice must not:

- unify Bill and Delivery Note renderers
- unify Bill and Delivery Note workspace state
- treat navigation snapshots as final document authority
- move document-line editing into search
- delete legacy printable selectors/actions
- change backend APIs
- redesign either list page

## Target Architecture

```text
src/features/sales/documents/search/
├── api/saleDocumentSearchApi.js
├── contracts/saleDocumentSearchOwnershipContract.js
├── services/saleDocumentSearchQuery.js
├── policies/billDocumentSearchPolicy.js
├── policies/deliveryNoteSearchPolicy.js
├── store/saleDocumentSearchStore.js
├── hooks/useSaleDocumentSearch.js
├── projections/saleDocumentSearchProjection.js
└── index.js
```

## Increment Plan

1. Consumer and policy audit — COMPLETE
2. Ownership contract — NEXT
3. Shared query/API/store foundation — PENDING
4. Bill policy extraction — PENDING
5. Delivery Note policy extraction — PENDING
6. Bill List atomic cutover — PENDING
7. Delivery Note List atomic cutover — PENDING
8. Legacy printable compatibility preservation — REQUIRED
9. Repository verification — PENDING
10. Runtime and Operational verification — PENDING

## Verification Boundary

Repository evidence may prove ownership, policy separation, public boundaries, and atomic source cutovers. Runtime PASS and Operational PASS require executable evidence.
