# ASSIGNMENT-010 — S2 Create Wrapper Contract Discovery

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: ACTIVE
Implementation: DISCOVERY ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/DECIDE-002.md
- docs/mission-b/inbox/VERIFY-005.md

## Objective
Determine the safest frontend wrapper contract for creating an Operational Product from a Template while preserving Template identity.

Do not modify source code.
Do not implement create/clone/BranchPrice behavior.
Do not modify backend.

## Files To Inspect
Primary:
- src/features/product/api/productApi.js
- src/features/product/store/productStore.js

Reference only:
- src/features/product/pages/QuickStockPage.jsx

## Questions To Answer
1. Can any current API wrapper send `templateProductId` without deleting it?
2. Is `createProduct(payload)` safe enough as a transport wrapper if called directly with a certified payload?
3. Should S2-P002A add a dedicated `createOperationalProductFromTemplateApi` wrapper in productApi first?
4. Should S2-P002B add a dedicated productStore action after productApi wrapper is certified?
5. What exact payload fields must the wrapper accept?
6. What exact response shape must QuickStockPage require before adopting the result?
7. What must remain forbidden until BranchPrice contract is certified?
8. What exact next implementation assignment should ROLE-ARCH issue?

## Deliverable
Create:
- docs/mission-b/inbox/CONTRACT-001.md

Required sections:
1. Existing wrapper assessment
2. Recommended wrapper contract
3. Required request payload
4. Required response validation
5. One-file implementation sequence
6. Forbidden changes
7. Risks
8. Exact next assignment recommendation

## Completion
Commit the report to Git.
Report back only:
- Report path
- Commit SHA

Do not paste the report into chat.