# Sales Store Runtime Owner Matrix

## Authority

Repository: `Arkcom5026/alpha-tech-client`

Branch: `agent/sales-store-responsibility-audit`

Legacy authority: `src/features/sales/store/salesStore.js`

## Matrix

| Responsibility | Current owner | Observed consumers | Target owner | Migration risk | Decision |
|---|---|---|---|---|---|
| Create Sale cart/session | `salesStore.js` compatibility surface plus new Create Sale owners | `CreateSalePage`, `PaymentSection`, Customer Deposit integration | `sales/create/store/saleCreateSessionStore.js` or compatibility adapter | High | Do not extract first. Runtime proof required. |
| Payment compatibility | `salesStore.js` plus `useSalePaymentWorkflow` | `PaymentSection` and historical document surfaces | Create Sale payment owner plus adapter | High | Keep legacy selectors during PR #29 runtime verification. |
| Dashboard overview | `salesStore.js` | `SalesDashboardPage` | `sales/history/dashboard/store/salesDashboardStore.js` | Low/Medium | First extraction candidate. Consumer boundary is narrow and explicit. |
| History/detail | `salesStore.js` | Bill, delivery note, and history/document pages | `sales/history/store/saleHistoryStore.js` | Medium/High | Defer until per-consumer contract is mapped. |
| Printable sales | `salesStore.js` | Bill and delivery-note document/list screens | `sales/printable/store/printableSaleStore.js` | Medium/High | Defer. Search results show cross-module consumers. |
| Return and collection | `salesStore.js` | No external consumer proven by current code search | `sales/returns/store/saleReturnStore.js` | Unknown | Do not declare dead; verify exact references and runtime paths. |
| Online Order conversion | `salesStore.js` | `OnlineOrderToSalePanel` | `orderOnlinePos` conversion owner | Medium | Move with Online Order consumer cutover, not in Dashboard slice. |

## Repository Discovery Evidence

Current `useSalesStore` consumers span multiple modules:

- Create Sale
- Payment
- Sales Dashboard
- Bill print/list
- Delivery Note print/list
- Online Order to Sale
- Customer Deposit compatibility

Therefore `salesStore.js` is a cross-module compatibility boundary. A one-shot split would create a high regression risk and obscure runtime authority.

## First Extraction Decision

The first low-risk owner is `DASHBOARD_OVERVIEW` because:

1. Its consumer is explicitly concentrated in `SalesDashboardPage`.
2. Its state is isolated: loading, error, last-loaded timestamp.
3. Its command returns a self-contained overview projection.
4. It does not mutate Create Sale cart/payment/completion state.
5. It can be introduced behind a compatibility adapter before the page cutover.

## Next Slice

Create:

```text
src/features/sales/history/dashboard/
├── services/salesDashboardOverviewService.js
├── store/salesDashboardStore.js
├── contracts/salesDashboardStoreCutoverContract.js
└── index.js
```

Then atomically cut `SalesDashboardPage.jsx` from the legacy store while preserving legacy dashboard selectors temporarily for compatibility.

## Verification Boundary

This matrix is repository evidence only. Runtime PASS and Operational PASS require executable evidence.
