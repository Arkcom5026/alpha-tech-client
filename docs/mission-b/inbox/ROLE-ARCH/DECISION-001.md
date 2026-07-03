# DECISION-001 — Mission B B-07 Canonical Runtime Path

Mission: Mission B
Owner: ROLE-ARCH
Status: APPROVED
Source report: docs/mission-b/inbox/FE-01/FLOW-DESIGN-001.md

## Decision

Approve FE-01 recommendation for the canonical B-07 path:

```txt
Template Search
-> Template selection
-> Operational lookup
-> if exists: adopt Operational Product
-> if missing: create/adopt Operational Product explicitly
-> receive through /quick-stock/existing using operationalProduct.id
```

## Rationale

This path keeps Template Product as search/clone source only.

Operational Product remains the branch runtime source of truth.

The receive endpoint should receive an Operational Product id in the primary UI path.

Backend clone-inside-/existing may remain as compatibility fallback, but it is not the primary FE runtime path.

## Consequence

Flow 3 requires a certified local Operational Product creation contract before FE can implement local product creation safely.

Next assignment should go to BE-01 to define the local Operational Product create contract and certify whether an existing endpoint can be reused or a new endpoint is required.