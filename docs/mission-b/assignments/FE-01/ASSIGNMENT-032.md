# ASSIGNMENT-032 — Mission B Operational-first QuickStock Discovery

Mission: Mission B
Role: FE-01 Runtime Owner
Status: ACTIVE
Implementation: APPROVED

## Objective

Implement the minimal frontend change required by ROLE-ARCH DECISION-005.

## Required Inputs

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-005.md
docs/mission-b/inbox/FE-02/UX-OPERATIONAL-FIRST-REVIEW-001.md
docs/mission-b/inbox/FE-01/SPRINT2-FIELD-READINESS-001.md
```

## Required Behavior

QuickStock Product Discovery must be Operational-first.

```txt
If a branch Operational Product exists for the same logical product, show the Operational result as the receive-ready result.
Do not show the matching Template as a competing primary receive choice.
If no Operational Product exists, show Template so operator can create/adopt Operational Product.
If neither exists, Local Product create remains available.
```

## Scope

Allowed files:

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
```

If another file is required, explain why in the report.

## Matching Guidance

Use the safest existing data available.

Prefer exact template linkage if available.
If exact linkage is not available, use conservative matching only. Do not hide Templates aggressively if uncertain.

## Constraints

```txt
Do not change backend.
Do not change Product Discovery API calls.
Do not change Receive endpoint.
Do not change operationalProduct.id receive behavior.
Do not implement Template Promotion.
Do not implement duplicate governance.
Do not broadly refactor QuickStock.
```

## Verification

Verify:

```txt
Operational + Template duplicate case shows Operational as primary and does not offer Template as competing receive choice.
Template-only case still shows Template.
Operational-only case still shows Operational.
No-result case still allows Local Create.
Receive flow remains unchanged.
```

## Deliverable

Create report:

```txt
docs/mission-b/inbox/FE-01/OPERATIONAL-FIRST-DISCOVERY-001.md
```

Report must include:

```txt
PASS/NEEDS_DECISION
Files changed
Behavior implemented
Matching rule used
Regression check
Remaining risks
Next recommended owner
```

## Completion Response

```txt
Report path:
PASS/NEEDS_DECISION:
Files changed:
Behavior implemented:
Remaining risks:
Next recommended owner:
```