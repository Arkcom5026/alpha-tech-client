# LOCAL-CREATE-CONTRACT-001 — Local Operational Product Create Contract

Mission: Mission B
Role: BE-01 Backend Runtime Owner
Assignment: docs/mission-b/assignments/BE-01/ASSIGNMENT-020.md
Related decision: docs/mission-b/inbox/ROLE-ARCH/DECISION-001.md
Status: SUBMITTED
Implementation: NOT PERFORMED / LOCKED

---

## 1. Scope

This report defines and certifies the backend contract required for Mission B Flow 3:

```txt
Store-created local product when no ProductTemplate exists
```

The assignment is analysis/report only. No backend runtime source code was changed.

---

## 2. Files inspected

### Mission / role documents

```txt
alpha-tech-client/docs/mission-b/assignments/BE-01/ASSIGNMENT-020.md
alpha-tech-client/docs/mission-b/inbox/ROLE-ARCH/DECISION-001.md
alpha-tech-client/docs/mission-b/WORKSPACE.md
alpha-tech-client/docs/mission-b/BLACKBOARD.md
alpha-tech-client/docs/mission-b/inbox/BE-01/README.md
```

Note: `docs/roles/README.md` was referenced by the workspace boot rule but was not found in `alpha-tech-client` at the time of inspection.

### Backend maps

```txt
alpha-tech-server/docs/backend/SYSTEM_MAP.md
alpha-tech-server/docs/backend/RUNTIME_MAP.md
```

### Backend runtime files

```txt
alpha-tech-server/server.js
alpha-tech-server/routes/productRoutes.js
alpha-tech-server/controllers/productController.js
alpha-tech-server/routes/branchPriceRoutes.js
alpha-tech-server/controllers/branchPriceController.js
alpha-tech-server/src/modules/quickStock/routes/quickStockRoutes.js
alpha-tech-server/src/modules/quickStock/controllers/quickStockController.js
alpha-tech-server/src/modules/quickStock/services/QuickStockService.js
alpha-tech-server/prisma/schema.prisma
```

---

## 3. Mission baseline from ROLE-ARCH decision

ROLE-ARCH approved this canonical B-07 path:

```txt
Template Search
-> Template selection
-> Operational lookup
-> if exists: adopt Operational Product
-> if missing: create/adopt Operational Product explicitly
-> receive through /quick-stock/existing using operationalProduct.id
```

For Flow 3, Template Product is not required. The created local product must be an Operational Product owned by the current branch, then received through:

```txt
POST /api/quick-stock/existing
```

using the created `operationalProduct.id`.

---

## 4. Current backend create-product runtime summary

### 4.1 Existing protected product routes

`routes/productRoutes.js` mounts protected POS/product runtime routes after `router.use(verifyToken)`.

Relevant routes:

```txt
GET  /api/products/pos/search
GET  /api/products/pos/runtime-by-template/:templateProductId
POST /api/products/pos/create-from-template
GET  /api/products/pos/:id
GET  /api/products
POST /api/products
PATCH /api/products/:id
```

### 4.2 Existing `POST /api/products`

Current handler:

```txt
controllers/productController.js -> createProduct
```

Observed behavior:

```txt
1. Reads branchId from req.user.branchId.
2. Rejects request if branchId is missing.
3. Requires product name.
4. Decides mode/noSN/trackSerialNumber from mode or stockMode/stockBehavior/noSN/trackSerialNumber.
5. Requires productTypeId.
6. Validates productTypeId belongs to current branch.
7. Derives categoryId from ProductType.globalProductType.categoryId.
8. Creates Product as active Operational Product.
9. Optionally creates productImages.
10. Auto-learns ProductTypeBrand when brandId is supplied.
11. Optionally creates BranchPrice if branchPrice or flat price fields are supplied.
12. Returns only `{ id: newProduct.id }`.
```

Important current constraints:

```txt
- Branch ownership is enforced through productType.branchId = req.user.branchId.
- ProductType must already exist for the current branch.
- Brand and Unit are optional existing references.
- BranchPrice creation is optional.
- BranchPrice uses create, not upsert, in createProduct.
- Product create and BranchPrice create are not wrapped in one explicit transaction.
- Response is not FE adoption-ready because it returns only id.
```

### 4.3 Existing operational search visibility

Current POS operational search:

```txt
GET /api/products/pos/search
```

Observed behavior:

```txt
- Reads branchId from req.user.branchId.
- Filters Product by product.productType.branchId = branchId.
- Excludes Template Catalog because Template Product lives under Template Branch/ProductType.
- Returns operational runtime shape including price, branchPriceActive, stock availability, noSN, trackSerialNumber, brand, unit, and productType fields.
```

Therefore, a Product created by `POST /api/products` with a current-branch ProductType should be immediately visible through POS operational search if active.

### 4.4 Existing receive path

Current QuickStock route:

```txt
POST /api/quick-stock/existing
```

Observed behavior:

```txt
- Requires verifyToken.
- Requires employee/admin/superadmin context.
- Reads currentBranchId from req.employee.branchId or req.user.branchId.
- Requires productId.
- Requires costPrice > 0.
- Requires priceRetail > 0.
- Requires at least one barcode/item.
- Rejects pricing fields inside individual queue items.
- Calls QuickStockService.quickReceiveExistingProduct(data, currentBranchId, employeeId).
```

QuickStockService behavior:

```txt
1. Normalizes barcode/items queue.
2. Rejects duplicate barcodes in payload.
3. Rejects duplicate barcodes already in StockItem or SimpleLot.
4. Rejects duplicate serial numbers in payload or StockItem.
5. Treats form-level costPrice/priceRetail/priceWholesale/priceTechnician/priceOnline as Runtime Session Price source of truth.
6. Starts transaction.
7. Finds Operational Product in current branch by product.id and productType.branchId.
8. If not found, treats productId as Template Product id and clones through productTemplateEngine.
9. Upserts BranchPrice for productId + branchId using runtime form prices.
10. Creates StockItem for structured runtime or SimpleLot for simple runtime.
11. Creates StockMovement.
12. Upserts StockBalance.
13. Returns productId, productName, mode, movementType, qty, createdStockItems/createdSimpleLotId, traceId.
```

For Flow 3, the desired path is to send an already-created local Operational Product id. In that case QuickStock finds the product in the current branch and does not need Template clone fallback.

---

## 5. Can existing POST /api/products safely create branch-owned Operational Product for Flow 3?

Conclusion:

```txt
YES, but only as a low-level create primitive.
NOT sufficient as the preferred certified FE adoption contract without an adapter or follow-up read.
```

Reasoning:

```txt
Safe parts:
- It is protected by verifyToken through productRoutes.
- It anchors branch identity to req.user.branchId.
- It validates ProductType belongs to the current branch.
- It creates an active Product under a branch ProductType.
- That makes the Product an Operational Product under Runtime Catalog Separation.
- It can optionally create BranchPrice.

Gaps:
- Response returns only `{ id }`, not the runtime product/adoption shape FE needs.
- BranchPrice is optional; Flow 3 requires BranchPrice ready before branch operation.
- BranchPrice is created with `create`, not `upsert`.
- Product create + BranchPrice create are not in one explicit transaction.
- The endpoint is generic Product CRUD, not POS QuickStock local-create contract.
- It does not explicitly return search/adoption flags such as `isOperationalProduct`, `branchId`, `hasPrice`, or `branchPriceActive`.
```

The existing endpoint can be reused internally or temporarily by FE with an additional read:

```txt
POST /api/products
-> GET /api/products/pos/:id
-> POST /api/quick-stock/existing
```

But this is not the cleanest certified contract for Mission B Flow 3.

---

## 6. Recommended endpoint contract

Recommended endpoint:

```txt
POST /api/products/pos/create-local
```

Purpose:

```txt
Create/adopt a branch-owned local Operational Product when no ProductTemplate exists, and return a POS runtime product shape that FE can immediately adopt before calling /api/quick-stock/existing.
```

Recommended implementation style for future implementation phase:

```txt
- Add a route-local or controller adapter.
- Reuse existing createProduct validation helpers where safe.
- Do not duplicate QuickStock receive logic.
- Do not change /api/quick-stock/existing.
- Do not involve ProductTemplate or templateProductId.
- Keep the handler thin and branch-scoped.
```

Recommended runtime sequence:

```txt
verifyToken
-> read branchId from req.user.branchId
-> validate employee/POS context if required by ROLE-ARCH
-> validate local product payload
-> validate ProductType belongs to branch
-> create Product as Operational Product
-> upsert BranchPrice if price payload is provided/required
-> read back product using POS runtime mapper
-> return adoption-ready runtime shape
```

---

## 7. Request payload

Recommended minimal payload:

```json
{
  "name": "Local product name",
  "productTypeId": 123,
  "brandId": 45,
  "unitId": 6,
  "mode": "SIMPLE",
  "noSN": true,
  "trackSerialNumber": false,
  "branchPrice": {
    "costPrice": 100,
    "priceRetail": 150,
    "priceWholesale": 140,
    "priceTechnician": 130,
    "priceOnline": 150,
    "isActive": true
  }
}
```

Supported aliases may match current createProduct behavior:

```txt
mode | stockMode | stockBehavior
branchPrice.costPrice | costPrice
branchPrice.priceRetail | priceRetail
branchPrice.priceWholesale | priceWholesale
branchPrice.priceTechnician | priceTechnician
branchPrice.priceOnline | priceOnline
branchPrice.isActive | isActive | branchPriceActive
```

Required fields:

```txt
name
productTypeId
mode/noSN/trackSerialNumber decision input
```

Recommended for Flow 3 before receive:

```txt
costPrice
priceRetail
```

Because `/api/quick-stock/existing` requires costPrice and priceRetail during receive anyway.

Optional fields:

```txt
brandId
unitId
images
priceWholesale
priceTechnician
priceOnline
active
```

Not allowed / should be ignored or rejected:

```txt
templateProductId
branchId from body
categoryId as branch truth
stock quantity
barcodes/items queue
price fields inside queue items
```

Reason:

```txt
Local create only creates/adopts Operational Product. Stock intake must remain owned by /api/quick-stock/existing.
```

---

## 8. Response shape

Recommended success response:

```json
{
  "success": true,
  "created": true,
  "exists": false,
  "data": {
    "id": 1001,
    "active": true,
    "name": "Local product name",
    "mode": "SIMPLE",
    "noSN": true,
    "trackSerialNumber": false,
    "templateProductId": null,
    "isTemplateProduct": false,
    "isOperationalProduct": true,
    "branchId": 2,
    "categoryId": 10,
    "categoryName": "...",
    "category": "...",
    "productTypeId": 123,
    "productTypeName": "...",
    "productType": "...",
    "brandId": 45,
    "brandName": "...",
    "unitId": 6,
    "unitName": "...",
    "unit": { "id": 6, "name": "..." },
    "costPrice": 100,
    "priceRetail": 150,
    "priceWholesale": 140,
    "priceTechnician": 130,
    "priceOnline": 150,
    "branchPriceActive": true,
    "hasPrice": true,
    "available": 0,
    "stockBalance": null,
    "branchPrice": [
      {
        "costPrice": 100,
        "priceRetail": 150,
        "priceWholesale": 140,
        "priceTechnician": 130,
        "priceOnline": 150,
        "isActive": true
      }
    ]
  },
  "product": { "sameAs": "data for FE compatibility" },
  "branchId": 2
}
```

Recommended error response pattern:

```json
{
  "success": false,
  "error": "PRODUCT_TYPE_NOT_FOUND_IN_BRANCH",
  "message": "ProductType does not belong to current branch"
}
```

---

## 9. Branch ownership rule

Certified rule:

```txt
Branch ownership must come from authenticated runtime context only:
req.user.branchId or canonical employee branch context produced by verifyToken.
```

Rules:

```txt
- Do not trust branchId from request body.
- Do not allow FE to choose POS branch identity during create-local.
- ProductType must belong to authenticated branch.
- Created Product becomes branch-owned through product.productType.branchId.
- BranchPrice.branchId must equal authenticated branchId.
- Stock receive must use the same authenticated branchId in /api/quick-stock/existing.
```

This preserves Runtime Catalog Separation because Operational Product remains the branch runtime source of truth.

---

## 10. BranchPrice rule

Recommended rule:

```txt
Create-local should upsert BranchPrice for productId + branchId when price payload is provided, and Flow 3 should require costPrice + priceRetail before receive.
```

Current runtime facts:

```txt
- BranchPrice has @@unique([productId, branchId]).
- /api/quick-stock/existing already upserts BranchPrice from runtime form prices.
- controllers/productController.createProduct currently creates BranchPrice only if price payload exists, using create.
- controllers/branchPriceController.upsertBranchPrice already has a branch-scoped upsert contract.
```

Recommended behavior for `POST /api/products/pos/create-local`:

```txt
- Use upsert, not create, for BranchPrice.
- Require costPrice > 0 and priceRetail > 0 if FE wants product to be immediately branch-operational before receive.
- Preserve optional priceWholesale, priceTechnician, priceOnline.
- Set isActive default true.
- Do not put price fields in stock queue items.
```

Important compatibility note:

```txt
Even if create-local creates BranchPrice, /api/quick-stock/existing should remain the final runtime price source during receive and may upsert/override BranchPrice from receive-form prices.
```

---

## 11. ProductType / Brand / Unit requirements

ProductType:

```txt
- Required.
- Must exist in current branch.
- Must be validated by productType.id + branchId.
- categoryId should be derived from ProductType.globalProductType.categoryId.
```

Brand:

```txt
- Optional.
- If brandId is supplied, current createProduct auto-learns ProductTypeBrand.
- A future create-local adapter may preserve this behavior.
- Creating a new Brand is not part of this contract unless ROLE-ARCH explicitly expands scope.
```

Unit:

```txt
- Optional existing Unit reference.
- Creating a new Unit is not part of this contract.
```

Template Product:

```txt
- Not required for Flow 3.
- templateProductId should remain null.
```

---

## 12. Validation and safety constraints for mode, noSN, trackSerialNumber

Current `decideMode` behavior in `productController.js`:

```txt
- SIMPLE / NOSN / NO_SN / NO-SN -> mode SIMPLE, noSN true, trackSerialNumber false
- STRUCTURED / SN -> mode STRUCTURED, noSN false, trackSerialNumber true
- trackSerialNumber true -> STRUCTURED
- noSN false -> STRUCTURED
- noSN true -> SIMPLE
- trackSerialNumber false -> SIMPLE
- default -> SIMPLE
```

Recommended create-local validation:

```txt
- Normalize mode/noSN/trackSerialNumber through the same decision rule.
- Reject inconsistent payload only if it cannot be normalized safely.
- Return normalized mode/noSN/trackSerialNumber in response.
- Do not create stock rows during local product create.
- Let /api/quick-stock/existing enforce stock queue behavior for structured/simple intake.
```

Receive behavior:

```txt
- /api/quick-stock/existing determines runtime mode from Product.trackSerialNumber/mode/noSN.
- STRUCTURED creates StockItem rows from normalized barcode/serial queue.
- SIMPLE creates SimpleLot and StockBalance from queue quantity.
```

---

## 13. Search visibility rule

Certified rule:

```txt
A local Operational Product is searchable by POS operational search immediately after creation if:
1. Product.active is true.
2. Product.productTypeId points to a ProductType whose branchId equals authenticated branchId.
```

Relevant operational search:

```txt
GET /api/products/pos/search
```

Branch filtering:

```txt
product.productType.branchId = req.user.branchId
```

Price visibility:

```txt
- If BranchPrice exists, POS search returns hasPrice=true and branch prices.
- If BranchPrice does not exist, product may still appear but hasPrice=false and price fields default to 0.
- Flow 3 should ensure BranchPrice exists before declaring the product operationally ready.
```

---

## 14. FE integration notes

Recommended FE Flow 3 path:

```txt
1. Operator chooses local product creation because no suitable Template Product exists.
2. FE calls POST /api/products/pos/create-local.
3. Backend returns adoption-ready Operational Product runtime shape.
4. FE adopts returned product as `operationalProduct`.
5. FE calls POST /api/quick-stock/existing using `operationalProduct.id`.
6. Backend receives stock, upserts BranchPrice from receive-form prices, writes movement/balance.
7. FE refreshes POS operational product/search state.
```

Fallback path if no new endpoint is approved:

```txt
1. FE calls POST /api/products.
2. FE receives `{ id }`.
3. FE calls GET /api/products/pos/:id to hydrate runtime product shape.
4. FE calls POST /api/quick-stock/existing using hydrated product id.
```

Fallback is possible but less clean because it spreads adoption responsibility across multiple calls and relies on generic Product CRUD response.

---

## 15. Implementation risk

### Low / controlled risks

```txt
- Existing `POST /api/products` already validates branch-owned ProductType.
- Existing POS search already exposes branch-owned Operational Product.
- Existing QuickStock receive already accepts Operational Product id and upserts BranchPrice/stock runtime.
```

### Medium risks

```txt
- Generic `POST /api/products` returns only id; FE may adopt incomplete product state.
- Existing createProduct creates Product and BranchPrice without explicit transaction.
- BranchPrice create rather than upsert can be less resilient as a reusable POS local-create contract.
- Existing `quickStockInAllInOne` is not recommended for canonical Flow 3 because it mixes product create and stock intake and does not follow ROLE-ARCH approved create/adopt -> receive path.
```

### Decisions needed before implementation

```txt
1. Approve whether BE should add POST /api/products/pos/create-local.
2. Decide whether BranchPrice is required at create-local time or only at receive time.
3. Decide whether create-local must reject missing brand/unit or allow nulls.
4. Decide whether local product name uniqueness should be enforced within branch/productType.
```

Schema note:

```txt
No migration appears required for the recommended contract. Existing Product, ProductType, BranchPrice, StockBalance, StockMovement, SimpleLot, and StockItem schema can support the flow.
```

Potential future schema consideration, not required now:

```txt
A uniqueness rule for local product names inside branch/productType may be useful later, but adding it now could be risky because existing data may contain duplicates.
```

---

## 16. PASS / NEEDS_DECISION conclusion

Conclusion:

```txt
NEEDS_DECISION
```

Reason:

```txt
Backend can create branch-owned Operational Product today through POST /api/products, and /api/quick-stock/existing can receive it safely using operationalProduct.id.

However, the clean certified Flow 3 contract should be POST /api/products/pos/create-local because FE needs an adoption-ready runtime response and branch-price behavior should be explicit/upsert-based. This endpoint requires ROLE-ARCH/user approval before implementation.
```

---

## 17. Completion response

```txt
Report path:
docs/mission-b/inbox/BE-01/LOCAL-CREATE-CONTRACT-001.md

PASS/NEEDS_DECISION:
NEEDS_DECISION

Files inspected:
alpha-tech-client/docs/mission-b/assignments/BE-01/ASSIGNMENT-020.md
alpha-tech-client/docs/mission-b/inbox/ROLE-ARCH/DECISION-001.md
alpha-tech-client/docs/mission-b/WORKSPACE.md
alpha-tech-client/docs/mission-b/BLACKBOARD.md
alpha-tech-client/docs/mission-b/inbox/BE-01/README.md
alpha-tech-server/docs/backend/SYSTEM_MAP.md
alpha-tech-server/docs/backend/RUNTIME_MAP.md
alpha-tech-server/routes/productRoutes.js
alpha-tech-server/controllers/productController.js
alpha-tech-server/controllers/branchPriceController.js
alpha-tech-server/src/modules/quickStock/routes/quickStockRoutes.js
alpha-tech-server/src/modules/quickStock/controllers/quickStockController.js
alpha-tech-server/src/modules/quickStock/services/QuickStockService.js
alpha-tech-server/prisma/schema.prisma

Recommended endpoint:
POST /api/products/pos/create-local

Implementation required:
YES, if ROLE-ARCH/user approves a clean certified FE adoption contract.
NO, if FE accepts temporary fallback POST /api/products -> GET /api/products/pos/:id -> POST /api/quick-stock/existing.

Next recommended owner:
ROLE-ARCH for decision approval, then BE-01 for implementation assignment if approved.
```
