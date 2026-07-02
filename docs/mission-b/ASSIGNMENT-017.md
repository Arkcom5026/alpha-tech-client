# ASSIGNMENT-017 — Mission B End-to-End Runtime Verification

Assigned Role: BE-01 Backend Runtime Owner
Support Role if needed: FE-01 Frontend Runtime Owner
Status: APPROVED FOR VERIFICATION
Implementation: LOCKED unless verification finds a blocking defect

## Mission Context

Mission B is an end-to-end workflow mission, not a FE/BE split mission.

Mission goal:

```txt
Template Search
→ Template Selection
→ Operational Product lookup/create/clone
→ BranchPrice ready
→ Stock intake
→ Product visible and usable in branch runtime
```

Current checkpoint:

```txt
B-07 End-to-End Runtime Verification
```

Current understanding:

```txt
/api/products/template/search
→ /api/quick-stock/existing
→ QuickStockService.quickReceiveExistingProduct
→ productTemplateEngine.cloneProductFromTemplate if needed
→ BranchPrice runtime upsert
→ StockItem / SimpleLot
→ StockMovement
→ StockBalance
→ Product visible in branch runtime
```

## Required Boot

Read in this order.

Frontend / Mission docs:

```txt
docs/frontend/CERTIFICATION_INDEX.md
docs/mission-b/BLACKBOARD.md
docs/mission-b/ASSIGNMENT-017.md
```

Backend docs in `alpha-tech-server`:

```txt
docs/backend/SYSTEM_MAP.md
docs/backend/RUNTIME_MAP.md
docs/backend/DOMAIN_MAP_STOCK_PROCUREMENT_SALES.md
docs/backend/MIGRATION_MAP.md
docs/backend/MISSION_MAP.md
docs/roles/README.md
docs/roles/backend/BE-01-RUNTIME.md
```

## Verification Target

Verify the real runtime workflow:

```txt
1. Login as POS employee with branch context.
2. Open QuickStock / รับสินค้าด่วน flow.
3. Search Template Product from T01 via `/api/products/template/search`.
4. Select a Template Product that does not already exist as Operational Product in the current branch.
5. Confirm operational lookup returns `exists:false` or equivalent not-yet-in-branch state.
6. Enter runtime prices:
   - costPrice
   - priceRetail
   - priceWholesale if available
   - priceTechnician if available
   - priceOnline if available
7. Add barcode / queue item.
8. Commit through `/api/quick-stock/existing`.
9. Confirm backend clones Operational Product if needed.
10. Confirm BranchPrice is upserted using runtime form prices, not only template default prices.
11. Confirm stock runtime writes inventory:
    - StockItem or SimpleLot
    - StockMovement
    - StockBalance
12. Confirm Product List / POS search shows the product in the current branch.
13. Confirm the product shows correct price and available/stock state.
```

## Files Allowed

Verification/report only unless a blocker is found.

Allowed report path:

```txt
docs/mission-b/inbox/VERIFY-E2E-001.md
```

If a code defect blocks verification, stop and report before changing code unless the fix is clearly minimal and within BE-01 Runtime scope.

## Files Forbidden Unless Blocker Is Confirmed

Frontend:

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/*
src/features/product/api/productApi.js
src/features/product/store/productStore.js
```

Backend:

```txt
routes/productRoutes.js
controllers/productController.js
src/modules/quickStock/**
src/modules/product/**
routes/branchPriceRoutes.js
controllers/branchPriceController.js
routes/stockItemRoutes.js
controllers/stockItemController.js
```

## Refactor Rules

Refactor allowed: NO
Migration allowed: NO
Deletion allowed: NO
Architecture cleanup allowed: NO

This is a verification assignment first.

## If Verification Fails

Report the exact failing checkpoint.

Use this format:

```txt
Failure checkpoint:
Request path:
Payload summary:
Response/error:
Suspected file:
Minimal recommended next assignment:
```

Do not patch broadly.

## Verification Report Required

Create:

```txt
docs/mission-b/inbox/VERIFY-E2E-001.md
```

Report must include:

1. Boot docs read
2. Test environment
3. Branch / employee context
4. Template product used
5. Operational lookup result before commit
6. QuickStock commit request path
7. QuickStock commit response summary
8. Operational Product created/adopted result
9. BranchPrice verification
10. StockItem / SimpleLot verification
11. StockMovement verification
12. StockBalance verification
13. Product List / POS search verification after commit
14. Screenshots/log snippets if available
15. PASS / FAIL conclusion
16. Remaining Mission B debt

## Completion Response

Report back only:

```txt
Verification report path:
PASS/FAIL:
Commit SHA if any:
Files changed if any:
Next recommended checkpoint:
```
