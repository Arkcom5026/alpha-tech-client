# CONTRACT-001 — S2 Create Wrapper Contract Discovery

Mission: Mission B
Assignment: ASSIGNMENT-010
Task: TASK-01 Runtime Analysis Squad
Role: ROLE-RUNTIME
Status: DISCOVERY ONLY
Implementation: NOT APPROVED

## 1. Existing wrapper assessment

### productApi.createProduct(payload)

Assessment:

```txt
Transport-capable but not semantically safe enough as the named S2 wrapper.
```

Evidence:

- `createProduct(payload)` directly posts payload to `POST products`.
- It does not delete `templateProductId`.
- It also does not encode any Template to Operational Product contract.
- It does not validate that the response is an Operational Product.

Decision:

`createProduct(payload)` can technically send `templateProductId` if called directly with a certified payload, but it should not be the public S2 onboarding contract. A dedicated wrapper should be added so the Product Onboarding path is explicit and auditable.

### productStore.saveProduct(payload)

Assessment:

```txt
Not safe for S2 Template to Operational Product creation.
```

Evidence:

- `saveProduct` clones payload into `cleanedPayload`.
- It deletes `branchId`.
- It deletes empty/null `templateId`.
- It deletes `productTemplateId` unconditionally.
- It deletes `unit`.
- Then it calls `createProduct(cleanedPayload)`.

Decision:

`productStore.saveProduct` must remain forbidden for S2 create-from-template because it removes clone identity before reaching the API layer.

### quickStockInAllInOneAction / quickStockInAllInOneApi

Assessment:

```txt
Not certified for S2 Template to Operational Product creation.
```

Evidence:

- Store action calls `quickStockInAllInOneApi(payload)`.
- API wrapper posts to `quick-stock/all-in-one`.
- Frontend evidence does not prove that this endpoint creates an Operational Product from Template.
- Frontend evidence does not prove BranchPrice creation behavior.

Decision:

Do not use this path for S2-P002. It may be revisited only after backend contract discovery/certification.

## 2. Recommended wrapper contract

Recommended API wrapper name:

```txt
createOperationalProductFromTemplateApi(payload)
```

Recommended store action name:

```txt
createOperationalProductFromTemplateAction(payload)
```

Recommended responsibility split:

```txt
productApi wrapper:
  - transport only
  - preserve template identity
  - sanitize frontend branchId
  - call backend endpoint
  - return raw response

productStore action:
  - set loading/error state
  - call productApi wrapper
  - return response to QuickStockPage
  - should not own UI workflow state

QuickStockPage:
  - own user-triggered transition
  - build payload from selectedTemplateProduct
  - call store action
  - validate returned Operational Product
  - adopt result into local runtime
```

Recommended endpoint contract name, pending backend confirmation:

```txt
POST products/pos/create-from-template
```

Alternative if backend confirms existing `POST products` accepts this contract:

```txt
createOperationalProductFromTemplateApi(payload) -> apiClient.post('products', payload)
```

Even if `POST products` is reused internally, the frontend should still expose a dedicated S2 wrapper name to avoid accidentally using generic `saveProduct` semantics.

## 3. Required request payload

Minimal required payload for Operational Product only:

```txt
templateProductId: number
sourceCatalog: 'TEMPLATE'
name: string
productTypeId: number
brandId: number
unitId: number | null
mode: string
trackSerialNumber: boolean
```

Recommended optional descriptive fields copied from Template when present:

```txt
categoryId
codeType
warrantyDays
productConfig
active
```

Forbidden / backend-owned fields:

```txt
branchId
id
productId
branchPrice
stock
barcodes
items
quantity
movementType
source
```

Branch identity rule:

```txt
Frontend must not be the authority for branch identity. Backend should derive branch from session/token/runtime context.
```

Identity rule:

```txt
templateProductId = source Template Product id
productId = only returned Operational Product id after creation/adoption
```

## 4. Required response validation

QuickStockPage must not adopt the result unless the response contains a valid Operational Product.

Minimum accepted response shape after extraction:

```txt
operationalProduct.id: number
operationalProduct.isTemplateProduct !== true
operationalProduct.templateProductId: number | optional but preferred
```

Recommended accepted response envelopes:

```txt
{ data: { product: operationalProduct } }
{ data: operationalProduct }
{ product: operationalProduct }
operationalProduct
```

Required validation before adoption:

```txt
id exists and is finite
isTemplateProduct is not true
id is not the same Template-only identity unless backend explicitly marks it operational
```

Recommended QuickStockPage adoption behavior:

```txt
setAdoptedOperationalProduct(operationalProduct)
set onboarding state to OPERATIONAL_READY through existing derived state
hydrate ProductMasterPanel from operationalProduct
keep barcode/intake gated by operationalProduct.id
```

Failure behavior:

```txt
remain TEMPLATE_SELECTED_NOT_CREATED
show recoverable error
no stock intake enabled
no BranchPrice assumption
```

## 5. One-file implementation sequence

Recommended sequence preserving One File at a Time:

### S2-P002A — productApi wrapper only

File:

```txt
src/features/product/api/productApi.js
```

Goal:

```txt
Add createOperationalProductFromTemplateApi(payload) only.
```

Allowed:

- Add wrapper function.
- Preserve `templateProductId`.
- Delete/sanitize `branchId` if present.
- Do not add BranchPrice or stock fields.

Forbidden:

- No productStore changes.
- No QuickStockPage changes.
- No backend changes.

### S2-P002B — productStore action only

File:

```txt
src/features/product/store/productStore.js
```

Goal:

```txt
Add createOperationalProductFromTemplateAction(payload) that calls the certified API wrapper.
```

Allowed:

- Add import.
- Add action.
- Manage loading/error state using existing pattern.
- Return response.

Forbidden:

- Do not use saveProduct.
- Do not delete template identity.
- Do not own UI workflow state.

### S2-P002C — QuickStockPage trigger/adopt only

File:

```txt
src/features/product/pages/QuickStockPage.jsx
```

Goal:

```txt
Add user-triggered create Operational Product from selected Template, call store action, validate and adopt result.
```

Allowed:

- Build certified payload.
- Call store action.
- Validate returned Operational Product.
- Adopt into local runtime.

Forbidden:

- No BranchPrice creation.
- No stock intake payload changes.
- No productStore/productApi changes in this patch.

## 6. Forbidden changes

Forbidden until BranchPrice contract is certified:

1. Creating BranchPrice in S2-P002A/B/C.
2. Sending price fields as BranchPrice first-creation fields.
3. Calling `quickStockInAllInOneAction` as clone path.
4. Calling `productStore.saveProduct` as clone path.
5. Sending Template id as `productId` to `quick-stock/existing`.
6. Changing existing intake payload.
7. Changing Template Search behavior.
8. Editing backend.
9. Combining productApi, productStore, and QuickStockPage changes in one patch.
10. Expanding into Template-missing branch-specific product creation.

## 7. Risks

### R-001 Generic create path ambiguity

Severity: High

`createProduct(payload)` may send `templateProductId`, but using it directly hides S2 semantics and bypasses a clear onboarding contract.

### R-002 saveProduct identity deletion

Severity: Critical

`productStore.saveProduct` deletes `productTemplateId`, so using it may remove the source Template identity required for clone.

### R-003 backend contract uncertainty

Severity: High

The frontend can define wrapper contract, but backend endpoint behavior must be confirmed before assuming clone semantics.

### R-004 BranchPrice premature coupling

Severity: High

If Product and BranchPrice are bundled before contract certification, QuickStockPage may incorrectly show Operational Ready while price runtime is incomplete.

### R-005 response adoption risk

Severity: High

If QuickStockPage adopts a Template-like response as Operational Product, stock intake may target the wrong identity. Response validation is mandatory.

## 8. Exact next assignment recommendation

Recommended next implementation assignment:

```txt
ASSIGNMENT-011 — S2-P002A productApi Create-From-Template Wrapper
Assigned Task: TASK-01 Runtime Analysis Squad
Status: APPROVED FOR IMPLEMENTATION only if Mission Controller explicitly approves
Scope: One file only
File allowed to modify:
- src/features/product/api/productApi.js
Objective:
- Add createOperationalProductFromTemplateApi(payload)
- Preserve templateProductId
- Sanitize branchId from frontend payload
- Do not create BranchPrice
- Do not change existing createProduct, saveProduct, quickStockInAllInOneApi, Template Search, or intake payload
Deliverable:
- code commit
- docs/mission-b/inbox/VERIFY-006.md
```

Recommended implementation shape:

```txt
export const createOperationalProductFromTemplateApi = async (payload = {}) => {
  const sanitizedPayload = { ...payload };
  delete sanitizedPayload.branchId;
  const { data } = await apiClient.post('products/pos/create-from-template', sanitizedPayload);
  return data;
};
```

Endpoint path should be confirmed by ROLE-ARCH or backend contract before implementation. If endpoint is not yet confirmed, ASSIGNMENT-011 should be a code-level wrapper scaffold only after explicit approval, or a backend contract discovery should be issued first.

Implementation remains not approved in this CONTRACT-001 discovery report.
