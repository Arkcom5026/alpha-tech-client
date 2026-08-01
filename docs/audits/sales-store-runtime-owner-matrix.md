# Sales Runtime Owner Matrix

## Authority

Repository: `Arkcom5026/alpha-tech-client`

Certified baseline:

- Client SHA: `f15ae6d6edeeaecb8a123ea1c515589ce5829dfb`
- Server SHA: `e4f27df950d2e71d62b1767fae1dda8d3f2b4d2c`
- ALDE Run: `30690587018`
- Mode: `SyncAndCertify`
- Result: `PASS`
- Failed gates: `0`

Root compatibility entrypoint:

`src/features/sales/store/salesStore.js`

## Current Runtime Ownership

| Responsibility | Current certified owner | Runtime consumers | Decision |
|---|---|---|---|
| Create Sale session/cart/payment compatibility | `src/features/sales/store/salesStore.js` together with capability owners under `src/features/sales/create/` | Create Sale composition, Payment workflow, Customer Deposit integration | Retain until a separate consumer-proven retirement increment exists. |
| Held Cart workflow | `src/features/sales/create/held-cart/` | Create Sale workflow | Certified owner. No duplicate page ownership. |
| Sale completion | `src/features/sales/create/completion/` and `src/features/sales/create/workflows/` | Create Sale and payment composition | Certified owner. |
| Dashboard overview | `src/features/sales/history/store/saleDashboardRuntimeCapability.js` | Sales Dashboard composition | Root-store authority retired. |
| History query/detail | `src/features/sales/history/store/saleHistoryQueryRuntimeCapability.js` | Sale History and document compositions | Root-store authority retired. |
| Printable query | `src/features/sales/history/store/salePrintableRuntimeCapability.js` and document-search owners under `src/features/sales/documents/search/` | Bill and Delivery Note search/list surfaces | Root-store authority retired. |
| Settlement | `src/features/sales/history/store/saleSettlementRuntimeCapability.js` | Sale History settlement workflow | Root-store authority retired. |
| Document-line update | `src/features/sales/documents/store/saleDocumentRuntimeSlice.js` and workspace owners under `src/features/sales/documents/workspace/` | Bill and Delivery Note document workspaces | Root-store authority retired. |
| Return | `src/features/sales/store/salesStore.js` compatibility action plus Sale Return composition | Sale Return | Retain pending a dedicated Return authority audit. |
| Online Order conversion | `src/features/sales/store/salesStore.js` compatibility action | `OnlineOrderToSalePanel` | Retain pending an Online Order conversion cutover increment. |

## Retired Root-Store Responsibilities

The following symbols must not return to `salesStore.js`:

- Dashboard: `salesOverviewLoading`, `salesOverviewError`, `salesOverviewLastLoadedAt`, `clearSalesOverviewErrorAction`, `fetchSalesDashboardOverviewAction`
- History: `sales`, `currentSale`, `loadSalesAction`, `setCurrentSale`, `setCurrentSaleAction`, `getSaleByIdAction`
- Printable: `printableSales`, `loadPrintableSalesAction`, `normalizePrintableRows`, `normalizeSaleDetail`
- Settlement: `markSalePaidAction`
- Document line: `updateSaleDocumentLinesAction`

The executable authority is locked by:

`src/features/sales/store/contracts/salesStoreResponsibilityAuditContract.js`

## Final Audit Findings

1. History, Printable, Dashboard, Settlement, and Document Line responsibilities have certified owners outside the root store.
2. Bill and Delivery Note consumers use their feature public boundaries and no longer consume the root Sales Store for retired responsibilities.
3. Remaining root-store consumers are limited to retained Create, Return, and Online Order conversion responsibilities.
4. Draft PRs #27, #28, and #29 are historical stacked working areas whose implementation intent has been superseded by the certified architecture on `main`; they must not be merged because doing so would reintroduce stale ancestry and governance ambiguity.
5. PR #49 remains a separate documentation and Human Operational Test agenda and is not runtime migration debt.

## Closure Decision

The Sale History Runtime responsibility migration is repository-complete and ALDE-certified.

Remaining work is intentionally separated into future agendas:

- Human Operational Test for the Sale workflow
- Sale Return authority extraction, only when its value justifies a dedicated increment
- Online Order conversion authority extraction, only when its consumer cutover is scheduled
- Deployment and Production DB verification remain separate authorities

This document is repository evidence. It does not claim Human Operational PASS or Production DB behavior.
