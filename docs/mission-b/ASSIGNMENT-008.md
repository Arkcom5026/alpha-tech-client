# ASSIGNMENT-008 — S2 QuickStockPage Operational Lookup Patch

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: APPROVED FOR IMPLEMENTATION

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/RT-002.md

## File Allowed To Modify
Only:
- src/features/product/pages/QuickStockPage.jsx

## Objective
When a Template product is selected, use the existing frontend API `getOperationalProductByTemplateId(templateProductId)` to discover whether a branch Operational Product already exists.

## Required Behavior
1. Keep existing Template search unchanged.
2. On Template selection, perform lookup.
3. If Operational Product exists:
   - adopt it into local runtime state.
   - continue with existing operational flow.
4. If none exists:
   - remain TEMPLATE_SELECTED_NOT_CREATED.
5. Do not create Product.
6. Do not create BranchPrice.
7. Do not modify intake payload.

## Forbidden
- Backend changes
- productStore changes
- productApi changes
- Clone/Create logic
- BranchPrice creation
- Other application files

## Verification
Create:
- docs/mission-b/inbox/VERIFY-005.md

Include:
- Files changed
- Lookup flow summary
- Existing operational regression check
- Template-not-found behavior
- Remaining runtime debt

## Completion
Reply only with:
- Commit SHA
- Files changed
- Verification report path