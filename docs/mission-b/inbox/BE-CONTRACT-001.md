# BE-CONTRACT-001 — Backend Create-From-Template Contract

Mission: Mission B
Assignment: ASSIGNMENT-015
Task: TASK-01 Backend Runtime Squad
Role: ROLE-RUNTIME / Backend Runtime Discovery
Status: DISCOVERY ONLY
Implementation: NOT APPROVED

## 1. Route design

Required route:

```txt
POST /api/products/pos/create-from-template
```

Backend mount evidence:

```txt
server.js
app.use('/api/products', productRoutes)
```

Therefore the route should be registered in:

```txt
routes/productRoutes.js
```

Recommended placement:

```txt
router.use(verifyToken)

router.get('/dropdowns', productController.getProductDropdowns)

router.get('/pos/search', productController.getProductsForPos)
router.get('/pos/runtime-by-template/:templateProductId', productController.getOperationalProductByTemplateId)
router.post('/pos/create-from-template', productController.createOperationalProductFromTemplate)
router.get('/pos/:id', productController.getProductPosById)
```

Important route ordering rule:

```txt
POST /pos/create-from-template must be declared before any broad parameter route that could swallow it.
```

`router.get('/pos/:id')` will not swallow POST, but keeping all POS runtime routes together before broad routes is the preferred pattern.

## 2. Controller design

Controller owner:

```txt
controllers/productController.js
```

Recommended exported function:

```txt
createOperationalProductFromTemplate
```

Reason:

- Existing product POS runtime owner is already `productController`.
- Existing related lookup endpoint is already `productController.getOperationalProductByTemplateId`.
- Existing runtime mapper `mapRuntimeProductForPos` is inside `productController.js`.
- Existing generic create helper logic is inside `productController.js`.

Controller responsibilities:

```txt
1. Require branch context from req.user.branchId.
2. Validate request body.templateProductId.
3. Load and validate Template Product from Template Catalog / T01 branch.
4. Prevent duplicate Operational Product for current branch + templateProductId.
5. Create Operational Product only.
6. Persist templateProductId on created Operational Product.
7. Return runtime mapped Operational Product compatible with QuickStockPage adoption.
8. Do not create BranchPrice in this first backend patch.
9. Do not create StockItem / StockBalance as stock intake behavior.
```

## 3. Service design

Preferred first backend patch:

```txt
Add controller method in productController.js first, reusing existing helpers directly.
```

Reason:

- Mission requires minimal backend patch first.
- Current product domain does not yet have a dedicated operational-product service.
- Template Search already has a module service/repository, but create operational product currently lives in controller-level product runtime.

Optional later refactor:

```txt
src/modules/product/services/operationalProductOnboardingService.js
```

But this should not be introduced in Backend Patch 1 unless Mission Controller explicitly approves service extraction.

Recommended reuse:

```txt
ProductTemplateRepository.findTemplateBranchByCode('T01')
ProductTemplateRepository / TemplateProductSearchService pattern for Template Catalog ownership
assertOperationalTypeAndCategory
assertTypeAndCategory if validating Template-side type/category only
decideMode
autoLearnProductTypeBrand
mapRuntimeProductForPos
```

Recommended new local helper inside productController for Backend Patch 1:

```txt
selectRuntimeProductForMapping(productId, branchId)
```

Purpose:

- Fetch newly created product using the same selected fields used by `getOperationalProductByTemplateId`.
- Pass result into `mapRuntimeProductForPos(product, branchId)`.

## 4. Request contract

Frontend already sends:

```txt
templateProductId: number
sourceCatalog: 'TEMPLATE'
name?: string
productTypeId?: number
brandId?: number
unitId?: number | null
mode?: string
trackSerialNumber?: boolean
categoryId?: number
codeType?: string
warrantyDays?: number
productConfig?: object
active?: boolean
```

Backend should require:

```txt
templateProductId
```

Backend should derive:

```txt
branchId = Number(req.user?.branchId)
```

Backend should not require frontend `branchId`.

Backend should treat frontend descriptive fields as optional hints only. Source of truth should be Template Product loaded from Template Catalog.

Forbidden request fields in this endpoint:

```txt
branchId
productId
branchPrice
stock
barcodes
items
quantity
movementType
source
```

BranchPrice fields must be ignored/rejected in Backend Patch 1 unless Mission Controller explicitly changes scope.

## 5. Response contract

Required successful response envelope:

```txt
HTTP 201 Created
{
  success: true,
  created: true,
  exists: false,
  data: runtimeProduct,
  product: runtimeProduct,
  templateProductId,
  branchId
}
```

If duplicate already exists, recommended response:

```txt
HTTP 200 OK
{
  success: true,
  created: false,
  exists: true,
  data: runtimeProduct,
  product: runtimeProduct,
  templateProductId,
  branchId
}
```

Reason:

- QuickStockPage can already extract `{ data }`, `{ product }`, or direct product.
- Existing `getOperationalProductByTemplateId` already returns `success`, `exists`, `data`, `product`, `templateProductId`, and `branchId`.
- Returning an existing duplicate product is safer and idempotent for user-triggered create/adopt.

Required runtime product fields:

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
categoryId
categoryName
category
productTypeId
productTypeName
productType
brandId
brandName
unitId
unitName
unit
costPrice
priceRetail
priceWholesale
priceTechnician
priceOnline
branchPriceActive
hasPrice
available
stockBalance
branchPrice
```

Recommended source:

```txt
mapRuntimeProductForPos(product, branchId)
```

## 6. Validation flow

Recommended controller flow:

```txt
createOperationalProductFromTemplate(req, res)
  ↓
branchId = Number(req.user?.branchId)
  - if missing: 401 BRANCH_ID_MISSING
  ↓
templateProductId = toInt(req.body.templateProductId)
  - if missing: 400 TEMPLATE_PRODUCT_ID_MISSING
  ↓
load Template Branch T01
  - if missing: 404 TEMPLATE_BRANCH_NOT_FOUND
  ↓
load Template Product where:
  id = templateProductId
  active = true
  productType.branchId = templateBranch.id
  include productType.globalProductType, brand, unit
  - if not found: 404 TEMPLATE_PRODUCT_NOT_FOUND
  ↓
check duplicate Operational Product where:
  templateProductId = templateProductId
  productType.branchId = branchId
  active = true
  - if found: return 200 exists:true with mapRuntimeProductForPos
  ↓
resolve branch ProductType
  Preferred: find ProductType in current branch matching Template productType.globalProductTypeId
  Fallback only if certified: req.body.productTypeId validated by assertOperationalTypeAndCategory
  - if missing: 400 PRODUCT_TYPE_NOT_FOUND_IN_BRANCH
  ↓
validate category through assertOperationalTypeAndCategory
  ↓
create Product:
  name from Template Product
  mode/noSN/trackSerialNumber from Template Product or decideMode fallback
  active true unless explicit false is allowed
  productTypeId branch-scoped ProductType id
  categoryId derived category id
  brandId copied from Template only if brand is global/shared and valid
  unitId copied from Template if valid
  templateProductId = Template Product id
  ↓
autoLearnProductTypeBrand for branch ProductType + brand
  ↓
re-fetch created Product with runtime select
  ↓
return 201 with mapRuntimeProductForPos
```

## 7. templateProductId validation

Template identity validation should not trust frontend fields other than `templateProductId`.

Template source of truth:

```txt
Template Branch T01
```

Existing reusable evidence:

```txt
DEFAULT_TEMPLATE_BRANCH_CODE = 'T01'
ProductTemplateRepository.findTemplateBranchByCode(branchCode)
TemplateProductSearchService.searchTemplateProducts()
```

Minimum validation query:

```txt
const template = await prisma.product.findFirst({
  where: {
    id: templateProductId,
    active: true,
    productType: {
      branchId: templateBranch.id,
    },
  },
  select: {
    id: true,
    name: true,
    active: true,
    mode: true,
    noSN: true,
    trackSerialNumber: true,
    categoryId: true,
    productTypeId: true,
    productType: {
      select: {
        id: true,
        name: true,
        branchId: true,
        globalProductTypeId: true,
        globalProductType: { select: { categoryId: true } },
      },
    },
    brandId: true,
    unitId: true,
    productConfig: true,
    codeType: true,
    warrantyDays: true,
  },
})
```

Template validation must reject:

```txt
missing templateProductId
non-numeric templateProductId
inactive Template Product
product not under Template Branch T01
```

## 8. Duplicate prevention

Duplicate rule:

```txt
At most one active Operational Product per branch per templateProductId.
```

Recommended lookup before create:

```txt
const existing = await prisma.product.findFirst({
  where: {
    active: true,
    templateProductId,
    productType: { branchId },
  },
  select: runtimeProductSelect,
  orderBy: { id: 'desc' },
})
```

If found:

```txt
return 200 success:true exists:true created:false data/product: mapRuntimeProductForPos(existing, branchId)
```

Do not create a second Operational Product for the same branch/template pair.

Recommended later hardening:

```txt
Unique index or application-level transaction guard for active branch + templateProductId.
```

Because product branch is indirect through productType.branchId, a DB-level unique constraint may require schema planning. Backend Patch 1 can start with transaction-level lookup guard.

## 9. Reusable code

Safe to reuse:

```txt
const toInt
const normStr
const decideMode
const assertOperationalTypeAndCategory
const autoLearnProductTypeBrand
const mapRuntimeProductForPos
ProductTemplateRepository.findTemplateBranchByCode
Template Search repository select pattern
```

Conditionally reusable:

```txt
pickBranchPricePayload
```

Do not use it in Backend Patch 1 because BranchPrice creation is explicitly out of scope.

Reusable pattern from `getOperationalProductByTemplateId`:

```txt
branchId from req.user.branchId
TEMPLATE_PRODUCT_ID_MISSING validation
find operational product by templateProductId + branchId
return mapped product envelope
```

Reusable pattern from `createProduct`:

```txt
branchId from req.user.branchId
name validation shape
mode/noSN/trackSerialNumber via decideMode
assertOperationalTypeAndCategory
prisma.product.create
runtime branch ownership through productTypeId
```

## 10. Logic that must not be reused directly

Do not call generic `createProduct` directly for create-from-template.

Reasons:

```txt
1. It does not persist templateProductId in current inspected implementation.
2. It returns only { id }, not runtime product shape.
3. It allows BranchPrice creation when BranchPrice payload is present.
4. It uses request body as create source instead of Template Product as source of truth.
5. It does not prevent duplicate Operational Product for branch/templateProductId.
```

Do not reuse quickStock all-in-one:

```txt
quick-stock/all-in-one is not certified as Template → Operational Product creation.
```

Do not create StockItem / StockBalance as inventory intake:

```txt
Stock Intake must remain owned by quick-stock/existing after Operational Product exists.
```

Do not create BranchPrice in Backend Patch 1:

```txt
BranchPrice first creation remains a later certified step.
```

## 11. New code required

Backend Patch 1 should add only:

### routes/productRoutes.js

```txt
router.post('/pos/create-from-template', productController.createOperationalProductFromTemplate)
```

### controllers/productController.js

```txt
const createOperationalProductFromTemplate = async (req, res) => { ... }
```

Add to module exports:

```txt
createOperationalProductFromTemplate
```

Recommended helper additions inside same file if needed:

```txt
const runtimeProductSelect = (branchId) => ({ ... })
const findRuntimeProductByIdForPos = async (db, productId, branchId) => { ... }
const findBranchProductTypeForTemplate = async (db, templateProductType, branchId) => { ... }
```

Keep these local to controller for first minimal patch unless service extraction is approved.

## 12. Recommended first backend implementation patch

Recommended assignment:

```txt
ASSIGNMENT-016 — BE Patch 1 Create-From-Template Endpoint
Status: APPROVED FOR IMPLEMENTATION only if Mission Controller explicitly approves
Scope: Backend only
Files allowed:
- routes/productRoutes.js
- controllers/productController.js
Forbidden:
- frontend changes
- BranchPrice creation
- Stock Intake changes
- quick-stock route changes
- productApi/productStore/QuickStockPage changes
Goal:
- Implement POST /api/products/pos/create-from-template
- Derive branch from req.user.branchId
- Validate templateProductId against T01 Template Catalog
- Prevent duplicate branch Operational Product
- Create Operational Product with templateProductId persisted
- Return runtime product envelope compatible with QuickStockPage adoption
Deliverable:
- code commit
- docs/mission-b/inbox/VERIFY-BE-001.md
```

Recommended implementation response examples:

### Created

```json
{
  "success": true,
  "created": true,
  "exists": false,
  "data": { "id": 123, "isTemplateProduct": false, "isOperationalProduct": true },
  "product": { "id": 123, "isTemplateProduct": false, "isOperationalProduct": true },
  "templateProductId": 45,
  "branchId": 2
}
```

### Already exists

```json
{
  "success": true,
  "created": false,
  "exists": true,
  "data": { "id": 123, "isTemplateProduct": false, "isOperationalProduct": true },
  "product": { "id": 123, "isTemplateProduct": false, "isOperationalProduct": true },
  "templateProductId": 45,
  "branchId": 2
}
```

### Errors

```txt
401 BRANCH_ID_MISSING
400 TEMPLATE_PRODUCT_ID_MISSING
404 TEMPLATE_BRANCH_NOT_FOUND
404 TEMPLATE_PRODUCT_NOT_FOUND
400 PRODUCT_TYPE_NOT_FOUND_IN_BRANCH
400 CATEGORY_TYPE_MISMATCH
500 CREATE_OPERATIONAL_PRODUCT_FROM_TEMPLATE_FAILED
```

## 13. Certification result

Backend architecture contract is now clear enough to start Backend Patch 1 after Mission Controller approval.

Current status:

```txt
Ready for ASSIGNMENT-016 planning/implementation approval.
```

Do not proceed to BranchPrice or Stock Intake until Backend Patch 1 is implemented and verified.
