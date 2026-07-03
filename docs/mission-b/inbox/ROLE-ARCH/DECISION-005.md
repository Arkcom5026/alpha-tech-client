# DECISION-005 — Operational-first Discovery Doctrine

Mission: Mission B
Owner: ROLE-ARCH
Status: APPROVED

## Input

```txt
docs/mission-b/inbox/FE-02/UX-OPERATIONAL-FIRST-REVIEW-001.md
```

## Decision

Adopt Operational-first Discovery for QuickStock Product Discovery.

When a branch Operational Product already exists for the same logical product, the operator-facing QuickStock search result should prefer the Operational Product and avoid showing the corresponding Template as a competing receive choice.

## Doctrine

```txt
Operational Product is the branch runtime source of truth.
Template Product remains catalog/search/clone source only.
Template should not compete with an existing Operational Product in the primary QuickStock receive workflow.
```

## Required Behavior

```txt
If Operational result exists for the same logical product, show the Operational result as the primary receive-ready item.
Suppress or de-emphasize the matching Template result in the primary operator search list.
If no Operational result exists, Template result remains visible and can be used as clone/create source.
If neither Operational nor Template exists, Local Product create remains available.
```

## Constraints

```txt
Do not remove Template search capability.
Do not change backend.
Do not change receive endpoint.
Do not change operationalProduct.id receive behavior.
Do not implement Template Promotion.
Do not implement duplicate governance.
```

## Reason

FE-02 confirmed that showing both Operational and Template entries for the same logical product increases operator decision load and makes operators interpret system semantics instead of completing receive work.

Operational-first discovery aligns UX with Mission B Runtime Catalog Separation.

## Next Owner

```txt
FE-01
```

Next action:

```txt
Implement minimal frontend filtering/grouping behavior for Operational-first QuickStock discovery.
```