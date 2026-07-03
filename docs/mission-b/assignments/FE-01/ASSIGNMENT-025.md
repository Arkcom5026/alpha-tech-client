# ASSIGNMENT-025 — Mission B Product Discovery Completion

Mission: Mission B
Assigned Role: FE-01 Runtime Owner
Phase: Product Discovery Completion
Status: ACTIVE
Implementation: APPROVED

## Objective

Complete Mission B Product Discovery Runtime by closing the Operational Product Search gap discovered after ASSIGNMENT-022.

The previous FE-01 report is accepted only for Local Create integration:

```txt
docs/mission-b/inbox/FE-01/FLOW-INTEGRATION-001.md
```

ROLE-ARCH audit:

```txt
docs/mission-b/inbox/ROLE-ARCH/AUDIT-FE01-FLOW-INTEGRATION-001.md
```

Approved architecture:

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-003.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-AGENDA-REVISION-001.md
```

## Required Product Discovery Model

QuickStock Product Finder must support:

```txt
Flow A — Template Product Path
Template Product found
-> resolve/adopt/clone as needed
-> Operational Product
-> receive through /api/quick-stock/existing

Flow B — Existing Operational Product Path
Operational Product already exists in current branch
-> select Operational Product directly
-> receive through /api/quick-stock/existing

Flow C — Local Product Path
No suitable Template or Operational Product
-> create Local Operational Product
-> adopt returned Operational Product
-> receive through /api/quick-stock/existing
-> later search finds that Operational Product again
```

## Scope

Implement the smallest safe FE runtime patch that ensures Operational Products already in the current branch are discoverable and receive-ready in QuickStock.

Allowed files:

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/api/productApi.js
src/features/product/store/productStore.js
src/features/product/components/quick-stock/ProductFinderPanel.jsx
```

If another file is required, document why in the report before expanding scope.

## Required Behavior

```txt
QuickStock search must not be Template-only.
Existing Operational Products in the current branch must appear or be selectable in Product Finder.
Selecting an Operational Product must adopt it directly as operationalProduct.
Receive must use operationalProduct.id.
Template Product must remain catalog/search/clone source only.
Local Product created earlier must be searchable later as an Operational Product.
Empty state should only offer Local Create when no suitable Operational or Template result exists.
```

## Backend Contract Awareness

Available backend contracts may include existing POS product search and runtime lookup routes, such as:

```txt
GET /api/products/pos/search
GET /api/products/pos/runtime-by-template/:templateProductId
POST /api/products/pos/create-local
POST /api/products/pos/create-from-template
POST /api/quick-stock/existing
```

Use existing contracts where possible. Do not request backend changes unless a real blocker is found and reported.

## Constraints

```txt
Do not modify backend.
Do not refactor AuthStore.
Do not refactor BranchStore.
Do not change apiClient refresh behavior.
Do not activate route guard.
Do not activate RBAC or menu permissions.
Do not rewrite QuickStockPage broadly.
Do not create a new stock intake path.
Do not mutate Template Product data.
Do not implement Template Promotion.
```

## Verification

Perform or document available verification for:

```txt
Operational Product search path exists in FE.
Template search path still works.
Existing Operational Product can be adopted directly.
Local-created Operational Product can be found again through search.
Receive uses operationalProduct.id in all paths.
Empty state does not appear while Operational Product results exist.
No Auth/BranchStore/apiClient/route guard/RBAC files changed.
```

Runtime API/database verification may remain for E2E phase if not available in this task.

## Deliverable

Create report:

```txt
docs/mission-b/inbox/FE-01/PRODUCT-DISCOVERY-COMPLETION-001.md
```

Report must include:

```txt
Files changed
Product discovery behavior implemented
Operational Product search behavior
Template Product behavior
Local Product search-after-create behavior
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
Discovery paths covered:
Verification:
Next recommended owner:
```