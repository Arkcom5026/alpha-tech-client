# ASSIGNMENT-002 — QuickStockPage State Gate Patch

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: APPROVED FOR IMPLEMENTATION
Implementation: APPROVED FOR THIS ASSIGNMENT ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/PLAN-001.md

## File Allowed To Modify
- src/features/product/pages/QuickStockPage.jsx

No other application source file may be modified.

## Objective
Introduce a minimal explicit onboarding state gate in QuickStockPage and block Template-only selected products from barcode queue / existing-stock Commit.

## Required Behavior
1. Existing Template Search must continue to work.
2. Selecting Template-only product must remain visible as NOT CREATED.
3. Template-only product must not be allowed to commit through existing-product intake.
4. Existing Operational Product intake must continue to work with the same payload shape.
5. No clone/create/BranchPrice behavior should be added in this assignment.

## Forbidden Changes
- Do not modify ProductFinderPanel.
- Do not modify ProductMasterPanel.
- Do not modify ProductEditor.
- Do not modify IntakeControlPanel.
- Do not modify BarcodeScanner.
- Do not modify CommitBar.
- Do not modify productStore.
- Do not modify productApi.
- Do not modify backend.
- Do not add clone/create/BranchPrice behavior.

## Verification Required
After implementation, create report:
- docs/mission-b/inbox/VERIFY-001.md

The report must include:
1. Files changed
2. Summary of patch
3. Template Search verification
4. Template-only safety verification
5. Existing Operational Product intake regression verification
6. Known residual risks

## Completion
Commit code + verification report to Git.
Report back only:
- Commit SHA
- Files changed
- Verification report path