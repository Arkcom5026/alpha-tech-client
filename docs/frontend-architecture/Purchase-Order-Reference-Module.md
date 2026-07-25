# Purchase Order Reference Module

## Program
P1 Frontend Architecture Elevation

## Role
Purchase Order is the first P1 frontend module to be elevated into a production-proven reference for modular ownership.

## Why Purchase Order
Purchase Order sits near the beginning of the product lifecycle and connects supplier selection, product selection, cost, receiving, inventory, document history, and printing. Its boundaries therefore provide a useful template for other POS/ERP modules.

## Current Workflow Surfaces

```text
List
Create
Edit
Detail
Print
Receiving handoff
```

## Current Stabilization Achievements
- canonical route ownership established
- canonical Purchase Order API owner established
- create/edit form logic split into focused hooks
- list data loading extracted from the page
- legacy duplicate and persistence-shaped frontend files removed
- create/update payloads aligned with backend handlers
- edit restriction aligned to PENDING status

These achievements form the stabilization baseline, not the final reference architecture.

## Target Ownership Structure
The exact directories should be created only when a real responsibility exists.

```text
purchaseOrder/
  api/
  contracts/
  builders/
  policies/
  models/
  mappers/
  projections/
  stores/
  hooks/

  list/
    pages/
    controllers-or-hooks/
    components/

  create/
    pages/
    controllers-or-hooks/
    components/
    validation/

  edit/
    pages/
    controllers-or-hooks/
    components/
    validation/

  detail/
  print/

  shared/
    only module-neutral primitives proven safe to share
```

## Ownership Decisions

### API owner
`api/` owns endpoint and HTTP communication. Components, pages, and stores must not call the raw HTTP client directly.

### Workflow owner
Each route workflow owns its page-specific coordination and workflow-bound UI.

### Policy owner
Rules such as `canEditPurchaseOrder`, `canReceivePurchaseOrder`, and `canCancelPurchaseOrder` belong to pure policies rather than JSX conditions or duplicated hook checks.

### Builder owner
Create and update payload construction belongs to builders. React hooks supply internal state; builders produce contract-aligned commands.

### Mapper owner
API purchase order records and line items are normalized by mappers before workflow code consumes them.

### Projection owner
List rows, detail summaries, status labels, and other UI-ready representations are produced by projections rather than being assembled repeatedly inside pages.

### Store owner
The store retains only server-backed or cross-route runtime state that has multiple legitimate consumers. Page-local form state remains local unless continuity requirements prove otherwise.

## Migration Sequence

1. Survey files, imports, routes, and active consumers.
2. Record old path -> new owner mapping.
3. Migrate pure logic: policies, builders, mappers, response extractors, projections.
4. Reconnect existing hooks to the new owners without changing behavior.
5. Move workflow-bound UI into list/create/edit/detail/print ownership.
6. Move route entry pages after their dependencies are stable.
7. Audit stores and temporary compatibility exports.
8. Remove old paths only when repository consumers and runtime flows are verified.
9. Run operational flow through receiving and inventory consequences.
10. Update this document with the final proven directory tree and dependency diagram.

## Non-goals During Initial Migration
- no redesign of business workflow
- no endpoint changes unless a confirmed defect requires them
- no global shared-component extraction based only on visual similarity
- no broad rewrite
- no claim of runtime completion from repository inspection alone

## Required Operational Evidence

```text
Create PO
-> open Detail
-> edit while PENDING
-> reject edit after receiving starts
-> print
-> hand off to receiving
-> confirm downstream stock/cost behavior
```

## Reference Declaration Rule
Purchase Order becomes the official P1 frontend reference module only after:
- Repository Gate passes
- Runtime Gate passes
- Operational Gate passes
- old architecture owners and bridges are removed or explicitly documented
- final structure and review checklist reflect the code that actually ran
