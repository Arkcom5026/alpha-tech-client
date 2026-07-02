# PLAN-001 — QuickStockPage First Implementation Plan

Assignment: ASSIGNMENT-001  
Assigned Task: TASK-01 — Runtime Analysis Squad  
Work Package: WP-005 QuickStockPage Implementation Plan  
Role: ROLE-RUNTIME  
Implementation Status: LOCKED  
Repository: alpha-tech-client

---

## 1. First File Scope

First implementation file:

```txt
src/features/product/pages/QuickStockPage.jsx
```

Scope is limited to QuickStockPage only.

Reason:

- DECISION-001 defines QuickStockPage as the canonical frontend entry point for Product Onboarding.
- DECISION-001 defines QuickStockPage as the canonical owner of the onboarding state machine.
- The first step must add control at the orchestration point before touching child components, productStore, productApi, or backend.

Out of scope for the first file:

- ProductFinderPanel
- ProductMasterPanel
- ProductEditor
- IntakeControlPanel
- BarcodeScanner
- CommitBar
- productStore
- productApi
- backend repository / backend endpoints

---

## 2. Minimal State Machine Draft

Recommended initial states:

```txt
NO_SELECTION
TEMPLATE_SELECTED_NOT_CREATED
OPERATIONAL_READY
INTAKE_READY
INTAKE_COMMITTING
ERROR_RECOVERABLE
```

State meanings:

- `NO_SELECTION`: no product selected.
- `TEMPLATE_SELECTED_NOT_CREATED`: Template Catalog product selected, but branch Operational Product is not confirmed.
- `OPERATIONAL_READY`: branch Operational Product exists and can be used as runtime source of truth.
- `INTAKE_READY`: operational product, required prices, and barcode queue are ready.
- `INTAKE_COMMITTING`: existing Operational Product intake is being saved.
- `ERROR_RECOVERABLE`: user can clear selection, correct input, or retry.

Minimal derived booleans:

```txt
isTemplateOnlySelection
isOperationalSelection
canEditOperationalProduct
canScanBarcode
canCommitExistingIntake
```

Core gate:

```txt
Barcode scanning and existing-stock commit must require operationalProduct.id, not merely selectedProduct.id.
```

---

## 3. Allowed Changes

Allowed only after implementation is explicitly approved:

1. Add minimal derived onboarding state inside QuickStockPage.
2. Require confirmed `operationalProduct` for existing-product intake actions.
3. Prevent Template-only products from entering barcode queue / existing-product Commit path.
4. Keep Template Search behavior unchanged.
5. Keep selected Template visibility unchanged.
6. Keep existing operational product edit behavior unchanged.
7. Keep existing operational product intake payload shape unchanged.
8. Add small user-facing guard text only if needed.
9. Keep all changes local to QuickStockPage.

Allowed first-patch intent:

```txt
Make unsafe Template-only intake impossible before adding clone/create behavior.
```

---

## 4. Forbidden Changes

The first patch must not:

1. Modify backend code.
2. Inspect backend implementation details.
3. Modify productStore.
4. Modify productApi.
5. Modify ProductFinderPanel.
6. Modify ProductMasterPanel.
7. Modify ProductEditor.
8. Modify IntakeControlPanel.
9. Modify BarcodeScanner.
10. Modify CommitBar.
11. Add Product creation behavior.
12. Add Template clone behavior.
13. Add BranchPrice creation behavior.
14. Change API endpoint names or payload contracts.
15. Activate unrelated Login/Auth/RBAC work.
16. Treat selectedTemplateProduct.id as an operational productId.

---

## 5. Verification Checklist

Template Search regression:

- [ ] QuickStockPage loads.
- [ ] ProductType dropdown still loads from Template Catalog source.
- [ ] Brand dropdown still filters according to selected ProductType.
- [ ] Keyword search still works.
- [ ] Search results still render.
- [ ] Selecting a Template product still shows NOT CREATED state.

Template-only safety gate:

- [ ] Template-only selected product does not become editable as Operational Product.
- [ ] Template-only selected product cannot be committed through existing-product intake.
- [ ] Template-only selected product cannot send Template id as productId to existing-stock intake.
- [ ] User can clear selection and search again.

Existing Operational Product intake regression:

- [ ] Existing Operational Product can still hydrate ProductMasterPanel.
- [ ] Existing Operational Product can still enter required prices.
- [ ] Existing Operational Product can still scan barcode.
- [ ] Existing Operational Product can still add queue rows.
- [ ] Existing Operational Product can still Commit existing intake.
- [ ] Existing intake still calls quickStockIntakeExistingAction with the same payload shape.
- [ ] Queue reset still works after successful commit.

State sanity:

- [ ] NO_SELECTION is stable after clearing selection.
- [ ] TEMPLATE_SELECTED_NOT_CREATED is stable after selecting Template.
- [ ] OPERATIONAL_READY is stable for branch product.
- [ ] INTAKE_READY requires operational product plus valid prices and queue.
- [ ] INTAKE_COMMITTING prevents duplicate commit.

---

## 6. Rollback Plan

Rollback must be one-file only.

If the future approved QuickStockPage patch regresses behavior:

1. Revert only `src/features/product/pages/QuickStockPage.jsx` to the previous version.
2. Do not revert productStore.
3. Do not revert productApi.
4. Do not revert backend.
5. Do not revert child quick-stock components.

Reason:

The first approved patch must be scoped only to QuickStockPage, so rollback must not require multi-file recovery.

---

## 7. Runtime Risks

### R-001 — Template Product ID used as Operational Product ID

Risk: Template-selected product id may be treated as runtime product id.

Control: existing-stock intake must require `operationalProduct.id`.

Severity: CRITICAL

### R-002 — Existing intake regression

Risk: new gates may accidentally block current working Operational Product intake.

Control: keep payload shape unchanged and verify existing intake manually.

Severity: HIGH

### R-003 — Scope expansion

Risk: solving clone/create/BranchPrice in the first patch would expand scope beyond QuickStockPage.

Control: first patch only gates unsafe behavior. Creation flow remains locked for later approval.

Severity: HIGH

### R-004 — UI expectation mismatch remains

Risk: Template-selected UI wording may still imply first Commit can complete clone + BranchPrice + stock intake.

Control: document as residual UX risk and resolve in a later approved UI package.

Severity: MEDIUM

### R-005 — Branch-created product path still missing

Risk: Template-missing product creation remains unavailable after first patch.

Control: keep out of first-patch scope and plan later after state ownership is stable.

Severity: CRITICAL for Mission B completion.

---

## 8. Assignment Recommendation

Recommended next assignment:

```txt
ASSIGNMENT-002 — QuickStockPage State Gate Patch
```

Recommended first implementation file:

```txt
src/features/product/pages/QuickStockPage.jsx
```

Recommended implementation goal:

```txt
Introduce a minimal explicit onboarding state gate in QuickStockPage and block Template-only selected products from barcode queue / existing-stock Commit.
```

Implementation may begin only after PLAN-001 is reviewed and a new implementation work package explicitly changes status from LOCKED to APPROVED.

Current status:

```txt
Implementation remains LOCKED.
```
