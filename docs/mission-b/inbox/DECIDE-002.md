# DECIDE-002 — S2 Ownership Decision Discovery

Mission: Mission B
Assignment: ASSIGNMENT-009
Task: TASK-01 Runtime Analysis Squad
Role: ROLE-RUNTIME
Status: DISCOVERY ONLY
Implementation: NOT APPROVED

## 1. Ownership recommendation

Recommended ownership split:

```txt
QuickStockPage = owns user-triggered onboarding transition and runtime state
productStore = should expose a narrow action later, not own UI workflow
productApi = should expose transport-only API wrapper later, not own product onboarding decision
```

Primary owner recommendation:

```txt
QuickStockPage should own the user-triggered create/clone transition.
```

Reason:

- QuickStockPage already owns selected Template product, adopted Operational Product, onboarding state, lookup/adopt state, barcode queue gates, and existing intake gates.
- DECISION-001 already makes QuickStockPage the canonical frontend entry point and state owner.
- VERIFY-005 confirms the S2 lookup/adopt patch added local runtime state only in QuickStockPage and did not change productStore or productApi.
- The create/clone transition is a user workflow decision, not a generic data-store operation.

Recommended future structure:

```txt
QuickStockPage.handleCreateOperationalFromTemplate
  -> productStore action later, if approved
  -> productApi dedicated wrapper later, if approved
  -> adopt returned Operational Product into QuickStockPage runtime
```

QuickStockPage should orchestrate, but not contain low-level HTTP details long term.

## 2. Existing function assessment

### saveProduct / productStore.saveProduct

Assessment: not safe as first reuse for Template clone.

Evidence:

- productStore.saveProduct clones payload into `cleanedPayload`.
- It deletes `branchId`.
- It deletes `productTemplateId`.
- It deletes empty/null `templateId`.
- It deletes `unit`.
- Then it calls `createProduct(cleanedPayload)`.

Ownership implication:

`saveProduct` is a generic create Product action and currently removes at least one important clone identity field. It should not be used as the first Template to Operational Product clone path without a later dedicated contract decision.

### createProduct / productApi.createProduct

Assessment: transport-level primitive only.

Evidence:

- `createProduct(payload)` directly posts to `products`.
- It does not encode Product Onboarding semantics.
- It does not prove BranchPrice first creation behavior.

Ownership implication:

It may be reusable later under a dedicated store action, but it should not be called directly from QuickStockPage for clone until payload and backend contract are certified.

### quickStockInAllInOneAction / quickStockInAllInOneApi

Assessment: not safe as first reuse for Template clone.

Evidence:

- productStore exposes `quickStockInAllInOneAction(payload)`.
- productApi sends it to `POST quick-stock/all-in-one`.
- productApi strips `branchId` only.
- Frontend evidence does not prove it creates Operational Product from Template or creates BranchPrice.

Ownership implication:

This function name suggests an all-in-one workflow, but current frontend evidence is insufficient. It should remain forbidden for first create patch until backend contract certification confirms exact behavior.

### New dedicated wrapper later

Assessment: safest ownership direction.

Recommended later function shape:

```txt
productStore.createOperationalProductFromTemplateAction(payload)
  -> productApi.createOperationalProductFromTemplateApi(payload)
```

This should be added only after ROLE-ARCH approves productStore/productApi file scope.

## 3. Required payload identity

To avoid Template Product id and Operational Product id confusion, the create payload must preserve separate identities.

Required identity fields:

```txt
templateProductId: source Template Product id
sourceCatalog: TEMPLATE or equivalent explicit source marker
```

Recommended product fields copied from selected Template only as descriptive defaults:

```txt
name
productTypeId
brandId
unitId
trackSerialNumber
mode
```

Required branch/runtime rule:

```txt
Do not trust frontend branchId as runtime authority.
Backend/session should determine branch identity.
```

Forbidden identity confusion:

```txt
productId must not be Template Product id for stock intake.
productId in quick-stock/existing must remain Operational Product id only.
```

After create succeeds, QuickStockPage must adopt the returned Operational Product and use only returned `operationalProduct.id` for later stock intake.

## 4. BranchPrice coupling assessment

Current frontend evidence does not prove BranchPrice creation is safely coupled to Product creation.

Observed evidence:

- QuickStockPage can update `branchPrice` only when an Operational Product already exists.
- productStore.saveProduct does not prove BranchPrice first creation from Template.
- productApi.createProduct is a generic `POST products` wrapper.
- productApi.addProductPrice exists separately as `POST products/:productId/prices`.
- quickStockInAllInOneApi exists but is not verified as Template clone plus BranchPrice creation.

Decision:

```txt
BranchPrice should not be bundled into S2-P002 unless backend contract is already certified.
```

S2-P002 should create only Operational Product first, then adopt it. BranchPrice first creation should be a later patch or a separately certified bundled endpoint.

## 5. Recommended first create patch

Recommended first create patch after lookup/adopt certification:

```txt
S2-P002: QuickStockPage user-triggered create Operational Product from selected Template only.
```

Patch behavior:

```txt
TEMPLATE_SELECTED_NOT_CREATED
  -> user explicitly clicks create/clone for this branch
  -> QuickStockPage builds minimal create payload with templateProductId and descriptive fields
  -> call approved creation action/API
  -> if Operational Product returned, adopt into local runtime
  -> transition to OPERATIONAL_READY
  -> do not create BranchPrice in this patch unless backend contract is certified first
```

Recommended scope:

```txt
First preference: QuickStockPage only if an existing approved API/action can preserve templateProductId.
If no existing action preserves templateProductId, stop and issue a productStore/productApi wrapper assignment first.
```

Given current evidence, S2-P002 should probably be a planning/certification assignment for a dedicated wrapper before implementation.

## 6. Forbidden changes

Forbidden in first create patch:

1. Do not use productStore.saveProduct while it deletes `productTemplateId`.
2. Do not use Template Product id as stock intake `productId`.
3. Do not call quickStockInAllInOneAction as clone path without backend contract certification.
4. Do not create BranchPrice unless specifically approved and certified.
5. Do not modify backend inside frontend assignment.
6. Do not change existing stock intake payload.
7. Do not alter Template Search behavior.
8. Do not expand into Template-missing branch-specific creation.
9. Do not touch multiple files unless ROLE-ARCH explicitly scopes them.
10. Do not let productStore own UI workflow state.

## 7. Risks

### R-001 productStore.saveProduct removes clone identity

Severity: Critical

If S2-P002 uses `saveProduct`, `productTemplateId` may be removed before `createProduct`, making a true Template clone impossible or ambiguous.

### R-002 false all-in-one assumption

Severity: High

`quickStockInAllInOneAction` may not be Template clone plus BranchPrice. Using it without contract proof could create stock or products incorrectly.

### R-003 BranchPrice ambiguity

Severity: High

BranchPrice first creation is not currently proven in frontend evidence. Bundling it into first create patch could hide failure states.

### R-004 workflow ownership drift

Severity: High

If productStore owns workflow transitions, QuickStockPage may lose control of UI state gates that currently prevent Template id misuse.

### R-005 scope expansion

Severity: High

A dangerous implementation would modify QuickStockPage, productStore, productApi, and backend together. Mission B requires one file at a time and minimal patch.

## 8. Exact next assignment recommendation

Recommended next assignment for ROLE-ARCH:

```txt
ASSIGNMENT-010 — S2 Create Wrapper Contract Discovery
Assigned Task: TASK-01 Runtime Analysis Squad
Status: DISCOVERY ONLY
Objective: Determine whether an existing frontend API/action can create Operational Product from Template while preserving templateProductId, or whether a new dedicated productApi/productStore wrapper is required.
Files to inspect:
- src/features/product/api/productApi.js
- src/features/product/store/productStore.js
- src/features/product/pages/QuickStockPage.jsx only for call-site requirements
Questions:
1. Can any current API wrapper send templateProductId without deleting it?
2. What exact wrapper name should be added if no current wrapper is safe?
3. Should wrapper be productApi first or productStore first under one-file policy?
4. What payload fields are mandatory for create Operational Product only?
5. What must remain forbidden until BranchPrice contract is certified?
Deliverable:
- docs/mission-b/inbox/CONTRACT-001.md
```

If Mission Controller wants to proceed directly to implementation after this decision, the safer implementation route is:

```txt
S2-P002A: productApi dedicated create-from-template wrapper only
S2-P002B: productStore action that calls wrapper only
S2-P002C: QuickStockPage user-triggered create button/action that calls store and adopts returned Operational Product
```

This preserves One File at a Time and avoids using unsafe generic `saveProduct` for clone.

Implementation remains not approved in this DECIDE-002 discovery report.
