# ASSIGNMENT-018 — QuickStock Existing Product Edit + Local Product Creation Flow Design

Assigned Role: FE-01 Runtime Owner
Status: APPROVED FOR FLOW DESIGN
Implementation: LOCKED unless ROLE-ARCH approves after design

## Mission Context

Mission B is an end-to-end QuickStock / Product Onboarding workflow mission.

Current operational status:

```txt
B-Flow 1: Template → Add/receive into branch
Status: Operationally working

B-Flow 2: Product already added to branch → edit/update from QuickStockPage
Status: FE runtime/design incomplete

B-Flow 3: Store-created local product without ProductTemplate
Status: Not designed yet
```

This assignment covers B-Flow 2 and B-Flow 3 design only.

## Required Boot

Read in this order:

```txt
docs/roles/README.md
docs/roles/frontend/FE-01-RUNTIME.md
docs/mission-b/WORKSPACE.md
docs/mission-b/BLACKBOARD.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-STATUS.md
docs/mission-b/inbox/ROLE-ARCH/HANDOVER-001.md
docs/mission-b/inbox/ROLE-ARCH/SUCCESSOR-BOOT-001.md
docs/mission-b/assignments/FE-01/ASSIGNMENT-018.md
```

## Source Files To Inspect

Inspect only; do not modify in this assignment unless ROLE-ARCH explicitly allows after report.

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
src/features/product/components/quick-stock/ProductMasterPanel.jsx
src/features/product/components/quick-stock/CommitBar.jsx
src/features/product/api/productApi.js
src/features/product/store/productStore.js
```

Optional only if needed:

```txt
src/features/product/components/quick-stock/*
```

## Design Questions To Answer

### Flow 2 — Existing Branch Product Edit / Update

When a product already exists in the current branch:

```txt
1. How should QuickStockPage detect that it is an operational branch product?
2. What should the operator be allowed to update directly in QuickStockPage?
3. Which fields are safe runtime fields?
4. Which fields should remain outside QuickStockPage?
5. How should price update relate to BranchPrice?
6. How should barcode/stock receive continue after edit/update?
7. Should edit/update and receive be one commit or separate actions?
8. What state should the UI show before and after update?
```

### Flow 3 — Store-Created Local Product Without ProductTemplate

When the store wants to add a product that is not in Template Catalog:

```txt
1. How does the operator decide that Template search has no suitable result?
2. What UI entry point should start local product creation?
3. What minimum fields are required to create a local operational product?
4. Should the local product have no templateProductId?
5. How should future search find this local product?
6. Does FE need a separate search mode for branch operational products vs template products?
7. Can existing backend endpoints support this, or is a BE gap likely?
8. Should local product creation be combined with receive, or created first then received?
```

## Constraints

- Do not propose BE changes unless clearly required.
- Do not assume ProductTemplate exists for local product flow.
- Preserve Runtime Catalog Separation:
  - Template Product is search/clone source.
  - Operational Product is branch runtime source of truth.
- Keep QuickStockPage focused on operator workflow.
- Avoid broad refactor.
- Prefer step-by-step safe runtime design.

## Required Deliverable

Create report:

```txt
docs/mission-b/inbox/FE-01/FLOW-DESIGN-001.md
```

Report must include:

1. Files inspected
2. Current QuickStockPage runtime summary
3. Flow 2 proposed canonical runtime
4. Flow 2 allowed fields / forbidden fields
5. Flow 2 API/store impact
6. Flow 3 proposed canonical runtime
7. Flow 3 required fields
8. Flow 3 search behavior
9. FE-only changes possible
10. BE gaps if any
11. UX handoff points for FE-02
12. Recommended next assignment
13. PASS/NEEDS_DECISION conclusion

## Completion Response

Report back only:

```txt
Report path:
PASS/NEEDS_DECISION:
Files inspected:
Backend gap: YES/NO
Next recommended owner:
```
