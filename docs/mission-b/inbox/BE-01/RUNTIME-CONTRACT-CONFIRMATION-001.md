# RUNTIME-CONTRACT-CONFIRMATION-001 — Mission B Backend Contract Review

Mission: Mission B
Role: BE-01 Backend Runtime Owner
Assignment: docs/mission-b/assignments/BE-01/ASSIGNMENT-031.md
Status: SUBMITTED
Implementation: NOT PERFORMED
Code Changes: NONE

---

## 1. Scope

This is a review-only BE-01 report for backend contracts still affecting Mission B closure.

Reviewed contracts:

```txt
1. Local product creation safeguards
2. Product Detail response shape
3. Operational product search query contract
```

No backend code was changed.
No migration was created.
QuickStock receive was not altered.
Template Promotion was not implemented.

---

## 2. Files inspected

```txt
alpha-tech-client/docs/mission-b/assignments/BE-01/ASSIGNMENT-031.md
alpha-tech-server/routes/productRoutes.js
alpha-tech-server/controllers/productController.js
```

Previously loaded BE boot baseline remains applicable:

```txt
alpha-tech-server/docs/README.md
alpha-tech-server/docs/backend/SYSTEM_MAP.md
alpha-tech-server/docs/backend/RUNTIME_MAP.md
alpha-tech-server/docs/backend/DOMAIN_MAP_STOCK_PROCUREMENT_SALES.md
alpha-tech-server/docs/backend/MIGRATION_MAP.md
alpha-tech-server/docs/backend/MISSION_MAP.md
alpha-tech-server/docs/roles/README.md
alpha-tech-server/docs/roles/backend/BE-01-RUNTIME.md
```

---

## 3. Local product creation safeguard result

Endpoint reviewed:

```txt
POST /api/products/pos/create-local
```

Production route location:

```txt
alpha-tech-server/routes/productRoutes.js
```

Current implementation safeguards confirmed:

```txt
- Route is protected by verifyToken because it is declared after router.use(verifyToken).
- Branch identity is read from req.user.branchId.
- body.branchId is rejected.
- templateProductId is rejected.
- barcodes/items stock queue is rejected.
- name is required.
- productTypeId is required.
- branchPrice payload is required.
- costPrice > 0 is required.
- priceRetail > 0 is required.
- ProductType is validated by id + authenticated branchId.
- Product is created with templateProductId: null.
- BranchPrice is upserted using productId + branchId.
- ProductTypeBrand learning ignores duplicate mapping via P2002.
- Response returns adoption-ready shape: success, created, data, product, branchId.
```

Important result for repeated/similar branch products:

```txt
No duplicate or similar-product guard currently exists in POST /api/products/pos/create-local.
```

Observed behavior:

```txt
- The handler does not search for an existing Product with the same/similar name in the same branch/productType.
- The handler does not return existing product when a same-name local product already exists.
- The handler does not reject duplicate local product names.
- There is no fuzzy/similarity safeguard.
- DECISION-002 explicitly said not to add branch/productType product-name uniqueness in this Mission B implementation.
```

Assessment:

```txt
Backend is safe for ownership, template separation, price readiness, and stock separation.
Backend is not currently a duplicate-prevention authority for repeated/similar local products.
```

Recommended FE interpretation:

```txt
FE should not assume create-local prevents duplicate or similar local products.
If duplicate prevention is required for Mission B closure, it is a governance/decision topic, not an existing backend guarantee.
```

---

## 4. Product Detail response shape result

Endpoint reviewed:

```txt
GET /api/products/:id?v=full
```

Actual route behavior:

```txt
routes/productRoutes.js
router.get('/:id', productController.getProductPosById)
```

The `v=full` query parameter is not read by `getProductPosById`.

Therefore the actual backend contract is:

```txt
GET /api/products/:id
```

with optional `v=full` currently ignored.

Current `getProductPosById` behavior confirmed:

```txt
- Reads branchId from req.user.branchId.
- Rejects missing branchId with 401 unauthorized.
- Reads id from req.params.id.
- Finds Product by id and productType.branchId = authenticated branchId.
- Returns 404 when product is not in current branch.
- Selects ProductType / GlobalProductType / Category.
- Selects Brand.
- Selects Unit.
- Selects active ProductImages.
- Selects BranchPrice scoped by branchId.
- Selects StockBalance scoped by branchId.
- Selects StockItem existence scoped by branchId + IN_STOCK.
- Computes available and isReady.
- Returns price fields and branchPrice object.
```

Returned shape includes:

```txt
id
name
spec
mode
noSN
trackSerialNumber
unitId
unitName
unit
categoryId
productTypeId
productProfileId
productTemplateId
categoryName
productTypeName
brandId
brandName
images
costPrice
priceWholesale
priceTechnician
priceRetail
priceOnline
branchPriceActive
available
isReady
lastCost
branchPrice
```

Notable limitations compared with create-local adoption shape:

```txt
- Does not return isOperationalProduct.
- Does not return isTemplateProduct.
- Does not return branchId.
- Does not return hasPrice.
- Does not return stockBalance object.
- Does not return branchPrice as an array; it returns branchPrice as an object.
- Does not use or branch on v=full.
```

Assessment:

```txt
The endpoint returns the correct branch-scoped Operational Product detail for runtime Product Detail.
However, `?v=full` is not a functional backend contract today. The current full/detail response is the default `GET /api/products/:id` response.
```

Recommended FE interpretation:

```txt
FE may call GET /api/products/:id?v=full` without breaking backend, but should not depend on `v=full` changing the response. For strict contract clarity, FE should treat `GET /api/products/:id` as the canonical Product Detail endpoint unless ROLE-ARCH assigns a future explicit `v=full` contract.
```

---

## 5. Operational search query contract result

Endpoint reviewed:

```txt
GET /api/products/pos/search
```

Actual route behavior:

```txt
routes/productRoutes.js
router.get('/pos/search', productController.getProductsForPos)
```

Current query parsing in `getProductsForPos`:

```txt
search: qSearch = ''
searchText: qSearchText = ''
...
const search = String(qSearch || qSearchText || '').trim()
```

Result:

```txt
Backend supports both `search` and `searchText`.
```

Precedence:

```txt
If both are provided, `search` wins because qSearch || qSearchText is used.
```

Current additional query params observed:

```txt
take
page
productTypeId
brandId
readyOnly
hasPrice
activeOnly
includeInactive
mode
simpleOnly
```

Branch/runtime behavior:

```txt
- Reads branchId from req.user.branchId.
- Filters Product by productType.branchId = branchId.
- Defaults activeOnly true unless includeInactive=1/true or activeOnly=false.
- Search applies case-insensitive contains on Product.name.
- Returns branchPrice scoped by branchId.
- Returns stockBalances scoped by branchId.
- Returns StockItem existence scoped by branchId + IN_STOCK.
```

Recommended canonical FE usage:

```txt
Use `search` as the canonical query parameter.
```

Compatibility note:

```txt
`searchText` remains accepted as an alias for backward compatibility.
Avoid sending both. If both are sent, backend uses `search`.
```

---

## 6. Backend blockers for Mission B closure

Backend blockers found:

```txt
None blocking Mission B closure from BE runtime contract perspective.
```

Clarifications / non-blocking risks:

```txt
1. create-local does not prevent duplicate/similar local products.
   This matches DECISION-002 and is not a runtime blocker unless Mission B now requires duplicate governance.

2. GET /api/products/:id?v=full does not use `v=full`.
   The endpoint still returns branch-scoped runtime detail by default, so this is a contract clarity issue, not a closure blocker.

3. Operational search supports both `search` and `searchText`.
   FE should standardize on `search`.
```

---

## 7. PASS / NEEDS_DECISION

```txt
PASS
```

Reason:

```txt
The inspected backend contracts are sufficient for Mission B closure as runtime facts, with clear FE guidance:
- create-local is branch/price/template/stock safe but not duplicate-governed.
- product detail is branch-scoped and usable; `v=full` is ignored.
- POS search should use `search` canonically while `searchText` remains compatible.
```

Decision only needed if Mission B closure now requires backend duplicate prevention or a formal `v=full` response variant.

---

## 8. Recommended next owner

```txt
FE-01
```

Recommended next action:

```txt
FE-01 may proceed using these confirmed contracts:
- POST /api/products/pos/create-local for local Operational Product creation.
- GET /api/products/:id for branch Product Detail hydration; `v=full` may be sent but is not meaningful today.
- GET /api/products/pos/search?search=... as canonical operational search query.
```

If duplicate governance or a true full-detail response variant is required, next owner should be:

```txt
ROLE-ARCH
```

for decision before any BE implementation assignment.

---

## 9. Completion response

```txt
Report path:
docs/mission-b/inbox/BE-01/RUNTIME-CONTRACT-CONFIRMATION-001.md

PASS/NEEDS_DECISION:
PASS

Files inspected:
alpha-tech-client/docs/mission-b/assignments/BE-01/ASSIGNMENT-031.md
alpha-tech-server/routes/productRoutes.js
alpha-tech-server/controllers/productController.js

Backend blockers:
None blocking Mission B closure. Non-blocking clarifications: create-local has no duplicate/similar guard; v=full is ignored; FE should use search as canonical query param.

Next recommended owner:
FE-01, with ROLE-ARCH only if duplicate governance or true v=full contract is required.
```
