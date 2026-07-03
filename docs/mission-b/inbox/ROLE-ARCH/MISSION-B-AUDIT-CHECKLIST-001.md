# MISSION-B-AUDIT-CHECKLIST-001 — Product Discovery Runtime

Mission: Mission B
Owner: ROLE-ARCH
Status: PREPARED
Purpose: Audit Mission B before certification.

## Required Inputs

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-003.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-AGENDA-REVISION-001.md
docs/mission-b/inbox/BE-01/LOCAL-CREATE-IMPLEMENTATION-001.md
docs/mission-b/inbox/FE-01/FLOW-INTEGRATION-001.md
docs/mission-b/inbox/FE-02/UX-VALIDATION-PLAN-001.md
docs/mission-b/inbox/VERIFY/VERIFY-E2E-PLAN-001.md
Final E2E execution report when available
```

## Mission Integrity

```txt
[ ] Mission remains Product Discovery Runtime.
[ ] Mission has not drifted into Auth/Branch/apiClient refactor.
[ ] Mission has not drifted into Template Promotion governance.
[ ] Mission has not drifted into broad Backend migration.
```

## Product Discovery Coverage

```txt
[ ] Flow A Template Product Path covered.
[ ] Flow B Existing Operational Product Path covered.
[ ] Flow C Local Product Path covered.
[ ] Product Finder distinguishes Template vs Operational where needed.
[ ] Local Product created by a branch can be found again as Operational Product.
```

## Runtime Catalog Separation

```txt
[ ] Template Product remains catalog/search/clone source only.
[ ] Operational Product remains branch runtime source of truth.
[ ] QuickStock receive uses operationalProduct.id.
[ ] No Template Product is used directly for receive.
[ ] No operational page edits Template Product runtime data.
```

## Backend Runtime Integrity

```txt
[ ] POST /api/products/pos/create-local works with authenticated branch context.
[ ] FE does not send branchId to create-local.
[ ] create-local creates Product with templateProductId null.
[ ] create-local upserts BranchPrice by productId + branchId.
[ ] create-local does not create stock rows.
[ ] /api/quick-stock/existing remains stock intake owner.
```

## Frontend Runtime Integrity

```txt
[ ] FE patch is minimal and product-feature scoped.
[ ] FE does not change AuthStore.
[ ] FE does not change BranchStore.
[ ] FE does not change apiClient refresh behavior.
[ ] FE does not activate route guard or RBAC.
[ ] FE adopts backend operationalProduct response.
[ ] FE receive commit uses operationalProduct.id.
```

## UX Integrity

```txt
[ ] Empty state explains what operator can do next.
[ ] Local create entry point is clear.
[ ] Required fields are clear.
[ ] Loading state is safe.
[ ] Error state is recoverable.
[ ] Operational vs Template source is understandable or safely abstracted.
```

## Verification Integrity

```txt
[ ] Flow A verified end-to-end.
[ ] Flow B verified end-to-end.
[ ] Flow C verified end-to-end including search-after-create.
[ ] BranchPrice evidence captured.
[ ] Stock evidence captured.
[ ] Product search/list/detail evidence captured.
[ ] Known verification debt closed or explicitly accepted.
```

## Certification Result

Final result must be one of:

```txt
PASS
PASS WITH DEBT
FAIL
```

Mission B may be certified only if no critical runtime gap remains open.