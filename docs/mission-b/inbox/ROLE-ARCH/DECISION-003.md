# DECISION-003 — Mission B Product Discovery Runtime

Mission: Mission B
Owner: ROLE-ARCH
Status: APPROVED
Supersedes narrow interpretation of Mission B as Template Search only.

## Decision

Mission B must be completed as a Product Discovery Runtime, not only Template Search.

Approved definition:

```txt
Product Discovery
= Operational Product Search
+ Template Product Search
+ Local Product Creation
```

## Reason

QuickStock is not searching for Template Product as an end in itself.

QuickStock is searching for a product that can be received into branch stock.

That receive-ready product must resolve to an Operational Product before stock intake.

If a branch already created a Local Operational Product, that product must be discoverable later for repeated receive operations.

## Approved Runtime Sources

QuickStock Product Finder must account for three sources/paths:

```txt
Flow A — Template Product Path
Template Product found
-> select/adopt/clone as needed
-> Operational Product
-> receive through /api/quick-stock/existing

Flow B — Operational Product Path
Operational Product already exists in current branch
-> select Operational Product directly
-> receive through /api/quick-stock/existing

Flow C — Local Product Path
No suitable Template Product and no Operational Product
-> create Local Operational Product through POST /api/products/pos/create-local
-> adopt returned Operational Product
-> receive through /api/quick-stock/existing
-> later search must find that Operational Product again
```

## Runtime Catalog Separation

This decision preserves Runtime Catalog Separation:

```txt
Template Product = catalog/search/clone source only.
Operational Product = branch runtime source of truth.
QuickStock receive must use operationalProduct.id.
```

## Mission Acceptance Criteria

Mission B cannot be certified complete until all three paths pass verification:

```txt
Flow A: Template -> Operational Product -> Receive -> Branch Runtime
Flow B: Existing Operational Product -> Receive -> Branch Runtime
Flow C: Create Local -> Receive -> Search again -> Existing Operational Product -> Receive again
```

## Scope Boundary

This decision does not approve broad FE refactor.

This decision does not approve Auth/BranchStore/apiClient/route guard/RBAC changes.

This decision does not approve Template Promotion from Local Product back into Template Catalog.

Template Promotion is a future governance flow and should be handled by a later mission or decision.

## Next Step

Update Mission Agenda and ensure FE-01 Assignment evaluates whether current Flow Integration covers Product Discovery fully.

If ASSIGNMENT-022 does not cover Operational Product Search, ROLE-ARCH must issue ASSIGNMENT-023 for Product Discovery Completion.