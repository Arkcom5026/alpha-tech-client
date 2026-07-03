# ASSIGNMENT-021 — Implement Local Operational Product Create Contract

Mission: Mission B
Assigned Role: BE-01 Backend Runtime Owner
Status: ACTIVE
Implementation: APPROVED

## Objective

Implement the approved Mission B Flow 3 backend contract.

Approved decision:

```txt
docs/mission-b/inbox/ROLE-ARCH/DECISION-002.md
```

## Scope

Create backend support for:

```txt
POST /api/products/pos/create-local
```

Purpose:

```txt
Create a branch-owned local Operational Product when no ProductTemplate exists, return an adoption-ready runtime product shape, then allow FE to receive through /api/quick-stock/existing using operationalProduct.id.
```

## Required Behavior

```txt
Use authenticated runtime branch context only.
Do not trust branchId from request body.
Validate ProductType belongs to authenticated branch.
Create Product as branch Operational Product.
templateProductId must remain null.
Do not create Template Product.
Do not create stock rows.
Do not change /api/quick-stock/existing.
Upsert BranchPrice for productId + branchId when price payload exists.
Return adoption-ready Operational Product runtime shape.
Ensure created product is visible through POS operational search.
```

## Required Contract Inputs

Support payload fields required by LOCAL-CREATE-CONTRACT-001:

```txt
name
productTypeId
brandId optional
unitId optional
mode/noSN/trackSerialNumber decision input
branchPrice or flat cost/retail price fields
```

Reject or ignore unsafe ownership fields:

```txt
branchId from body
templateProductId
stock queue
barcodes/items
```

## Response Shape Requirement

Return a shape FE can adopt immediately:

```txt
success
created
data: operationalProduct
product: operationalProduct
branchId
```

Operational product data should include current branch runtime fields, BranchPrice data, ProductType, Brand, Unit, mode/noSN/trackSerialNumber, and templateProductId null.

## Constraints

```txt
One responsibility at a time.
Minimal backend patch.
No schema migration unless a blocker is discovered.
No broad ProductController refactor.
No QuickStock receive refactor.
No all-in-one QuickStock path change.
```

## Verification

Run or document available verification for:

```txt
Route exists.
Branch ownership is enforced.
ProductType branch validation works.
BranchPrice upsert works.
Response is adoption-ready.
Created product appears in POS operational search.
/api/quick-stock/existing can receive created operationalProduct.id.
```

## Deliverable

Create report:

```txt
docs/mission-b/inbox/BE-01/LOCAL-CREATE-IMPLEMENTATION-001.md
```

Report must include:

```txt
Files changed
Endpoint implemented
Request/response summary
Verification performed
Known risks
PASS or NEEDS_DECISION conclusion
Next recommended owner
```

## Completion Response

```txt
Report path:
PASS/NEEDS_DECISION:
Files changed:
Endpoint:
Verification:
Next recommended owner:
```