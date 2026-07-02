# ASSIGNMENT-012 — S2-P002B productStore Create-From-Template Action

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: APPROVED FOR IMPLEMENTATION
Implementation: APPROVED FOR THIS ASSIGNMENT ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/CONTRACT-001.md
- docs/mission-b/inbox/VERIFY-006.md

## File Allowed To Modify
Only:
- src/features/product/store/productStore.js

No other application source file may be modified.

## Objective
Add a dedicated productStore action for creating an Operational Product from a Template by calling the certified API wrapper.

## Required Action
Add:

```txt
createOperationalProductFromTemplateAction(payload)
```

## Required Behavior
1. Import `createOperationalProductFromTemplateApi` from productApi.
2. Preserve `templateProductId` in payload.
3. Do not call `saveProduct`.
4. Do not call `createProduct` directly.
5. Do not call `quickStockInAllInOneAction` or `quickStockInAllInOneApi`.
6. Follow existing productStore loading/error pattern where appropriate.
7. Return API response to caller.
8. Do not own UI workflow state.

## Forbidden Changes
- Do not modify productApi.
- Do not modify QuickStockPage.
- Do not modify backend.
- Do not add BranchPrice behavior.
- Do not add Stock Intake behavior.
- Do not change existing saveProduct behavior.
- Do not delete template identity fields.
- Do not change existing payload contracts.

## Verification Required
Create:
- docs/mission-b/inbox/VERIFY-007.md

The report must include:
1. Files changed
2. Store action added
3. Payload preservation verification
4. Existing store action regression verification
5. Remaining runtime risks

## Completion
Commit code + verification report to Git.
Report back only:
- Commit SHA
- Files changed
- Verification report path
