# DECISION-002 — Local Operational Product Create Contract

Mission: Mission B
Owner: ROLE-ARCH
Status: APPROVED
Source report: docs/mission-b/inbox/BE-01/LOCAL-CREATE-CONTRACT-001.md

## Decision

Approve the clean backend contract for Mission B Flow 3:

```txt
POST /api/products/pos/create-local
```

## Approved Runtime Path

```txt
Local Operational Product create
-> return adoption-ready Operational Product runtime shape
-> FE adopts returned operationalProduct
-> receive through /api/quick-stock/existing using operationalProduct.id
```

## Approved Contract Rules

```txt
Branch identity comes from authenticated runtime context only.
Do not trust branchId from request body.
ProductType must belong to authenticated branch.
Created product must be an Operational Product.
templateProductId must remain null.
BranchPrice should use productId + branchId upsert.
/api/quick-stock/existing remains the stock intake owner.
No stock rows are created during local product create.
No schema migration is required for this contract.
```

## BranchPrice Decision

Create-local should accept price payload and upsert BranchPrice when provided.

Flow 3 should require costPrice and priceRetail before the product can be treated as ready for receive.

During receive, /api/quick-stock/existing remains the final runtime price source and may upsert BranchPrice from receive-form prices.

## Brand / Unit Decision

Brand and Unit may be optional existing references.

Creating a new Brand or Unit is outside this Mission B contract.

## Name Uniqueness Decision

Do not add branch/productType product-name uniqueness in this Mission B implementation.

Duplicate-name policy may be considered later as a separate product-catalog governance task.

## Next Step

Issue BE-01 implementation assignment for the approved create-local contract.