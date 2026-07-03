# ASSIGNMENT-026 — Mission B Product Discovery E2E Verification Execution

Mission: Mission B
Assigned Role: VERIFY
Phase: E2E Verification Execution
Status: ACTIVE
Implementation: NOT APPROVED
Code Changes: FORBIDDEN

## Objective

Execute Mission B End-to-End Product Discovery verification using real runtime evidence.

This assignment verifies that the complete Product Discovery Runtime works across Frontend and Backend.

## Required Inputs

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-003.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-AGENDA-REVISION-001.md
docs/mission-b/inbox/ROLE-ARCH/AUDIT-PHASE-1.md
docs/mission-b/inbox/ROLE-ARCH/AUDIT-FE01-FLOW-INTEGRATION-001.md
docs/mission-b/inbox/ROLE-ARCH/AUDIT-FE01-PRODUCT-DISCOVERY-COMPLETION-001.md
docs/mission-b/inbox/ROLE-ARCH/AUDIT-FE02-UX-VALIDATION-PLAN-001.md
docs/mission-b/inbox/VERIFY/VERIFY-E2E-PLAN-001.md
```

## Verification Scope

Verify all approved Mission B Product Discovery paths.

### Flow A — Template Product Path

```txt
Search Template-only product
-> select Template result
-> resolve or create Operational Product
-> receive through /api/quick-stock/existing using operationalProduct.id
-> confirm Branch Runtime evidence
```

### Flow B — Existing Operational Product Path

```txt
Search product already existing in current branch Operational Catalog
-> select Operational Product result directly
-> receive through /api/quick-stock/existing using operationalProduct.id
-> confirm Branch Runtime evidence
```

### Flow C — Local Product Path

```txt
Search product with no suitable Template or Operational result
-> create Local Operational Product
-> receive through /api/quick-stock/existing using operationalProduct.id
-> search again
-> confirm created product appears as Operational Product
-> receive again if safe/appropriate
-> confirm Branch Runtime evidence
```

## Required Evidence

Capture or report evidence for:

```txt
Branch / employee context used
Search terms used
Frontend result type visible: Template vs Operational
API call path used where observable
Operational product id used for receive
BranchPrice readiness
Stock movement or stock balance after receive
Product visible in branch product search/list/detail after receive
Flow C search-after-create result
UX blocking risks from FE-02 checked
```

## Hard Failure Conditions

Mission B E2E must FAIL if any of these occur:

```txt
Template Product id is sent to receive.
Existing Operational Product cannot be discovered or selected.
Local-created product cannot be found again through Operational search.
Receive succeeds without valid operationalProduct.id.
Stock is created through create-local instead of /quick-stock/existing.
BranchPrice missing or unusable after product creation/receive.
Auth/Branch/apiClient/RBAC unrelated regression is introduced during verification.
```

## Constraints

```txt
Do not edit code.
Do not create new assignments for other Roles.
Do not run destructive tests without Human approval.
Do not mutate Template Catalog unless explicitly required and approved.
Do not implement Template Promotion.
Do not certify Mission B yourself.
```

If verification cannot be executed due to environment/setup limitations, write the blocker clearly and mark NEEDS_DECISION or FAIL depending on severity.

## Deliverable

Create report:

```txt
docs/mission-b/inbox/VERIFY/VERIFY-E2E-002.md
```

Report must include:

```txt
PASS/FAIL
Environment used
Test data used
Flow A result and evidence
Flow B result and evidence
Flow C result and evidence
Runtime evidence
UX blocker review
Known debts
Next recommended owner
```

## Completion Response

```txt
Report path:
PASS/FAIL:
Flows verified:
Critical blockers:
Known debt:
Next recommended owner:
```