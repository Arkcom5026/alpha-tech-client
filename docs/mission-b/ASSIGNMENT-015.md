# ASSIGNMENT-015 — Mission B-BE S1 Backend Create-From-Template Discovery

Assigned Task: TASK-01 — Backend Runtime Squad
Status: ACTIVE
Implementation: DISCOVERY ONLY

## Read First
- docs/mission-b/BLACKBOARD.md
- docs/mission-b/inbox/INTEGRATION-001.md

## Objective
Define the minimum backend implementation required to satisfy the certified Frontend contract for Template → Operational Product creation.

Do not modify backend source yet.

## Inspect
- routes/productRoutes.js
- controllers/productController.js
- product service/runtime service used by createProduct
- runtime mapping utilities

## Questions
1. Where should POST /api/products/pos/create-from-template be registered?
2. Which controller should own it?
3. Reuse existing service or create a dedicated service?
4. How should templateProductId be validated?
5. How should duplicate Operational Products be prevented?
6. What runtime object should be returned so QuickStockPage can adopt immediately?
7. Which logic can be reused from createProduct?
8. Which logic must not be reused?

## Deliverable
Create:
- docs/mission-b/inbox/BE-CONTRACT-001.md

Include:
- Route design
- Controller design
- Service design
- Request contract
- Response contract
- Validation flow
- Reusable code
- New code required
- Recommended first backend implementation patch

## Completion
Commit report to Git.
Reply only:
- Report path
- Commit SHA