# ASSIGNMENT-007 — S2 Runtime Discovery: Template to Operational Product

Assigned Task: TASK-01 — Runtime Analysis Squad
Status: ACTIVE
Implementation: DISCOVERY ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/certification/CERT-001.md
- docs/mission-b/inbox/RT-001.md
- docs/mission-b/inbox/GAP-001.md
- docs/mission-b/inbox/DECISION-001.md

## Objective
Start Series S2 by discovering the safest runtime path for converting a Template-selected product into a branch Operational Product.

Do not modify source code.
Do not modify backend.
Do not add clone/create/BranchPrice behavior yet.

## Files To Inspect
Inspect only the minimum frontend runtime files needed to answer the questions below.

Primary targets:
- src/features/product/pages/QuickStockPage.jsx
- src/features/product/store/productStore.js
- src/features/product/api/productApi.js

Optional only if directly referenced:
- ProductFinderPanel
- ProductMasterPanel

## Questions To Answer
1. Which current frontend function/action is closest to Template → Operational Product creation?
2. Does `getOperationalProductByTemplateId` already provide the lookup needed before create/clone?
3. Is there an existing frontend action that can create a product for current branch from template data?
4. Is BranchPrice creation bundled with product creation anywhere in current frontend runtime?
5. Which file should own the first S2 implementation patch?
6. What is the safest first runtime patch: lookup first, create first, or UI decision first?
7. What payload risks exist if Template id is confused with Operational Product id?
8. What runtime state must be present before stock intake is allowed?
9. What should remain forbidden in the first S2 implementation patch?
10. What exact single-file assignment should ROLE-ARCH issue next?

## Deliverable
Create:
- docs/mission-b/inbox/RT-002.md

Required sections:
1. Runtime findings
2. Existing actions/APIs found
3. Missing transition
4. Recommended first S2 patch
5. First file recommendation
6. Forbidden changes
7. Risks
8. Next assignment recommendation

## Completion
Commit the report to Git.
Report back only:
- Report path
- Commit SHA

Do not paste the report into chat.