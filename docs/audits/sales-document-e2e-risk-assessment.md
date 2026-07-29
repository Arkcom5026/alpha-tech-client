# Sales Document E2E Risk Assessment

## Authority

Repository: `Arkcom5026/alpha-tech-client`

Branch: `agent/sales-store-responsibility-audit`

PR: `#30`

Assessment scope:

- Sales Dashboard ownership extraction
- Bill document search
- Delivery Note document search
- Bill Full workspace and document-line mutation
- Bill Short workspace and document-line mutation
- Delivery Note server authority
- Delivery Note document-line mutation
- Legacy compatibility boundaries

## Execution Evidence Boundary

The repository exposes these executable commands:

```text
npm run typecheck
npm run build
npm run test:run
npm run verify
npm run test:e2e
```

No GitHub Actions run exists for the assessed head lineage. The available Vercel status is blocked by a build-rate limit and is not code-build evidence.

Therefore this report does not claim Runtime PASS or Operational PASS.

## Critical Finding Discovered During E2E Trace

### Delivery Note workspace command-shape mismatch

The Workspace API requires:

```js
loadSaleDocument({ saleId, paymentId })
```

Delivery Note called:

```js
loadSaleDocument(saleId)
```

Expected runtime result before correction:

```text
route opens
-> workspace function destructures scalar input
-> saleId is undefined
-> throws "saleId is required"
-> Delivery Note cannot hydrate
```

Correction:

```js
loadSaleDocument({ saleId })
```

Applied to initial hydration and post-mutation reload.

Protection contracts were updated to reject the scalar call shape.

## Flow Assessment

### 1. Sales Dashboard

Path:

```text
SalesDashboardPage
-> useSalesDashboardWorkflow
-> salesDashboardStore
-> salesDashboardApi
-> server overview/search data
-> overview projection
-> dashboard UI
```

Repository assessment: coherent ownership and consumer cutover.

Primary risks:

- endpoint response-shape variance
- date-range boundary behavior
- stale legacy overview action still present

Risk: MEDIUM until executable tests and server integration run.

### 2. Bill document search

Path:

```text
PrintBillListPage
-> useSaleDocumentSearch
-> Bill policy
-> search store
-> search API
-> sale search endpoint
-> Bill eligibility/projection
-> existing Bill routes
```

Repository assessment: search ownership isolated; routes preserved.

Primary risks:

- backend search result normalization
- paid/unpaid eligibility differences
- initial-query behavior under real React render lifecycle

Risk: MEDIUM.

### 3. Delivery Note document search

Path:

```text
DeliveryNoteListPage
-> useSaleDocumentSearch
-> Delivery Note policy
-> shared search store/API
-> Delivery Note projection
-> delivery-note/print/:saleId
```

Repository assessment: separate policy correctly retained on shared foundation.

Primary risks:

- eligibility policy against mixed historical response shapes
- missing branch/customer fields in search rows
- list-to-route identity correctness

Risk: MEDIUM.

### 4. Bill Full workspace

Path:

```text
route saleId + optional paymentId
-> billStore.loadSaleByIdAction
-> server Sale + payment + branch
-> Bill projection
-> BillLayoutFullTax
```

Mutation:

```text
renderer edit
-> useSaleDocumentLineEditor
-> executeSaleDocumentLineUpdate
-> saveSaleDocumentLines
-> update endpoint
-> reset billStore
-> reload same sale/payment
-> renderer refresh
```

Repository assessment: hydration owner and renderer preserved; legacy mutation dependency removed.

Primary risks:

- billStore request/cache behavior after reset
- payment selection after reload
- TypeScript/alias resolution
- actual A4 print CSS/browser output

Risk: MEDIUM.

### 5. Bill Short workspace

Path is equivalent to Bill Full with thermal-specific behavior:

```text
server hydration
-> BillLayoutShortTax
-> dynamic height measurement
-> print
-> return to Sale route
```

Repository assessment: thermal sizing, auto-print and return lifecycle remain present.

Primary risks:

- `ResizeObserver` timing
- measured height after document-line reload
- browser print event differences
- immediate fallback return after `window.print`

Risk: MEDIUM-HIGH because browser print behavior cannot be proven statically.

### 6. Delivery Note workspace

Path after correction:

```text
route saleId
-> loadSaleDocument({ saleId })
-> getSaleById with payments/branch includes
-> local currentSale
-> Sale/SIMPLE grouping
-> Branch config projection
-> DeliveryNoteForm
```

Mutation:

```text
DeliveryNoteForm edit
-> useSaleDocumentLineEditor
-> executeSaleDocumentLineUpdate
-> saveSaleDocumentLines
-> reloadSaleDocument
-> loadSaleDocument({ saleId })
-> local document refresh
```

Repository assessment: route identity and server data authority are now coherent; the critical command-shape blocker was corrected.

Primary risks:

- API response may return `data` wrapper rather than Sale directly
- grouping relies on item-kind inference from stock-item fields
- duplicate grouping keys across same product/document text
- branch nested-address response shape
- no executable renderer test

Risk: MEDIUM after blocker correction; previously CRITICAL.

### 7. Compatibility boundary

Retained surfaces:

```text
currentSale
setCurrentSale
getSaleByIdAction
printableSales
loadPrintableSalesAction
updateSaleDocumentLinesAction
legacy dashboard fields/actions
```

Repository assessment: retained intentionally for Sale Return, payment/transaction and indirect consumers.

Primary risk:

- dual authorities remain available and may attract new consumers
- later cleanup without runtime reference evidence could break non-document flows

Risk: MEDIUM, controlled by contracts and separate-increment rule.

## Test-Suite Integrity Finding

Two Delivery Note contracts were stale after later atomic slices:

- expected the invalid scalar Workspace API call
- expected legacy mutation usage after the editor cutover

Those contracts would cause executable test failure and could also preserve a broken API usage pattern.

They were updated to:

- require `loadSaleDocument({ saleId })`
- reject `loadSaleDocument(saleId)`
- require shared editor ownership
- reject legacy mutation usage in the page

## Overall Assessment

```text
Repository architecture: PASS
Static E2E wiring: PASS after critical correction
Known critical blockers remaining: NONE FOUND in inspected flows
Executable unit/contract tests: PENDING
Typecheck: PENDING
Vite build: PENDING
Playwright/browser E2E: PENDING
Backend-integrated operational test: PENDING
```

Overall residual risk: MEDIUM.

The largest remaining uncertainty is not architectural ownership. It is executable integration across module resolution, backend response shapes, browser printing and real authenticated server data.

## Merge Recommendation

Do not delete compatibility surfaces in this PR.

Do not represent this PR as Runtime PASS or Operational PASS.

The repository changes are suitable for executable verification once a runner is available. A remote CI workflow or local environment should run:

```text
npm ci
npm run verify
npm run test:e2e -- <targeted sales document specs>
```

Targeted operational scenarios:

1. Bill search -> Full Bill -> edit line -> reload -> print
2. Bill search -> Short Bill -> edit line -> auto-print -> return to Sale
3. Delivery Note search -> open direct route -> edit SN line -> reload
4. Delivery Note mixed SN + SIMPLE -> grouping/totals/address -> print
5. Refresh each document route directly without navigation state
6. Failed update -> error shown -> original document remains available
7. Sale Return flow remains unaffected by retained compatibility owners
