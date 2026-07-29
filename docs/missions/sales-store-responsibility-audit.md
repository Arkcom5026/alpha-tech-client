# Sales Store Responsibility Audit

## Mission

Audit `src/features/sales/store/salesStore.js` by runtime responsibility before any state migration or deletion. The store currently combines Create Sale session state, payment compatibility state, sale completion coordination, history/detail/print operations, return/payment mutations, dashboard overview state, and online-order conversion.

## Stacked Authority

This increment is stacked on PR #29:

```text
agent/sale-payment-workflow-responsibility-extraction
```

It must not merge before PR #29 is accepted.

## Current Risk

The legacy store is still a broad compatibility boundary. Several Create Sale responsibilities now have explicit owners, but repository evidence alone does not prove every legacy selector/action is unused at runtime. Therefore this increment begins with ownership classification and reference authority, not destructive migration.

## Responsibility Classes

### CREATE_SESSION

Candidate state/actions associated with Create Sale runtime compatibility:

- `saleItems`
- `customerId`
- `paymentList`
- `cardRef`
- `billDiscount`
- `sharedBillDiscountPerItem`
- `saleCompleted`
- cart mutation actions
- payment mutation actions
- completion identity/state
- `confirmSaleOrderAction`
- reset commands

### HISTORY_QUERY

Candidate state/actions associated with history and detail:

- `sales`
- `currentSale`
- list/detail loading
- `getAllSales`
- `getSaleById`
- document-line updates

### PRINTABLE_QUERY

Candidate state/actions associated with printable document discovery:

- `printableSales`
- printable search
- printable response normalization
- sale detail normalization

### RETURN_AND_COLLECTION

Candidate commands associated with after-sale operations:

- return sale
- mark sale as paid

### DASHBOARD_OVERVIEW

Candidate state/actions associated with sales overview:

- `salesOverviewLoading`
- `salesOverviewError`
- `salesOverviewLastLoadedAt`
- dashboard overview fetch/clear commands

### ONLINE_ORDER_CONVERSION

Candidate command associated with converting Online Order to Sale.

### COMPATIBILITY

Aliases, normalizers, and transitional actions still referenced by older screens or document rendering must remain available until runtime references are proven absent.

## Target Architecture

```text
sales/
├── create/store/saleCreateSessionStore.js
├── history/store/saleHistoryStore.js
├── printable/store/printableSaleStore.js
├── returns/store/saleReturnStore.js
├── dashboard/store/salesDashboardStore.js
└── shared/compatibility/legacySalesStoreAdapter.js
```

The target is responsibility ownership, not a mandatory one-file-per-category outcome. Categories with low runtime weight may remain services/hooks instead of stores.

## Increment Plan

1. Store ownership inventory — COMPLETE
2. Ownership classification contract — COMPLETE
3. Repository reference discovery — NEXT
4. Runtime owner matrix — PENDING
5. First low-risk owner extraction — PENDING
6. Compatibility adapter — PENDING
7. Atomic consumer cutovers — PENDING
8. Legacy state/action removal — BLOCKED UNTIL RUNTIME EVIDENCE
9. Repository verification — IN PROGRESS
10. Runtime and Operational verification — PENDING

## Safety Rules

- No legacy state/action deletion during audit-only slices.
- No Create Sale runtime cutover without consumer reference evidence.
- No claim that a symbol is dead based only on its age or naming.
- Preserve behavior and public selectors during compatibility migration.
- One owner must be authoritative after each atomic cutover.

## Verification Boundary

Repository evidence may prove classification, ownership boundaries, references, exports, and atomic source cutovers. Runtime PASS and Operational PASS require executable evidence.
