# ASSIGNMENT-014 — S2 Integration Contract Verification

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: ACTIVE
Implementation: VERIFICATION / DISCOVERY ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/VERIFY-008.md
- docs/mission-b/inbox/CONTRACT-001.md

## Objective
Verify the Frontend ↔ Backend integration contract for the newly completed Template → Operational Product create/adopt flow before any further runtime feature patches.

Do not modify source code.
Do not modify backend.
Do not create BranchPrice behavior.

## What To Verify
1. Does backend currently expose this endpoint?

```txt
POST products/pos/create-from-template
```

2. If the endpoint exists, what request payload does it expect?
3. If the endpoint exists, what response shape does it return?
4. Does the response contain a valid Operational Product id suitable for QuickStockPage adoption?
5. Does backend derive branch identity from session/token/runtime context, or does it require `branchId`?
6. Does endpoint create only Operational Product, or also BranchPrice?
7. What errors are returned when:
   - Template does not exist
   - Operational Product already exists
   - Branch context is missing
   - Required Template fields are missing
8. Does current FE wrapper/action/QuickStockPage flow match backend behavior?
9. What is the smallest next step to make integration pass if backend is missing or mismatched?

## Files / Evidence To Inspect
Frontend reference:
- src/features/product/api/productApi.js
- src/features/product/store/productStore.js
- src/features/product/pages/QuickStockPage.jsx

Backend evidence if available to the task through GitHub/repo search:
- product routes/controllers/services related to `create-from-template`
- product runtime-by-template route
- quick-stock routes/controllers/services

If backend repository is not available, state that clearly and produce the expected backend contract from FE evidence.

## Deliverable
Create:
- docs/mission-b/inbox/INTEGRATION-001.md

Required sections:
1. Endpoint availability
2. Request contract comparison
3. Response contract comparison
4. Branch identity handling
5. BranchPrice behavior finding
6. Error behavior finding
7. FE compatibility result
8. Blocking issues
9. Recommended next assignment

## Completion
Commit the report to Git.
Report back only:
- Report path
- Commit SHA

Do not paste the report into chat.