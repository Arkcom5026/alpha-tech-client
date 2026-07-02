# INTEGRATION-001 — S2 Integration Contract Verification

Mission: Mission B
Assignment: ASSIGNMENT-014
Task: TASK-01 Runtime Analysis Squad
Role: ROLE-RUNTIME
Status: VERIFICATION / DISCOVERY ONLY
Implementation: NOT APPROVED

## 1. Endpoint availability

Frontend target endpoint:

```txt
POST /api/products/pos/create-from-template
```

Frontend wrapper currently calls:

```txt
products/pos/create-from-template
```

Backend availability result:

```txt
NOT AVAILABLE in current backend routing evidence.
```

Backend `server.js` mounts product routes at:

```txt
app.use('/api/products', productRoutes)
```

Backend `routes/productRoutes.js` currently declares protected POS routes:

```txt
GET /api/products/pos/search
GET /api/products/pos/runtime-by-template/:templateProductId
GET /api/products/pos/:id
```

Backend `routes/productRoutes.js` does not declare:

```txt
POST /api/products/pos/create-from-template
```

Therefore, the current FE create-from-template call will likely receive 404 Not Found unless another runtime/proxy route outside the inspected evidence exists.

## 2. Request contract comparison

### FE request contract

Current FE payload builder in `QuickStockPage.jsx` sends only Template-derived identity/descriptive fields:

```txt
templateProductId
sourceCatalog: TEMPLATE
name
productTypeId
brandId
unitId
mode
trackSerialNumber
categoryId
codeType
warrantyDays
productConfig
active
```

Current FE wrapper in `productApi.js` deletes frontend `branchId` before POST and preserves `templateProductId`.

### BE route contract

No backend handler for `POST /api/products/pos/create-from-template` was found.

The closest existing backend create handler is:

```txt
POST /api/products
productController.createProduct
```

Current `createProduct` expects at minimum:

```txt
name
productTypeId
```

It derives branch identity from `req.user.branchId` and validates `productTypeId` against the branch via `assertOperationalTypeAndCategory`.

Current `createProduct` does not use or persist `templateProductId` in the inspected code path. It also does not enforce a Template source contract.

### Comparison result

```txt
FE S2 create-from-template contract does not currently match a backend endpoint.
```

## 3. Response contract comparison

### FE expected response

QuickStockPage accepts common envelopes and then validates a returned Operational Product candidate:

```txt
{ data: { product: operationalProduct } }
{ data: operationalProduct }
{ product: operationalProduct }
operationalProduct
```

Adoption requires:

```txt
id exists
returned object is not Template-like
returned id is not equal to selected Template id
```

### BE response found for closest create path

Current backend `POST /api/products` returns only:

```txt
{ id: newProduct.id }
```

This is not enough for QuickStockPage adoption because it lacks Operational Product runtime fields such as:

```txt
name
mode
productTypeId
brandId
unitId
templateProductId
isTemplateProduct false / isOperationalProduct true
branchPrice / hasPrice state
```

### Comparison result

```txt
FE response adoption contract is not satisfied by the current backend generic createProduct response.
```

A create-from-template backend endpoint should return the same runtime shape as `mapRuntimeProductForPos(product, branchId)` or at least an envelope containing a valid mapped Operational Product.

## 4. Branch identity handling

FE wrapper intentionally removes `branchId` before sending create-from-template payload.

Backend evidence supports branch-from-token for existing protected product routes:

```txt
const branchId = Number(req.user?.branchId)
```

This is used in:

```txt
getProductsForPos
getOperationalProductByTemplateId
getProductPosById
createProduct
```

Result:

```txt
Branch identity principle matches FE expectation.
```

However, since `POST /api/products/pos/create-from-template` is missing, the specific endpoint cannot yet be verified.

## 5. BranchPrice behavior finding

Current FE create-from-template flow intentionally does not send BranchPrice fields.

Current backend generic `createProduct` can create BranchPrice only when request body includes nested/flat BranchPrice payload through `pickBranchPricePayload(data)`.

Because FE does not send BranchPrice fields and because create-from-template endpoint is missing, current S2 create/adopt cannot create BranchPrice.

Result:

```txt
BranchPrice is not created by current FE S2 create/adopt contract.
BranchPrice remains a separate runtime debt and should not be assumed ready after create/adopt.
```

## 6. Error behavior finding

For the target endpoint:

```txt
POST /api/products/pos/create-from-template
```

No backend error behavior is available because the route/handler is not found.

Expected current server behavior for this path:

```txt
404 Not Found
{ ok: false, error: 'Not Found', path: '/api/products/pos/create-from-template', reqId }
```

Existing related endpoint `GET /api/products/pos/runtime-by-template/:templateProductId` has verified errors/empty states:

```txt
401 BRANCH_ID_MISSING when branch context is missing
400 TEMPLATE_PRODUCT_ID_MISSING when templateProductId is missing
200 success:true exists:false when no operational product exists
500 RUNTIME_PRODUCT_LOOKUP_FAILED on unexpected lookup failure
```

Generic `POST /api/products` has verified errors:

```txt
401 unauthorized when branch context is missing
400 NAME_REQUIRED when name is missing
400 PRODUCT_TYPE_REQUIRED / PRODUCT_TYPE_NOT_FOUND_IN_BRANCH / CATEGORY_TYPE_MISMATCH through type validation
500 Failed to create product on unexpected failure
```

Missing for create-from-template contract:

```txt
TEMPLATE_NOT_FOUND
OPERATIONAL_PRODUCT_ALREADY_EXISTS
BRANCH_CONTEXT_MISSING for this endpoint
REQUIRED_TEMPLATE_FIELD_MISSING
CREATE_FROM_TEMPLATE_FAILED
```

## 7. FE compatibility result

Compatibility status:

```txt
BLOCKED — FE contract does not currently have a matching BE endpoint.
```

What is compatible:

```txt
GET /api/products/pos/runtime-by-template/:templateProductId
```

This existing endpoint supports the earlier lookup/adopt flow and returns a mapped Operational Product shape suitable for frontend runtime adoption when product exists.

What is not compatible:

```txt
POST /api/products/pos/create-from-template
```

The frontend wrapper/action/page now expect this endpoint, but backend routing does not expose it.

Additionally, the closest backend generic create endpoint returns only `{ id }`, which is insufficient for current QuickStockPage adoption validation.

## 8. Blocking issues

### B-001 Missing backend endpoint

`POST /api/products/pos/create-from-template` is not declared in `routes/productRoutes.js`.

### B-002 Missing backend controller/service contract

No backend controller/service implementation for Template to Operational Product creation was found in inspected evidence.

### B-003 Generic create response is insufficient

`POST /api/products` returns only `{ id }`, but QuickStockPage requires a valid Operational Product object for adoption.

### B-004 Template identity persistence is not verified

Current generic `createProduct` does not visibly persist `templateProductId`, so it cannot be used as the create-from-template implementation without changes.

### B-005 BranchPrice not created

FE does not send BranchPrice and missing create-from-template endpoint cannot create it. BranchPrice must remain a later separately certified step.

## 9. Recommended next assignment

Recommended next assignment:

```txt
ASSIGNMENT-015 — BE Create-From-Template Endpoint Discovery / Implementation Plan
Assigned Task: TASK-01 or Backend Runtime Squad if available
Status: DISCOVERY / PLAN FIRST
Objective: Define the minimal backend endpoint required to satisfy FE S2 contract.
Backend files to inspect / modify only after approval:
- routes/productRoutes.js
- controllers/productController.js
- any product service if introduced
Required endpoint:
- POST /api/products/pos/create-from-template
Required behavior:
- require auth
- derive branchId from req.user.branchId
- require templateProductId
- validate Template exists in Template Catalog
- prevent duplicate Operational Product for same branch/templateProductId or return existing product explicitly
- create Operational Product only
- persist templateProductId on created Operational Product
- do not create BranchPrice in this endpoint unless Mission Controller explicitly approves
- return mapped Operational Product shape compatible with mapRuntimeProductForPos
Deliverable:
- docs/mission-b/inbox/BE-CONTRACT-001.md or backend implementation + verification report if explicitly approved
```

Do not proceed to BranchPrice or Stock Intake patch until this integration blocker is resolved.
