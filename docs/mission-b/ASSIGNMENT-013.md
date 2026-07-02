# ASSIGNMENT-013 — S2-P002C QuickStockPage Create/Adopt Trigger

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: APPROVED FOR IMPLEMENTATION
Implementation: APPROVED FOR THIS ASSIGNMENT ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/CONTRACT-001.md
- docs/mission-b/inbox/VERIFY-006.md
- docs/mission-b/inbox/VERIFY-007.md

## File Allowed To Modify
Only:
- src/features/product/pages/QuickStockPage.jsx

No other application source file may be modified.

## Objective
Add the user-triggered create/adopt step in QuickStockPage for Template-selected products using the certified store action.

## Required Behavior
1. For `TEMPLATE_SELECTED_NOT_CREATED`, provide a controlled user-triggered action to create an Operational Product from the selected Template.
2. Build a certified payload from `selectedTemplateProduct` only.
3. Call `createOperationalProductFromTemplateAction(payload)`.
4. Validate the returned Operational Product before adoption.
5. Adopt only when the returned product has a valid Operational Product id and is not Template-only.
6. After adoption, continue through the existing operational runtime flow.
7. If create fails or returns invalid data, remain `TEMPLATE_SELECTED_NOT_CREATED` and keep intake blocked.

## Required Payload Identity
Payload must preserve source identity:

```txt
templateProductId
sourceCatalog: TEMPLATE
```

Allowed descriptive fields copied from Template when present:

```txt
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

## Forbidden Changes
- Do not modify productApi.
- Do not modify productStore.
- Do not modify backend.
- Do not create BranchPrice.
- Do not change Stock Intake payload.
- Do not send Template id as stock intake productId.
- Do not use saveProduct.
- Do not use quickStockInAllInOneAction.
- Do not modify ProductFinderPanel, ProductMasterPanel, CommitBar, or BarcodeScanner.

## Verification Required
Create:
- docs/mission-b/inbox/VERIFY-008.md

The report must include:
1. Files changed
2. Create/adopt flow summary
3. Payload identity verification
4. Response validation verification
5. Template failure behavior verification
6. Existing Operational Product regression verification
7. Remaining runtime debt

## Completion
Commit code + verification report to Git.
Report back only:
- Commit SHA
- Files changed
- Verification report path
