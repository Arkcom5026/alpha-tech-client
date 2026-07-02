# ASSIGNMENT-009 — S2 Ownership Decision Discovery

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: ACTIVE
Implementation: DISCOVERY ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/RT-002.md
- docs/mission-b/inbox/VERIFY-005.md

## Objective
Decide the safest frontend ownership for Operational Product Creation from Template before any create/clone implementation begins.

Do not modify source code.
Do not modify backend.
Do not implement create/clone/BranchPrice behavior.

## Files To Inspect
Inspect only what is needed to answer ownership clearly.

Primary:
- src/features/product/pages/QuickStockPage.jsx
- src/features/product/store/productStore.js
- src/features/product/api/productApi.js

Optional only if directly necessary:
- ProductMasterPanel
- ProductFinderPanel

## Questions To Answer
1. Which current frontend layer should own the user-triggered create/clone transition: QuickStockPage, productStore, or productApi?
2. Which existing function is safest to reuse first: saveProduct, createProduct, quickStockInAllInOneAction, or a new dedicated wrapper later?
3. Does any current frontend function preserve enough Template identity to create a branch Operational Product correctly?
4. Does productStore.saveProduct still remove productTemplateId or other clone identity fields?
5. Is BranchPrice creation currently coupled to product creation anywhere in frontend evidence?
6. What is the safest first implementation patch after lookup/adopt is certified?
7. Should S2-P002 create only Operational Product first, or Product + BranchPrice together?
8. What payload fields must be present to avoid confusing Template Product id with Operational Product id?
9. What must remain forbidden in the first create patch?
10. What exact next assignment should ROLE-ARCH issue?

## Deliverable
Create:
- docs/mission-b/inbox/DECIDE-002.md

Required sections:
1. Ownership recommendation
2. Existing function assessment
3. Required payload identity
4. BranchPrice coupling assessment
5. Recommended first create patch
6. Forbidden changes
7. Risks
8. Exact next assignment recommendation

## Completion
Commit the report to Git.
Report back only:
- Report path
- Commit SHA

Do not paste the report into chat.