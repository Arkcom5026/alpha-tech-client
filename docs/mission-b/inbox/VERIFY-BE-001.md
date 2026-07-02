# VERIFY-BE-001 — Backend Create-From-Template Endpoint

Mission: Mission B
Assignment: ASSIGNMENT-016
Task: TASK-01 Runtime / Backend Runtime Squad
Status: Verification Report

## 1. Files changed

Backend source:

- `routes/productRoutes.js`

Verification report:

- `docs/mission-b/inbox/VERIFY-BE-001.md`

No frontend files were modified.

## 2. Route registration verification

Added production endpoint under protected product routes:

```txt
POST /api/products/pos/create-from-template
```

Registered as:

```txt
router.post('/pos/create-from-template', createOperationalProductFromTemplate)
```

The route is registered after:

```txt
router.use(verifyToken)
```

and before the broad POS route:

```txt
router.get('/pos/:id', productController.getProductPosById)
```

## 3. Controller behavior summary

Implemented a minimal backend runtime handler for B-04 create/adopt flow.

Runtime behavior:

```txt
POST /api/products/pos/create-from-template
  -> require req.user.branchId
  -> require body.templateProductId
  -> validate Template Branch T01
  -> validate active Template Product under T01
  -> check existing active Operational Product for current branch + templateProductId
  -> if exists, return runtime envelope with created:false / exists:true
  -> if missing, create Operational Product only
  -> persist templateProductId
  -> return runtime envelope compatible with QuickStockPage adoption
```

Implementation note:

- The endpoint handler is implemented route-local in `routes/productRoutes.js` to keep the patch deployable and minimal under the available patch constraints.
- `controllers/productController.js` was not modified in this commit.
- A later cleanup patch may move the handler into `productController.createOperationalProductFromTemplate` if Mission Controller wants strict controller ownership.

## 4. Template validation verification

Validated in route handler:

```txt
branchId = Number(req.user?.branchId)
templateProductId = Number.parseInt(req.body.templateProductId, 10)
Template Branch lookup: branchCode = T01
Template Product lookup: id = templateProductId, active = true, productType.branchId = T01 branch id
```

Error cases implemented:

```txt
401 BRANCH_ID_MISSING
400 TEMPLATE_PRODUCT_ID_MISSING
404 TEMPLATE_BRANCH_NOT_FOUND
404 TEMPLATE_PRODUCT_NOT_FOUND
400 PRODUCT_TYPE_NOT_FOUND_IN_BRANCH
500 CREATE_OPERATIONAL_PRODUCT_FROM_TEMPLATE_FAILED
```

## 5. Duplicate prevention verification

Before creation, the handler checks for an existing active Operational Product:

```txt
where: {
  active: true,
  templateProductId,
  productType: { branchId }
}
```

If found, it returns:

```txt
HTTP 200
success: true
created: false
exists: true
data: runtimeProduct
product: runtimeProduct
templateProductId
branchId
```

No second Operational Product is created for the same active branch/template pair in the normal flow.

## 6. Response envelope verification

Created response:

```txt
HTTP 201
success: true
created: true
exists: false
data: runtimeProduct
product: runtimeProduct
templateProductId
branchId
```

Already exists response:

```txt
HTTP 200
success: true
created: false
exists: true
data: runtimeProduct
product: runtimeProduct
templateProductId
branchId
```

Runtime product includes adoption-critical fields:

```txt
id
name
mode
noSN
trackSerialNumber
templateProductId
isTemplateProduct: false
isOperationalProduct: true
productTypeId
productTypeName
brandId
brandName
unitId
unitName
branchPrice: []
hasPrice: false
stockBalance: null
available: 0
```

This is compatible with QuickStockPage adoption because the frontend validates a finite `id`, rejects template-like product objects, and accepts `data` or `product` envelope shapes.

## 7. BranchPrice and Stock Intake confirmation

BranchPrice was not created in this patch.

StockItem / StockBalance / Stock Intake behavior was not added or modified in this patch.

The endpoint creates only Operational Product and returns an adoption-ready runtime product envelope.

## 8. Remaining Mission B workflow debt

Remaining after this patch:

```txt
B-05 BranchPrice Ready
B-06 Stock Intake continuation after Operational Product exists
B-07 Template missing -> branch-specific Operational Product creation
```

Additional technical debt:

```txt
Move route-local handler into productController if strict controller ownership is required.
Add automated integration test for POST /api/products/pos/create-from-template.
Add transaction-level race hardening or unique constraint planning for active branch/template duplicate prevention.
```

## 9. Verification result

B-04 endpoint blocker is removed at backend route level.

Current Mission B status:

```txt
Ready for runtime testing of Template -> Operational Product create/adopt.
Do not proceed to BranchPrice or Stock Intake until this endpoint is tested against FE QuickStockPage.
```
