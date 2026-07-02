# ASSIGNMENT-011 — S2-P002A productApi Create-From-Template Wrapper

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: APPROVED FOR IMPLEMENTATION
Implementation: APPROVED FOR THIS ASSIGNMENT ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/CONTRACT-001.md

## File Allowed To Modify
Only:
- src/features/product/api/productApi.js

No other application source file may be modified.

## Objective
Add a dedicated frontend API wrapper for creating an Operational Product from a Template while preserving Template identity.

## Required Wrapper
Add:

```txt
createOperationalProductFromTemplateApi(payload)
```

## Required Behavior
1. Preserve `templateProductId` in the request payload.
2. Remove/sanitize frontend `branchId` if present.
3. Call the agreed frontend contract endpoint:

```txt
products/pos/create-from-template
```

4. Return backend response data.
5. Do not modify existing wrappers.
6. Do not modify `createProduct`.
7. Do not modify Template Search.
8. Do not modify quick-stock intake API calls.

## Forbidden Changes
- Do not modify productStore.
- Do not modify QuickStockPage.
- Do not modify backend.
- Do not add BranchPrice behavior.
- Do not add stock intake behavior.
- Do not change existing payload contracts.
- Do not use `quickStockInAllInOneApi`.

## Verification Required
Create:
- docs/mission-b/inbox/VERIFY-006.md

The report must include:
1. Files changed
2. Wrapper added
3. Payload preservation verification
4. Existing API regression verification
5. Remaining contract risks

## Completion
Commit code + verification report to Git.
Report back only:
- Commit SHA
- Files changed
- Verification report path
