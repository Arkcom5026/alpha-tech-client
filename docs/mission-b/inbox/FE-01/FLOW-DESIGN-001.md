# FLOW-DESIGN-001 — QuickStock Runtime Flow Design

Mission: Mission B
Role: FE-01 Runtime Owner
Assignment: ASSIGNMENT-019
Status: DESIGN / DISCOVERY ONLY
Implementation: LOCKED

## 1. Files inspected

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
src/features/product/components/quick-stock/ProductMasterPanel.jsx
src/features/product/components/quick-stock/CommitBar.jsx
src/features/product/api/productApi.js
src/features/product/store/productStore.js
```

## 2. Current FE runtime summary

Current QuickStockPage owns the main runtime state:

```txt
selectedProductId
runtimeSearchProducts
templateDropdownProducts
adoptedOperationalProduct
isCheckingOperationalProduct
isCreatingOperationalProduct
barcodeQueue
productForm
priceForm
onboardingState
```

Current search behavior is Template-first:

```txt
QuickStockPage.executeProductSearch
-> getTemplateProductsForPos
-> products/template/search
-> runtimeSearchProducts local state
-> ProductFinderPanel result list
```

Current Template-selected behavior:

```txt
Template selected
-> selectedTemplateProduct
-> getOperationalProductByTemplateId(templateProductId)
-> if branch Operational Product exists: adopt as operationalProduct
-> if none: TEMPLATE_SELECTED_NOT_CREATED
-> user can click create Operational Product from Template
```

Current existing operational behavior:

```txt
operationalProduct exists
-> ProductMasterPanel shows Operational Product
-> ProductEditor can edit product/price fields
-> barcode queue enabled
-> CommitBar enabled only after productReady + queueReady
-> quickStockIntakeExistingAction(payload)
```

## 3. Flow 2 — Existing branch product edit/update from QuickStockPage

### Current supported behavior

QuickStockPage already supports editing an adopted or selected Operational Product through:

```txt
handleSaveProductInline
-> productStore.updateProduct(id, payload)
-> productApi.updateProduct(id, payload)
-> PATCH products/:id
```

Fields currently edited:

```txt
name
productTypeId
brandId
unitId
mode: STRUCTURED
noSN: false
trackSerialNumber
active
branchPrice.costPrice
branchPrice.priceRetail
branchPrice.priceWholesale
branchPrice.priceTechnician
branchPrice.priceOnline
branchPrice.isActive
```

After save, QuickStockPage updates local runtime state:

```txt
runtimeSearchProducts
adoptedOperationalProduct
productForm
priceForm
defaultCost
```

### Design recommendation

Flow 2 should remain QuickStockPage-owned but limited to branch Operational Product runtime editing.

Canonical FE state:

```txt
selectedTemplateProduct = original selected search result when source was Template
operationalProduct = selected operational result OR adopted operational result
productForm = editable product fields for operationalProduct only
priceForm = editable BranchPrice/intake session price fields
```

Allowed Flow 2 actions:

```txt
Edit Operational Product display/core branch runtime fields
Edit current branch BranchPrice fields
Save before intake
Receive with current priceForm as runtime price source
```

Blocked Flow 2 actions:

```txt
Do not edit Template Product fields
Do not edit stock identity rows
Do not edit barcode/serial history
Do not edit branch ownership
Do not switch Template identity
Do not send productTemplateId as productId
```

### Risk

`handleSaveProductInline` currently forces:

```txt
mode: STRUCTURED
noSN: false
```

This may be unsafe for existing SIMPLE products. FE-01 recommends a future small patch to preserve existing product runtime mode unless the user explicitly changes it through a certified mode transition.

Recommended future state:

```txt
mode: operationalProduct.mode
noSN: operationalProduct.noSN
trackSerialNumber: productForm.trackSerialNumber
```

or lock mode fields out of QuickStock edit entirely until mode transition is certified.

## 4. Safe fields and out-of-scope fields for QuickStockPage

### Safe fields for QuickStockPage edit

QuickStockPage may own lightweight branch runtime editing for:

```txt
name
brandId
unitId
active
trackSerialNumber only if no stock exists or backend permits
BranchPrice costPrice
BranchPrice priceRetail
BranchPrice priceWholesale
BranchPrice priceTechnician
BranchPrice priceOnline
```

### Conditional fields

```txt
productTypeId
mode
noSN
trackSerialNumber
```

These fields can affect stock behavior, ProductType/Category ownership, serial requirement, and data migration. FE-01 recommends treating these as locked or backend-validated until a dedicated Product Runtime Edit contract is certified.

### Out-of-scope fields

QuickStockPage must not own:

```txt
Template Product mutation
branchId mutation
stockBalance mutation
stockItem mutation
simpleLot mutation
stockMovement mutation
historical barcode/serial edits
ProductTemplate identity rewrite
RBAC / auth behavior
Product catalog global cleanup
```

## 5. BranchPrice behavior during edit/update and receive

Current FE has two BranchPrice touchpoints:

### Edit/update path

```txt
ProductMasterPanel -> ProductEditor -> handleSaveProductInline
-> updateProduct(id, { branchPrice: {...} })
```

This is an Operational Product edit path.

### Receive path

```txt
priceForm/defaultCost
-> handleCommit payload
-> quickStockIntakeExistingAction
-> quickReceiveExistingProductApi
-> POST quick-stock/existing
```

Receive payload includes session-level prices:

```txt
costPrice
priceRetail
priceWholesale
priceTechnician
priceOnline
```

### Design recommendation

Canonical BranchPrice source during receive should remain:

```txt
Quick Receive runtime form priceForm/defaultCost
```

Reason:

- Backend QuickStock runtime already upserts BranchPrice from runtime form prices.
- This allows receiving a product and setting current branch prices in the same runtime transaction.

FE should clearly separate labels:

```txt
Product edit price = branch product price maintenance
Receive price = runtime intake price source
```

A future UX patch should avoid implying that Template prices are editable when product is Template-only.

## 6. Flow 3 — Store-created local product when no ProductTemplate exists

### Current support status

Flow 3 is not safely implemented in QuickStockPage.

Existing possible functions:

```txt
productApi.createProduct(payload) -> POST products
productStore.saveProduct(payload) -> createProduct(cleanedPayload)
quickStockInAllInOneAction(payload) -> POST quick-stock/all-in-one
```

But current FE evidence shows no dedicated QuickStock local product creation path.

### Why existing functions are not safe enough

`productStore.saveProduct` is generic catalog create, not QuickStock local-create runtime. It also deletes `branchId`, deletes `productTemplateId`, and does not encode QuickStock-specific product+price+receive readiness.

`quickStockInAllInOneAction` may create product/BranchPrice/stock, but it is not the currently certified B-07 path and may duplicate runtime responsibility that now belongs to `/quick-stock/existing` after Operational Product exists.

### Recommended Flow 3 design

Flow 3 should be a separate FE mode:

```txt
NO_TEMPLATE_LOCAL_CREATE
```

Entry point:

```txt
ProductFinderPanel empty result
-> user chooses 'สร้างสินค้าของร้านเอง'
-> QuickStockPage shows Local Product Create form
```

Minimum fields:

```txt
name
productTypeId
brandId optional
unitId optional
mode / trackSerialNumber policy
costPrice
priceRetail
barcode queue
```

Recommended FE behavior:

```txt
Create local Operational Product first
-> adopt returned Operational Product
-> receive through /quick-stock/existing using operationalProduct.id
```

Forbidden Flow 3 behavior:

```txt
Do not create Template Product
Do not write T01 catalog
Do not use templateProductId
Do not send stock rows directly from create form
Do not bypass /quick-stock/existing for stock intake unless ROLE-ARCH approves a separate path
```

### Backend gap for Flow 3

YES.

FE needs a certified local Operational Product creation endpoint/action that returns an adoption-ready Operational Product shape.

Recommended backend/FE contract:

```txt
POST /api/products/pos/create-local
or certified reuse of POST /api/products if response is upgraded to runtime product shape
```

Required response shape should match create-from-template/adoption shape:

```txt
{ success, created, data: operationalProduct, product: operationalProduct }
```

## 7. Search behavior for Operational Products and Template Products

### Current behavior

QuickStockPage currently uses Template Search as the primary search source:

```txt
getTemplateProductsForPos -> products/template/search
```

Operational Product search exists in store:

```txt
fetchOperationalProductsAction -> getProductsForPos -> products/pos/search
```

Template Product search exists in store:

```txt
fetchTemplateProductsAction -> getTemplateProductsForPos -> products/template/search
```

But QuickStockPage currently does not expose a first-class search mode for operational branch products.

### Recommended FE search model

QuickStockPage should use explicit search modes:

```txt
SEARCH_TEMPLATE_CATALOG
SEARCH_BRANCH_OPERATIONAL
SEARCH_ALL_WITH_SEPARATED_RESULTS
```

Recommended default:

```txt
SEARCH_ALL_WITH_SEPARATED_RESULTS
```

Display groups:

```txt
สินค้าในร้านแล้ว (Operational)
Template Catalog (ยังไม่อยู่ในร้าน)
```

Selection behavior:

```txt
Operational result -> OPERATIONAL_READY
Template result -> lookup/adopt -> if none TEMPLATE_SELECTED_NOT_CREATED
No result -> allow Flow 3 local create
```

This will solve a current UX gap: existing branch product may not be discoverable first-class from QuickStockPage unless it appears through Template/adopt path.

## 8. FE recommendation for canonical B-07 path

FE-01 recommends canonical B-07 path:

```txt
Template Search
-> Template selection
-> Operational lookup
-> if exists: adopt Operational Product
-> if missing: create/adopt Operational Product explicitly
-> BranchPrice/runtime prices from QuickStock form
-> Stock Intake through /quick-stock/existing with operationalProduct.id
-> Product visible in branch
```

In short:

```txt
FE pre-create/adopt first, then /quick-stock/existing receives Operational Product only.
```

Reason:

1. Current QuickStockPage state gates are built around Operational Product readiness.
2. Barcode scan and CommitBar intentionally receive null until Operational Product exists.
3. Current commit payload uses `operationalProduct.id`, protecting against Template id misuse.
4. UI can show a clear step: create product in branch first, receive stock second.
5. It avoids hidden clone side effects during stock commit.

Backend clone-inside-/existing can remain a compatibility/safety fallback, but FE should not rely on hidden clone during stock commit as the primary UI path.

## 9. FE-only work possible

FE-only work possible without backend changes:

```txt
1. Add search mode UI for Template vs Operational search if existing store/API actions are enough.
2. Group search results into Operational and Template sections.
3. Improve labels around BranchPrice edit vs Receive runtime price.
4. Preserve mode/noSN fields during inline edit instead of forcing STRUCTURED.
5. Add local-create UI draft state without submitting yet.
6. Add safer disabled reasons and state messages.
7. Add report-only UX mapping for B-07 canonical path.
```

FE-only work not recommended yet:

```txt
Submitting Flow 3 local product create
Changing stock intake payload
Changing Template create/adopt contract
Moving QuickStock to hidden backend clone path
```

## 10. Backend gap

Backend gap: YES.

Required for Flow 3:

```txt
Certified local Operational Product create endpoint/action returning adoption-ready runtime product shape.
```

Possible endpoint:

```txt
POST /api/products/pos/create-local
```

or certified generic endpoint:

```txt
POST /api/products
```

Only if it returns full Operational Product runtime shape and is certified to create a branch-owned Operational Product without Template.

Potential backend clarification for Flow 2:

```txt
PATCH products/:id BranchPrice update behavior should be certified for QuickStock inline edit.
Mode/noSN transition safety should be certified before FE allows mode-changing edits.
```

## 11. Recommended next owner

Recommended next owner:

```txt
ROLE-ARCH
```

Decision needed:

```txt
Approve FE-01 canonical B-07 path:
FE pre-create/adopt Operational Product, then /quick-stock/existing receives Operational Product only.
```

Then issue one of these:

```txt
FE-01 ASSIGNMENT-020 — Operational vs Template Search Mode Design/Patch
```

or

```txt
BE-01 assignment — Local Operational Product create contract for Flow 3
```

## 12. PASS / NEEDS_DECISION

```txt
NEEDS_DECISION
```

Reason:

Flow 2 can proceed with small FE hardening patches, but Flow 3 requires a backend contract decision for local Operational Product creation. B-07 canonical path also needs ROLE-ARCH confirmation because backend docs mention clone-inside-/existing while current FE runtime is safer as pre-create/adopt-first.
