# ASSIGNMENT-022 — Mission B Phase 2 Frontend Runtime Integration

Mission: Mission B
Assigned Role: FE-01 Runtime Owner
Phase: Phase 2 — Frontend Runtime Integration
Status: ACTIVE
Implementation: APPROVED

## Objective

Integrate Mission B Flow 3 into QuickStock frontend runtime using the approved backend contract.

Approved backend endpoint:

```txt
POST /api/products/pos/create-local
```

Backend audit:

```txt
docs/mission-b/inbox/ROLE-ARCH/AUDIT-PHASE-1.md
```

## Runtime Goal

Support this user path:

```txt
No suitable Template Product found
-> operator creates local Operational Product
-> FE adopts returned operationalProduct
-> FE receives through /api/quick-stock/existing using operationalProduct.id
-> product becomes branch runtime product
```

## Scope

Implement the smallest safe FE runtime patch required for Flow 3.

Allowed areas:

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
src/features/product/components/quick-stock/ProductMasterPanel.jsx
src/features/product/components/quick-stock/CommitBar.jsx
src/features/product/api/productApi.js
src/features/product/store/productStore.js
```

If another file is required, record why in the report before expanding scope.

## Required Behavior

```txt
Add FE API/store support for POST /api/products/pos/create-local.
Add or expose a local-create entry point when no suitable Template Product exists.
Submit minimum local product fields and required price fields.
Adopt returned data/product as Operational Product.
Use operationalProduct.id for /quick-stock/existing receive.
Do not send templateProductId for local products.
Do not send branchId from FE.
Do not send stock queue to create-local.
Preserve Runtime Catalog Separation.
```

## Runtime Constraints

```txt
Do not modify backend.
Do not change /quick-stock/existing payload contract except using operationalProduct.id.
Do not refactor QuickStockPage broadly.
Do not mutate Template Product data.
Do not create stock rows outside QuickStock receive.
Do not introduce new Mission scope.
```

## Verification

Perform or document available verification for:

```txt
Local create API function exists.
Local create state can submit required payload.
Returned operationalProduct is adopted into QuickStock runtime state.
CommitBar uses operationalProduct.id for receive.
Template-only and operational-product paths still work.
Disabled/loading/error states are safe.
```

Runtime DB/API verification may remain for E2E Phase if not available in this task.

## Deliverable

Create report:

```txt
docs/mission-b/inbox/FE-01/FLOW-INTEGRATION-001.md
```

Report must include:

```txt
Files changed
Runtime path implemented
API/store changes
QuickStockPage state changes
Local create UX entry point summary
Adoption behavior
Receive behavior
Verification performed
Known risks
PASS or NEEDS_DECISION conclusion
Next recommended owner
```

## Completion Response

```txt
Report path:
PASS/NEEDS_DECISION:
Files changed:
Runtime path:
Verification:
Next recommended owner:
```