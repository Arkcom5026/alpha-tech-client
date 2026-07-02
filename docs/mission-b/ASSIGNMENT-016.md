# ASSIGNMENT-016 — Mission B B-04 Backend Create-From-Template Endpoint

Assigned Task: TASK-01 — Runtime / Backend Runtime Squad
Status: APPROVED FOR IMPLEMENTATION
Implementation: APPROVED FOR THIS ASSIGNMENT ONLY

## Mission Context
Mission B is a workflow-completion mission, not a FE/BE split mission.

Current Workflow Checkpoint:
- B-04 Create Operational Product

Current Blocker:
- Backend endpoint missing for FE create/adopt flow

Goal of this assignment:
- Move Mission B from B-04 blocker toward B-05 BranchPrice Ready by implementing the minimum backend endpoint needed for Template → Operational Product creation.

## Read First
- docs/frontend/CERTIFICATION_INDEX.md
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/INTEGRATION-001.md
- docs/mission-b/inbox/BE-CONTRACT-001.md

## Architecture Doctrine
Use Hybrid Migration / Compatibility Before Migration:

- Production runtime remains the source of truth.
- Legacy route/controller can remain the production entry point.
- Reuse new module logic when it is already available and safe.
- Do not force a large migration.
- Do not copy module logic into controller if a stable module function already exists.
- Keep this patch deployable and minimal.

## Files Allowed To Modify
Backend source only:

- routes/productRoutes.js
- controllers/productController.js

Optional only if absolutely required by existing exports/imports and kept minimal:

- existing product module export/index file that exposes already-existing productTemplateEngine/productCloneService logic

No frontend files may be modified.

## Required Endpoint
Add production endpoint:

```txt
POST /api/products/pos/create-from-template
```

Because product routes are mounted at `/api/products`, register route as:

```txt
router.post('/pos/create-from-template', productController.createOperationalProductFromTemplate)
```

Register it with protected POS product routes and before broad POS parameter routes.

## Required Controller
Add/export:

```txt
createOperationalProductFromTemplate
```

## Required Behavior
1. Require auth / existing product route protection.
2. Derive `branchId` from `req.user.branchId`.
3. Require numeric `templateProductId` from body.
4. Validate Template Product exists in Template Catalog / T01.
5. Treat Template Product as source of truth; frontend descriptive fields are optional hints only.
6. Prevent duplicate active Operational Product for the same branch + templateProductId.
7. If duplicate exists, return existing runtime product envelope with `created:false`, `exists:true`.
8. If missing, create Operational Product only.
9. Persist `templateProductId` on created Operational Product.
10. Return runtime product envelope compatible with QuickStockPage adoption.

## Required Successful Response Shape
Created:

```json
{
  "success": true,
  "created": true,
  "exists": false,
  "data": "runtimeProduct",
  "product": "runtimeProduct",
  "templateProductId": 45,
  "branchId": 2
}
```

Already exists:

```json
{
  "success": true,
  "created": false,
  "exists": true,
  "data": "runtimeProduct",
  "product": "runtimeProduct",
  "templateProductId": 45,
  "branchId": 2
}
```

Runtime product should be mapped using the same runtime shape as existing POS runtime lookup, preferably `mapRuntimeProductForPos(product, branchId)`.

## Required Error Cases
Use existing error style where possible:

- 401 `BRANCH_ID_MISSING`
- 400 `TEMPLATE_PRODUCT_ID_MISSING`
- 404 `TEMPLATE_BRANCH_NOT_FOUND`
- 404 `TEMPLATE_PRODUCT_NOT_FOUND`
- 400 `PRODUCT_TYPE_NOT_FOUND_IN_BRANCH`
- 400 `CATEGORY_TYPE_MISMATCH`
- 500 `CREATE_OPERATIONAL_PRODUCT_FROM_TEMPLATE_FAILED`

## Forbidden Changes
- Do not modify frontend files.
- Do not create BranchPrice in this assignment.
- Do not create StockItem / StockBalance.
- Do not modify quick-stock routes.
- Do not change existing stock intake behavior.
- Do not refactor unrelated controller logic.
- Do not migrate whole product controller into modules.
- Do not rewrite productTemplateEngine.
- Do not use generic createProduct response `{ id }` as the final response.

## Verification Required
Create:

```txt
docs/mission-b/inbox/VERIFY-BE-001.md
```

Report must include:
1. Files changed
2. Route registration verification
3. Controller behavior summary
4. Template validation verification
5. Duplicate prevention verification
6. Response envelope verification
7. Confirmation BranchPrice and Stock Intake were not added
8. Remaining Mission B workflow debt

## Completion
Commit code + verification report to Git.
Report back only:

- Commit SHA
- Files changed
- Verification report path
