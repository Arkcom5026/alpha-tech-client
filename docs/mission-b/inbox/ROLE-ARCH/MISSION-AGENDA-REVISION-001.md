# MISSION-AGENDA-REVISION-001 — Product Discovery Runtime

Mission: Mission B
Owner: ROLE-ARCH
Status: APPROVED
Related Decision: docs/mission-b/inbox/ROLE-ARCH/DECISION-003.md

## Revised Mission Statement

Mission B is now governed as Product Discovery Runtime:

```txt
Product Discovery
-> Operational Product Ready
-> Receive
-> Branch Runtime Ready
```

Mission B is complete when a branch operator can discover or create a product, receive it, and then use it in branch runtime across all approved paths.

## Approved Discovery Paths

```txt
Flow A — Template Product Path
Template Product found
-> Operational Product resolved
-> Receive through /api/quick-stock/existing
-> Branch Runtime Ready

Flow B — Operational Product Path
Operational Product already exists in current branch
-> Select Operational Product
-> Receive through /api/quick-stock/existing
-> Branch Runtime Ready

Flow C — Local Product Path
No suitable Template or Operational Product
-> Create Local Operational Product
-> Receive through /api/quick-stock/existing
-> Search again finds Operational Product
-> Receive again if needed
```

## Current Mission Phase

```txt
Phase 2 — Frontend Runtime Integration / Product Discovery Expansion
```

Current active assignment:

```txt
docs/mission-b/assignments/FE-01/ASSIGNMENT-022.md
```

## Phase Plan

### Phase 1 — Backend Runtime Foundation

Owner: BE-01
Status: PASS WITH VERIFICATION DEBT

Accepted result:

```txt
POST /api/products/pos/create-local implemented.
Local Operational Product create returns adoption-ready operationalProduct.
```

Audit:

```txt
docs/mission-b/inbox/ROLE-ARCH/AUDIT-PHASE-1.md
```

### Phase 2 — Frontend Runtime Integration

Owner: FE-01
Status: ACTIVE

Goal:

```txt
Connect Local Create contract and ensure QuickStock adopts returned Operational Product.
```

Report:

```txt
docs/mission-b/inbox/FE-01/FLOW-INTEGRATION-001.md
```

### Phase 3 — Product Discovery Completion

Owner: FE-01
Status: PENDING ASSIGNMENT IF NOT COVERED BY ASSIGNMENT-022

Goal:

```txt
Ensure QuickStock Product Finder supports Operational Product Search in the current branch in addition to Template Search and Local Create.
```

Expected result:

```txt
Existing branch Operational Products are discoverable and can be received directly.
```

Potential assignment:

```txt
docs/mission-b/assignments/FE-01/ASSIGNMENT-023.md
```

### Phase 4 — UX Validation

Owner: FE-02
Status: WAITING

Goal:

```txt
Validate operator-facing Product Discovery, empty state, local create, result clarity, error handling, and receive readiness.
```

### Phase 5 — End-to-End Verification

Owner: Verification owner assigned by ROLE-ARCH
Status: WAITING

Verification must cover:

```txt
Flow A: Template -> Receive -> Runtime
Flow B: Existing Operational -> Receive -> Runtime
Flow C: Create Local -> Receive -> Search again -> Existing Operational -> Receive again
```

### Phase 6 — ROLE-ARCH Audit

Owner: ROLE-ARCH
Status: WAITING

Audit criteria:

```txt
Runtime Catalog Separation preserved.
Operational Product is branch runtime source of truth.
QuickStock receive uses operationalProduct.id.
No Auth/BranchStore/apiClient/route guard/RBAC changes introduced.
No parallel stock flow created.
Known verification debts closed or explicitly accepted.
```

### Phase 7 — Mission B Certification

Owner: ROLE-ARCH
Status: WAITING

Certification target:

```txt
Mission B Operationally Complete — Product Discovery Runtime Certified
```

### Phase 8 — Mission Closeout

Owner: ROLE-ARCH
Status: WAITING

Closeout includes final status, accepted debt, known risks, and successor boot if required.

## Out of Scope

```txt
Template Promotion from Local Product back into Template Catalog.
Frontend Auth/BranchStore/apiClient refactor.
Route guard activation.
RBAC/menu permission activation.
Backend broad migration.
New stock flow separate from QuickStock /existing.
```

## ROLE-ARCH Operating Note

When FE-01 submits FLOW-INTEGRATION-001, ROLE-ARCH must explicitly audit whether Operational Product Search is covered.

If not covered, issue ASSIGNMENT-023 before FE-02 UX validation.