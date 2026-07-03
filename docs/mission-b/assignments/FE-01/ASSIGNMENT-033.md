# ASSIGNMENT-033 — Enforce Operational-first Template Suppression

Mission: Mission B
Role: FE-01 Runtime Owner
Status: ACTIVE
Implementation: APPROVED

## Objective

Finalize Operational-first QuickStock discovery behavior after field review.

The current UI still shows a matching Template row under Template Catalog even when a receive-ready Operational Product already exists. This is not sufficient for Decision-005.

## Required Inputs

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-005.md
docs/mission-b/inbox/FE-02/UX-OPERATIONAL-FIRST-REVIEW-001.md
docs/mission-b/inbox/FE-01/OPERATIONAL-FIRST-DISCOVERY-001.md
```

## Required Behavior

When a branch Operational Product covers the same logical product:

```txt
Show the Operational Product.
Hide the matching Template row from the primary QuickStock search result list.
Do not show Template Catalog for that matched item.
```

Template Catalog should remain visible only for Template results that do not have a matching Operational Product in the current branch.

## UX Guidance

It is acceptable to show a small informational note such as:

```txt
พบสินค้าในร้านแล้ว จึงซ่อนรายการ Template ที่ตรงกันเพื่อลดการเลือกซ้ำ
```

Only add the note if it can be done cleanly without clutter.

## Matching Rule

Use the safest existing matching rule from ASSIGNMENT-032 implementation.

```txt
Prefer exact linkage when available.
Use conservative fallback only.
If uncertain, do not hide.
```

## Constraints

```txt
Do not change backend.
Do not change Product Discovery API calls.
Do not change Receive endpoint.
Do not change operationalProduct.id receive behavior.
Do not implement Template Promotion.
Do not implement duplicate governance.
Do not refactor unrelated QuickStock code.
```

## Verification

Verify these cases:

```txt
Operational + matching Template: only Operational is shown as selectable receive result.
Template-only: Template remains visible.
Operational-only: Operational remains visible.
Operational + unrelated Template: unrelated Template remains visible if it is a valid candidate.
No result: Local Create remains available.
```

## Deliverable

Create report:

```txt
docs/mission-b/inbox/FE-01/OPERATIONAL-FIRST-SUPPRESSION-001.md
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