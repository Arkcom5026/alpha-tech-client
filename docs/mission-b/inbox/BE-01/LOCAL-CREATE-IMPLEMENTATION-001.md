# LOCAL-CREATE-IMPLEMENTATION-001 — Implement Local Operational Product Create Contract

Mission: Mission B
Role: BE-01 Backend Runtime Owner
Assignment: docs/mission-b/assignments/BE-01/ASSIGNMENT-021.md
Decision: docs/mission-b/inbox/ROLE-ARCH/DECISION-002.md
Status: SUBMITTED
Implementation: COMPLETED

---

## 1. Objective

Implement approved Mission B Flow 3 backend support:

```txt
POST /api/products/pos/create-local
```

Purpose:

```txt
Create a branch-owned local Operational Product when no ProductTemplate exists, return an adoption-ready runtime product shape, then allow FE to receive through /api/quick-stock/existing using operationalProduct.id.
```

---

## 2. Files changed

```txt
alpha-tech-server/routes/productRoutes.js
```

Backend implementation commit:

```txt
a634e12c86b199f8981b4b83449f4bb206756cc3
```

Report file:

```txt
alpha-tech-client/docs/mission-b/inbox/BE-01/LOCAL-CREATE-IMPLEMENTATION-001.md
```

---

## 3. Endpoint implemented

```txt
POST /api/products/pos/create-local
```

Route placement:

```txt
router.use(verifyToken)
router.get('/pos/search', productController.getProductsForPos)
router.get('/pos/runtime-by-template/:templateProductId', productController.getOperationalProductByTemplateId)
router.post('/pos/create-local', createLocalOperationalProduct)
router.post('/pos/create-from-template', createOperationalProductFromTemplate)
router.get('/pos/:id', productController.getProductPosById)
```

The route is protected by `verifyToken` and is mounted before `/pos/:id` to avoid route shadowing.

---

## 4. Request summary

Supported payload fields:

```txt
name
productTypeId
brandId optional
unitId optional
mode / stockMode / stockBehavior
noSN
trackSerialNumber
branchPrice.costPrice or costPrice
branchPrice.priceRetail or priceRetail
branchPrice.priceWholesale or priceWholesale
branchPrice.priceTechnician or priceTechnician
branchPrice.priceOnline or priceOnline
branchPrice.isActive or isActive / branchPriceActive
```

Rejected unsafe fields:

```txt
branchId from body
TEMPLATE_PRODUCT_ID / templateProductId
barcodes
items
```

Required runtime values:

```txt
authenticated req.user.branchId
name
productTypeId
costPrice > 0
priceRetail > 0
```

---

## 5. Response summary

Success response shape:

```txt
success: true
created: true
data: operationalProduct
product: operationalProduct
branchId
```

Operational product data includes:

```txt
id
active
name
mode
noSN
trackSerialNumber
templateProductId
isTemplateProduct: false
isOperationalProduct: true
branchId
category/categoryId/categoryName
productType/productTypeId/productTypeName
brandId/brandName
unitId/unitName/unit
costPrice
priceRetail
priceWholesale
priceTechnician
priceOnline
branchPriceActive
hasPrice
available
stockBalance
branchPrice[]
```

`templateProductId` is explicitly set to null during local product creation.

---

## 6. Runtime behavior implemented

### Branch ownership

Implemented rule:

```txt
Branch identity comes from authenticated runtime context only.
```

Behavior:

```txt
- Reads branchId from req.user.branchId.
- Rejects request if req.user.branchId is missing.
- Rejects body.branchId instead of trusting FE-provided branch identity.
- Validates productTypeId belongs to authenticated branch.
- Created Product becomes branch-owned through Product.productType.branchId.
- BranchPrice is written with the authenticated branchId.
```

### Product creation

Implemented behavior:

```txt
- Creates Product as active Operational Product.
- Does not create ProductTemplate.
- Sets templateProductId: null.
- Derives categoryId from ProductType.globalProductType.categoryId.
- Supports optional existing brandId/unitId.
- Does not add branch/productType product-name uniqueness.
```

### Mode normalization

Implemented local decision rule:

```txt
SIMPLE / NOSN / NO_SN / NO-SN -> SIMPLE, noSN true, trackSerialNumber false
STRUCTURED / SN -> STRUCTURED, noSN false, trackSerialNumber true
trackSerialNumber true -> STRUCTURED
noSN false -> STRUCTURED
noSN true -> SIMPLE
trackSerialNumber false -> SIMPLE
default -> SIMPLE
```

### BranchPrice

Implemented behavior:

```txt
- Requires price payload for Flow 3.
- Requires costPrice > 0.
- Requires priceRetail > 0.
- Upserts BranchPrice using productId + branchId.
- Supports priceWholesale, priceTechnician, priceOnline.
- Defaults isActive to true when omitted.
```

### Stock runtime

Implemented rule:

```txt
No stock rows are created during local product create.
```

The stock intake owner remains:

```txt
POST /api/quick-stock/existing
```

No QuickStock receive code was changed.

---

## 7. Verification performed

### Static/read-back verification

Performed by reading back `alpha-tech-server/routes/productRoutes.js` from GitHub after commit.

Verified:

```txt
[x] Route exists: POST /api/products/pos/create-local
[x] Route is behind router.use(verifyToken)
[x] Route is placed before /pos/:id
[x] Handler reads branchId from req.user.branchId
[x] Handler rejects body.branchId
[x] Handler rejects templateProductId
[x] Handler rejects barcodes/items stock queue
[x] Handler validates productTypeId + branchId
[x] Handler creates Product with templateProductId null
[x] Handler upserts BranchPrice by productId + branchId
[x] Handler returns success/created/data/product/branchId
[x] Handler returns operational runtime fields and BranchPrice fields
[x] No QuickStock receive file changed
[x] No schema migration performed
```

### Runtime execution verification

Not executed in this connector-only task because no live server/database/runtime test runner was invoked.

Recommended runtime verification after pull/deploy:

```txt
1. Login as employee with branchId.
2. POST /api/products/pos/create-local with valid branch ProductType and prices.
3. Confirm response contains data.id and isOperationalProduct=true.
4. GET /api/products/pos/search and confirm product appears for same branch.
5. POST /api/quick-stock/existing using returned data.id.
6. Confirm BranchPrice remains/upserts and stock balance/movement is created.
```

---

## 8. Known risks

```txt
1. Runtime DB verification has not been executed yet.
2. Optional brandId/unitId are accepted as existing references; invalid foreign keys may surface as Prisma errors.
3. BranchPrice is required by this implementation because Flow 3 requires costPrice and priceRetail before receive readiness.
4. create-from-template route now benefits from the shared adoption-ready mapper, but its core behavior was not intentionally refactored.
5. No duplicate local product name policy was added, matching DECISION-002.
```

---

## 9. PASS / NEEDS_DECISION conclusion

```txt
PASS
```

Reason:

```txt
The approved backend endpoint has been implemented with a minimal one-file patch. It follows DECISION-002: authenticated branch ownership only, ProductType branch validation, Operational Product creation, templateProductId null, BranchPrice upsert, no stock rows during local create, no QuickStock receive refactor, and adoption-ready response shape.
```

---

## 10. Next recommended owner

```txt
FE-01
```

Recommended next step:

```txt
FE-01 should integrate Flow 3 by calling POST /api/products/pos/create-local, adopting returned operationalProduct, then receiving through POST /api/quick-stock/existing using operationalProduct.id.
```

Recommended supporting step:

```txt
ROLE-ARCH should review this report and decide whether to assign runtime verification after FE integration or before FE integration.
```

---

## 11. Completion response

```txt
Report path:
docs/mission-b/inbox/BE-01/LOCAL-CREATE-IMPLEMENTATION-001.md

PASS/NEEDS_DECISION:
PASS

Files changed:
alpha-tech-server/routes/productRoutes.js

Endpoint:
POST /api/products/pos/create-local

Verification:
Static/read-back verification completed. Runtime DB/API execution not executed in connector-only environment.

Next recommended owner:
FE-01 for integration, ROLE-ARCH for review/next assignment decision.
```
