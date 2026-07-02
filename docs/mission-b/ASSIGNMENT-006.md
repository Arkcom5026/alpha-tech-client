# ASSIGNMENT-006 — ProductFinderPanel Template Status Badge

Assigned Task: TASK-02 — User Journey Squad
Status: APPROVED FOR IMPLEMENTATION
Implementation: APPROVED FOR THIS ASSIGNMENT ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/VERIFY-003.md

## File Allowed To Modify
Confirm exact ProductFinderPanel path first, then modify only that ProductFinderPanel file.

Expected target:
- src/features/product/components/quick-stock/ProductFinderPanel.jsx

No other application source file may be modified.

## Objective
Make search results clearer before selection by showing whether a result is a Template candidate / not yet an Operational Product when that status is available in the current result data.

## Required Behavior
1. Existing search behavior must remain unchanged.
2. Existing selection behavior must remain unchanged.
3. Add a small user-facing badge/label only when the current data already indicates Template-only or not-created status.
4. Do not add runtime lookup.
5. Do not add clone/create/BranchPrice behavior.
6. Existing Operational Product results must remain selectable as before.

## Suggested Thai Copy
Use short field-friendly wording such as:

```txt
Template
ต้องสร้างในร้านก่อน
```

or

```txt
ยังไม่อยู่ในร้าน
```

TASK-02 may choose the clearest wording that fits the existing UI layout.

## Forbidden Changes
- Do not modify QuickStockPage.
- Do not modify ProductMasterPanel.
- Do not modify CommitBar.
- Do not modify productStore.
- Do not modify productApi.
- Do not modify backend.
- Do not add API calls.
- Do not change search result data shape.
- Do not add clone/create/BranchPrice behavior.

## Verification Required
Create:
- docs/mission-b/inbox/VERIFY-004.md

The report must include:
1. Files changed
2. Summary of UX badge/label change
3. Confirmation only ProductFinderPanel was modified as application source
4. Search behavior regression verification
5. Selection behavior regression verification
6. Remaining UX debt

## Completion
Commit code + verification report to Git.
Report back only:
- Commit SHA
- Files changed
- Verification report path
