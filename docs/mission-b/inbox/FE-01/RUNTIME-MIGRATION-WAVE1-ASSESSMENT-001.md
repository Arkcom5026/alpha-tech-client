# RUNTIME-MIGRATION-WAVE1-ASSESSMENT-001 — Product Create Runtime Migration

Mission: Mission B Runtime Migration
Controller: User
Execution Owner: AI-assisted FE/BE runtime execution
Doctrine: docs/blueprint/P1-RUNTIME-MIGRATION-DOCTRINE.md
Status: READY_FOR_PATCH_SEQUENCE

## 1. Doctrine alignment

Wave 1 must follow the P1 Runtime Migration Doctrine:

```txt
Do not rewrite proven workflows from zero.
Preserve existing user workflow first.
Improve responsibility separation underneath stable behavior.
Use small safe migrations.
Move one workflow at a time.
Remove legacy only after runtime parity is confirmed.
```

## 2. User-provided target

Wave 1 target:

```txt
STEP B-04.1 — Product Create Runtime Migration
```

Expected direction:

```txt
Inspect existing Product Create Flow.
Move backend into module structure.
Keep frontend workflow stable.
Start splitting ProductForm by responsibility.
Connect to Runtime API without changing user behavior.
```

## 3. Current frontend findings

### Product Create entry

Current entry point:

```txt
src/features/product/pages/CreateProductPage.jsx
```

Current behavior:

```txt
CreateProductPage keeps existing user workflow.
It loads branch context from useBranchStore.
It loads dropdowns through productStore.
It renders ProductImage and ProductForm.
It builds payload with branchId.
It calls saveProduct(payload).
It uploads images after product creation if created.id exists.
```

Current risk:

```txt
saveProduct still maps to legacy createProduct -> POST /products.
```

### Product Form

Current form:

```txt
src/features/product/components/ProductForm.jsx
```

Current behavior:

```txt
ProductForm already contains multiple responsibilities:
- dropdown loading / auth readiness
- brand mapping helpers
- create/edit default preparation
- product identity fields
- stock behavior fields
- branchPrice fields
- submit payload normalization
- UI rendering
```

Migration interpretation:

```txt
Do not rewrite ProductForm.
Split it gradually by responsibility only after runtime create contract is stable.
```

## 4. Current backend findings

Backend repo:

```txt
Arkcom5026/alpha-tech-server
```

Current product route:

```txt
routes/productRoutes.js
```

Runtime-local create already exists as route-level implementation:

```txt
POST /products/pos/create-local
```

It already:

```txt
uses req.user.branchId
rejects body branchId
rejects templateProductId
rejects stock queue fields
creates Product
upserts BranchPrice
returns mapped Operational Runtime Product
```

Legacy create remains:

```txt
POST /products -> productController.createProduct
```

Backend module precedent exists:

```txt
src/modules/productTemplate/controllers/productTemplateController.js
src/modules/productTemplate/services/productTemplateService.js
src/modules/productTemplate/repositories/productTemplateRepository.js
```

Migration interpretation:

```txt
The next backend migration should extract Product Create Runtime from route-level functions into a product runtime module, without changing external endpoint behavior.
```

## 5. Root assessment

Product Create Runtime Migration is not primarily a UX rebuild.

It is a runtime ownership migration:

```txt
Current create surface:
CreateProductPage -> productStore.saveProduct -> productApi.createProduct -> POST /products -> legacy controller

Target create surface:
CreateProductPage -> productStore.createLocalOperationalProductAction OR dedicated createOperationalProductAction -> productApi.createLocalOperationalProductApi -> POST /products/pos/create-local -> runtime module service
```

Important distinction:

```txt
QuickStock local create already uses createLocalOperationalProductAction.
Normal Product Create page still uses saveProduct / legacy POST /products.
```

Therefore Product Create is not fully migrated until normal CreateProductPage uses Operational Runtime Create contract.

## 6. Recommended patch sequence

### Patch 1 — Backend runtime module extraction

Owner:

```txt
BE
```

Files expected:

```txt
alpha-tech-server/src/modules/productRuntime/services/productRuntimeCreateService.js
alpha-tech-server/src/modules/productRuntime/controllers/productRuntimeController.js
alpha-tech-server/src/modules/productRuntime/repositories/productRuntimeRepository.js (optional if service remains small)
alpha-tech-server/routes/productRoutes.js
```

Goal:

```txt
Move createLocalOperationalProduct and createOperationalProductFromTemplate out of routes/productRoutes.js into productRuntime module.
Keep endpoints unchanged.
Keep response shape unchanged.
Keep branchId resolved from token.
```

Regression checks:

```txt
POST /products/pos/create-local still works.
POST /products/pos/create-from-template still works.
GET /products/pos/runtime-by-template/:templateProductId still works.
Receive Flow remains unchanged.
```

### Patch 2 — Frontend Product Create runtime API switch

Owner:

```txt
FE
```

Files expected:

```txt
src/features/product/pages/CreateProductPage.jsx
src/features/product/store/productStore.js
```

Goal:

```txt
Make normal Product Create call the runtime local Operational Product action instead of legacy saveProduct.
Preserve same page, same route, same ProductForm, same ProductImage position.
Keep user behavior stable.
```

Preferred implementation:

```txt
CreateProductPage -> createLocalOperationalProductAction(payload)
```

Do not change:

```txt
ProductForm UI
ProductImage UI
Route path
Dropdown behavior
Receive Flow
Template Catalog
Candidate/Promotion
```

### Patch 3 — ProductForm responsibility split, first safe extraction

Owner:

```txt
FE
```

Start after Patch 2 passes.

Extract only low-risk presentational sections first:

```txt
ProductBasicInfoSection
ProductStockBehaviorSection
ProductPriceSection
ProductSubmitBar
```

Keep:

```txt
react-hook-form context in ProductForm
submit payload normalization in ProductForm initially
brand helper logic in ProductForm initially
```

Do not move logic until UI sections are stable.

### Patch 4 — Image flow confirmation

Owner:

```txt
FE/BE as needed
```

Goal:

```txt
Confirm uploadImages(created.id, ...) still receives operational product id after runtime create.
```

Patch only if broken.

## 7. What should not be done now

```txt
Do not rewrite CreateProductPage.
Do not replace ProductForm wholesale.
Do not remove legacy POST /products yet.
Do not remove productController.createProduct yet.
Do not introduce Candidate or Template promotion.
Do not change QuickStock receive flow.
Do not change Product Discovery.
```

## 8. Architecture decision needs

```txt
No new architecture decision is required before Patch 1.
```

Reason:

```txt
Doctrine already defines migration direction.
Mission B boundary already defines branch-created product as Operational Runtime.
Existing runtime-local endpoint already validates the target behavior.
```

Decision point may appear later:

```txt
Whether to keep POST /products as legacy admin/global create or make it delegate to runtime create for POS only.
```

This should not block Patch 1 or Patch 2.

## 9. Recommended immediate next action

```txt
Start Patch 1: Backend productRuntime module extraction.
```

Why first:

```txt
It improves architecture underneath existing behavior.
It preserves endpoint contracts.
It reduces route-level business logic before frontend switches normal Product Create to runtime create.
It aligns with Backend Migration Rule in Doctrine.
```

## 10. Status

```txt
READY_FOR_PATCH_SEQUENCE
```

Next owner:

```txt
AI-assisted BE runtime execution, then FE runtime execution.
```
