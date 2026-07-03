# ASSIGNMENT-027 — Mission B Live E2E Validation

Mission: Mission B
Assigned Role: FE-02 UX Owner
Phase: Live E2E Validation
Status: ACTIVE
Implementation: NOT APPROVED
Code Changes: FORBIDDEN

## Objective

Run Mission B Product Discovery validation in a live application environment and capture evidence for all approved flows.

This assignment supersedes the temporary VERIFY execution responsibility from ASSIGNMENT-026.

## Required Inputs

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-003.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-AGENDA-REVISION-001.md
docs/mission-b/inbox/ROLE-ARCH/AUDIT-FE01-PRODUCT-DISCOVERY-COMPLETION-001.md
docs/mission-b/inbox/ROLE-ARCH/AUDIT-FE02-UX-VALIDATION-PLAN-001.md
docs/mission-b/inbox/FE-02/E2E-VALIDATION-001.md
```

## Validation Scope

Validate all Mission B Product Discovery paths:

```txt
Flow A — Template Product Path
Flow B — Existing Operational Product Path
Flow C — Local Product Path with search-after-create
```

## Required Evidence

Capture evidence for:

```txt
Branch and user context used
Search terms used
Visible result type: Template or Operational
Operational product id used for receive
Branch price readiness
Stock result after receive
Product visibility after receive
Flow C search-after-create result
UX acceptance criteria checked
```

## Hard Stop Conditions

Stop and report NEEDS_DECISION if:

```txt
Live application cannot be opened.
Login/session cannot be completed.
Required API calls cannot be observed.
Required runtime evidence cannot be captured.
Any flow cannot be safely executed.
```

## Constraints

```txt
Do not edit code.
Do not create new assignments.
Do not change Template Catalog governance.
Do not implement Template Promotion.
Do not certify Mission B.
```

## Deliverable

Create report:

```txt
docs/mission-b/inbox/FE-02/LIVE-E2E-VALIDATION-001.md
```

Report must include:

```txt
PASS/FAIL/NEEDS_DECISION
Environment used
Flow A evidence
Flow B evidence
Flow C evidence
UX acceptance result
Known debt
Next recommended owner
```

## Completion Response

```txt
Report path:
PASS/FAIL/NEEDS_DECISION:
Flows validated:
Critical blockers:
Known debt:
Next recommended owner:
```