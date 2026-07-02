# ASSIGNMENT-005 — CommitBar Disabled Reason

Assigned Task: TASK-02 — User Journey Squad
Status: APPROVED FOR IMPLEMENTATION
Implementation: APPROVED FOR THIS ASSIGNMENT ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/certification/CERT-001.md
- docs/mission-b/inbox/UXR-001.md

## File Allowed To Modify
Confirm exact CommitBar path first, then modify only that CommitBar file.

Expected target:
- src/features/product/components/quick-stock/CommitBar.jsx

No other application source file may be modified.

## Objective
Make the disabled Commit reason clear when the selected item is Template-only / not yet Operational Product.

## Required Behavior
1. Commit must remain blocked for Template-only product.
2. The UI should explain why Commit is unavailable.
3. Wording should align with certified Patch-001 and Patch-002:
   - Template is search/clone source only.
   - Operational Product is required before stock intake.
4. Existing Operational Product commit behavior must remain unchanged.

## Suggested Thai Copy
Use concise field-friendly Thai, for example:

```txt
ยังรับสินค้าไม่ได้: ต้องสร้างสินค้าในร้านก่อน
```

or

```txt
ต้องสร้าง Operational Product ของร้านก่อนรับเข้า Stock
```

TASK-02 may choose the clearer wording for the existing UI shape.

## Forbidden Changes
- Do not modify QuickStockPage.
- Do not modify ProductMasterPanel.
- Do not modify ProductFinderPanel.
- Do not modify productStore.
- Do not modify productApi.
- Do not modify backend.
- Do not add clone/create/BranchPrice behavior.
- Do not change payload shape.

## Verification Required
Create:
- docs/mission-b/inbox/VERIFY-003.md

The report must include:
1. Files changed
2. Summary of UX copy change
3. Confirmation only CommitBar was modified as application source
4. Template-only disabled reason verification
5. Existing Operational Product commit regression verification
6. Remaining UX debt

## Completion
Commit code + verification report to Git.
Report back only:
- Commit SHA
- Files changed
- Verification report path
