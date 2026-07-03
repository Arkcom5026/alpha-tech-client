# ASSIGNMENT-020 — Local Operational Product Create Contract

Mission: Mission B
Assigned Role: BE-01 Backend Runtime Owner
Status: ACTIVE
Implementation: LOCKED

## Objective

Define and certify the backend contract required for Mission B Flow 3.

Flow 3:

```txt
Store-created local product when no ProductTemplate exists
```

## Context

ROLE-ARCH approved canonical B-07 path in:

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-001.md
```

Canonical path:

```txt
Create/adopt Operational Product first
-> receive through /quick-stock/existing using operationalProduct.id
```

## Required Analysis

BE-01 must determine:

```txt
1. Whether existing POST /api/products can safely create a branch-owned Operational Product for POS QuickStock local create.
2. Whether a dedicated endpoint is required, such as POST /api/products/pos/create-local.
3. Required request payload for local Operational Product creation.
4. Required response shape for FE adoption.
5. Branch ownership and employee context rules.
6. BranchPrice creation/upsert behavior.
7. ProductType/Brand/Unit requirements.
8. Validation and safety constraints for mode, noSN, and trackSerialNumber.
9. Whether created product is immediately searchable by POS operational search.
10. Any migration or schema risk.
```

## Constraints

```txt
Do not implement.
Do not refactor backend runtime.
Do not change QuickStock receive path.
Preserve Runtime Catalog Separation.
Operational Product is branch runtime source of truth.
Template Product is not required for Flow 3.
```

## Deliverable

Create report:

```txt
docs/mission-b/inbox/BE-01/LOCAL-CREATE-CONTRACT-001.md
```

Report must include:

```txt
Files inspected
Current backend create-product runtime summary
Recommended endpoint contract
Request payload
Response shape
Branch ownership rule
BranchPrice rule
Search visibility rule
Validation rules
FE integration notes
Implementation risk
PASS or NEEDS_DECISION conclusion
```

## Completion Response

```txt
Report path:
PASS/NEEDS_DECISION:
Files inspected:
Recommended endpoint:
Implementation required: YES/NO
Next recommended owner:
```