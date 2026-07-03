# ASSIGNMENT-024 — Mission B E2E Verification Plan

Mission: Mission B
Assigned Role: VERIFY
Phase: Parallel Preparation / E2E Verification Planning
Status: ACTIVE
Implementation: NOT APPROVED
Code Changes: FORBIDDEN

## Objective

Prepare the End-to-End Verification Plan for Mission B Product Discovery Runtime while FE-01 completes runtime integration.

This assignment prepares the test plan only. Do not execute verification until ROLE-ARCH opens the E2E execution phase.

## Context

Mission B must verify Product Discovery Runtime across three approved flows.

Related documents:

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-003.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-AGENDA-REVISION-001.md
docs/mission-b/inbox/ROLE-ARCH/AUDIT-PHASE-1.md
docs/mission-b/inbox/BE-01/LOCAL-CREATE-IMPLEMENTATION-001.md
```

## Required Verification Flows

### Flow A — Template Product Path

```txt
Search Product
-> Select Template Product
-> Resolve/Adopt Operational Product
-> Receive through /api/quick-stock/existing
-> Product visible and usable in branch runtime
```

### Flow B — Existing Operational Product Path

```txt
Search Product
-> Find existing branch Operational Product
-> Select Operational Product directly
-> Receive through /api/quick-stock/existing
-> Product visible and usable in branch runtime
```

### Flow C — Local Product Path

```txt
Search Product
-> Nothing suitable found
-> Create Local Operational Product
-> Receive through /api/quick-stock/existing
-> Search again
-> Find the created Operational Product
-> Receive again if needed
```

## Plan Must Define

```txt
Required test data
Branch / employee context required
Search terms
Expected result per flow
API calls involved
Frontend screens involved
Database/runtime evidence required
BranchPrice evidence
StockBalance / StockMovement evidence
Product List / POS search visibility evidence
Failure/blocker criteria
Evidence capture format
```

## Constraints

```txt
Do not change code.
Do not run destructive tests without Human approval.
Do not alter database manually unless explicitly approved.
Do not create new assignment for another Role.
Do not mark Mission B complete from this plan.
```

## Deliverable

Create report:

```txt
docs/mission-b/inbox/VERIFY/VERIFY-E2E-PLAN-001.md
```

Report must include:

```txt
Flow A test plan
Flow B test plan
Flow C test plan
Required setup
Required evidence
Known verification blockers
PASS or NEEDS_DECISION conclusion for readiness-to-test
Next recommended owner
```

## Completion Response

```txt
Report path:
PASS/NEEDS_DECISION:
Verification scope:
Blocking setup needs:
Next recommended owner:
```