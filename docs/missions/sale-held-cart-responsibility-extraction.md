# Sale Held Cart Responsibility Extraction

## Mission

Extract the held-cart workflow from `CreateSalePage.jsx` by runtime responsibility, not by visual fragments or line count.

## Architecture Goal

Follow the established Purchase Order composition model:

```text
CreateSalePage
  -> useSaleHeldCartWorkflow
      -> useSaleHeldCart
      -> useSaleHeldCartAutosave
      -> useSaleHeldCartRecovery
      -> executeSaleHeldCartLoad
      -> projectSaleHeldCartWorkflow
```

`CreateSalePage.jsx` remains the Sale create composition page while consuming one held-cart public workflow boundary.

## Responsibility Owners

### Workflow Orchestrator

`useSaleHeldCartWorkflow` composes the session, autosave, and recovery owners and returns the projected public workflow state. It must not duplicate state owned by child hooks.

### Held Cart Session Owner

Owns active cart identity, validation snapshot, save state, panel visibility, and current-cart lifecycle.

### Autosave Owner

Owns debounce scheduling, serialized persistence, pending/saving/saved/failed transitions, optimistic version authority, and autosave cleanup.

### Recovery Runtime Owner

Owns applying a loaded held cart to the active Sale runtime: sale lines, customer identity, price type, warning, panel close, save state, and product-search focus handoff.

### Load Controller

`executeSaleHeldCartLoad` owns the framework-independent load/revalidate execution and returns a stable result contract.

### Pure Recovery and Integration Policies

Own persisted-line mapping, warning projection, final-line removal policy, restore result composition, and completion guard without React or Store ownership.

### Workflow Projection Owner

Owns the stable state and command surface consumed by the Create Sale composition page.

### Presentation Owner

`PosHeldCartPanel` remains presentation/workspace UI. It receives commands and state from the held-cart workflow boundary rather than causing `CreateSalePage` to own recovery internals.

## Required Invariants

1. Existing held-cart search/list panel remains available.
2. Existing autosave behavior remains debounced and serialized.
3. Existing optimistic-version persistence remains.
4. Existing server revalidation before sale completion remains.
5. Existing unavailable-item and changed-price warnings remain.
6. Existing customer, price type, and sale line restoration remain.
7. Existing requirement that an active held cart cannot be reduced to zero lines remains.
8. `CreateSalePage` must consume one workflow boundary and must not directly compose the child owners after cutover.
9. No Customer, Payment, Repair, or backend behavior is redesigned in this increment.
10. This increment is stacked on PR #26 and must not be merged before its base responsibility extraction.

## Authorized Structure

- `src/features/sales/create/held-cart/hooks/useSaleHeldCartWorkflow.js`
- `src/features/sales/create/held-cart/hooks/useSaleHeldCart.js`
- `src/features/sales/create/held-cart/hooks/useSaleHeldCartAutosave.js`
- `src/features/sales/create/held-cart/hooks/useSaleHeldCartRecovery.js`
- `src/features/sales/create/held-cart/controllers/saleHeldCartLoadController.js`
- `src/features/sales/create/held-cart/services/saleHeldCartRecovery.js`
- `src/features/sales/create/held-cart/services/saleHeldCartIntegration.js`
- `src/features/sales/create/held-cart/projections/saleHeldCartProjection.js`
- `src/features/sales/create/held-cart/projections/saleHeldCartWorkflowProjection.js`
- `src/features/sales/create/held-cart/index.js`
- focused atomic wiring changes in `src/features/sales/create/pages/CreateSalePage.jsx`
- repository contract evidence

## Non-goals

- Held-cart API contract changes
- database changes
- visual redesign
- customer-search changes
- sale completion redesign
- runtime or operational certification without executable evidence

## Verification Boundary

Repository evidence can prove ownership, isolation, exports, orchestration shape, and later entrypoint delegation. Runtime and Operational PASS require executable evidence.
