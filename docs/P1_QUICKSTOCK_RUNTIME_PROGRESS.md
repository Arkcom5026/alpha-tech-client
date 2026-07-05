# P1 QuickStock Runtime Progress — Frontend

Last updated: 2026-07-05
Status: STABILIZED STRUCTURE / READY FOR NEXT TASK

## Purpose

This document records the current QuickStock frontend state so a new task can continue without re-reading the whole conversation.

QuickStock has been separated from the old large product page into its own runtime feature under Product. The goal is Runtime Feature Isolation: each product workflow can be improved independently without accidentally affecting another workflow.

## Current frontend structure

```text
src/features/product/
  create/
  quick-stock/
    api/
      quickStockApi.js
    components/
      QuickStockCommitBar.jsx
      QuickStockFinderPanel.jsx
      QuickStockReceiveTable.jsx
      QuickStockSerialDialog.jsx
      QuickStockSummary.jsx
      QuickStockToolbar.jsx
    hooks/
      useQuickStockRuntimeController.js
      useQuickStockDiscoveryController.js
      useQuickStockProductController.js
      useQuickStockQueueController.js
      useQuickStockCommitController.js
    pages/
      QuickStockPage.jsx
    store/
      quickStockRuntimeStore.js
    utils/
      quickStockRuntimeUtils.js
```

## Important architecture decisions

1. QuickStock is now isolated under `src/features/product/quick-stock/`.
2. `QuickStockPage.jsx` is now primarily a UI composition page.
3. Runtime behavior is split by domain hooks:
   - Discovery: search, filters, selected product/template/operational product.
   - Product: adopt/create/edit/delete operational product.
   - Queue: barcode queue, serial refs, queue validation surface.
   - Commit: intake payload, commit readiness, commit action.
4. `quickStockRuntimeStore.js` is the QuickStock-specific store boundary.
5. The page no longer depends directly on the old `quickReceiveStore`.
6. `quickStockApi.js` still delegates to existing low-level QuickReceive API files for now. This is accepted temporarily, because the store/controller dependency on `quickReceiveStore` has already been removed.
7. Debug log `console.log("[QuickStock] onboarding state", ...)` has been removed.

## Runtime flow currently working

The following flow has been visually confirmed in the app:

```text
Template Product selected
  ↓
Check if operational product exists in branch
  ↓
Create Operational Product from Template if needed
  ↓
Adopt created Operational Product
  ↓
Runtime state becomes OPERATIONAL_READY
```

Observed successful UI state:
- Template product can be selected.
- Operational Product can be created from Template.
- Success toast appears.
- Left product card changes to the branch Operational Product.
- Runtime no longer remains stuck in Template-only state.

## Current request behavior to watch

After selecting ProductType, the frontend may still issue duplicate request groups:

```text
/api/products/pos/search
/api/products/template/search
/api/quick-stock/dropdowns
```

This is not currently a crash, but it is a cleanup/optimization target. Likely causes:
- `useQuickStockDiscoveryController` has effects tied to `selectedProductTypeId` and `executeProductSearch`.
- Manual handlers in `QuickStockPage.jsx` also call `executeProductSearch` immediately after changing filters.

Recommended future improvement:
- Make filter changes update state only.
- Use one debounced/effect-driven search source of truth.
- Avoid invoking both handler-driven search and effect-driven search for the same filter change.

## Known frontend technical debt

1. `quickStockApi.js` still imports from:
   - `@/features/quickReceive/api/quickReceiveApi`
   - `@/features/quickReceive/api/quickReceiveProductApi`

   This is temporary. Future target:

   ```text
   quick-stock/api/
     quickStockApi.js
     quickStockDropdownApi.js
     quickStockProductApi.js
     quickStockCommitApi.js
   ```

2. `QuickStockPage.jsx` still contains many inline event handlers. It is acceptable for now, but future cleanup can move page event orchestration into domain controllers.
3. QuickStock local-create form lives inside the page. Future cleanup can extract it into a component.
4. The frontend has not yet fully removed semantic naming overlap with QuickReceive. The runtime is isolated, but API filenames still show the transitional dependency.

## Suggested next frontend tasks

Recommended order:

1. Stabilization test pass:
   - Open QuickStock page.
   - Select ProductType.
   - Search/select Template Product.
   - Create Operational Product from Template.
   - Scan/add barcode to queue.
   - Commit receive.

2. Remove duplicate API calls:
   - Centralize search trigger.
   - Ensure dropdown reload happens only when needed.

3. Finish QuickStock API isolation:
   - Stop importing low-level QuickReceive API modules from QuickStock API.
   - Point QuickStock API files directly to QuickStock backend endpoints.

4. Component cleanup:
   - Extract local create form from page.
   - Keep page as pure composition.

## Commit guidance

For future work, keep commits separated:

- `refactor(quick-stock): reduce duplicate search effects`
- `refactor(quick-stock): isolate api from quickReceive api`
- `refactor(quick-stock): extract local create panel`

Do not mix QuickStock changes with Product Create changes unless the task explicitly touches both.
