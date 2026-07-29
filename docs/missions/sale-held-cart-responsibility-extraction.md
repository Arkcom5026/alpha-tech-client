# Sale Held Cart Responsibility Extraction

## Mission

Extract the held-cart workflow from `CreateSalePage.jsx` by runtime responsibility, not by visual fragments or line count.

## Architecture Goal

`CreateSalePage.jsx` must remain the Sale create composition page while delegating held-cart behavior to explicit feature-owned owners.

## Responsibility Owners

### Held Cart Session Owner

Owns active cart identity, validation snapshot, save state, panel visibility, and current-cart lifecycle.

### Autosave Owner

Owns debounce scheduling, serialized persistence, pending/saving/saved/failed transitions, and autosave cleanup.

### Recovery Owner

Owns loading a held cart, server revalidation, mapping persisted lines back to sale lines, replacement protection, customer/price restoration, and focus handoff.

### Projection Owner

Owns the stable view model consumed by the Create Sale composition page and held-cart presentation.

### Presentation Owner

`PosHeldCartPanel` remains presentation/workspace UI. It must receive commands and state from the held-cart workflow owner rather than causing `CreateSalePage` to own recovery internals.

## Required Invariants

1. Existing held-cart search/list panel remains available.
2. Existing autosave behavior remains.
3. Existing optimistic-version persistence remains.
4. Existing server revalidation before sale completion remains.
5. Existing unavailable-item and changed-price warnings remain.
6. Existing customer, price type, and sale line restoration remain.
7. Existing requirement that an active held cart cannot be reduced to zero lines remains.
8. No Customer, Payment, Repair, or backend behavior is redesigned in this increment.
9. This increment is stacked on PR #26 and must not be merged before its base responsibility extraction.

## Authorized Structure

- `src/features/sales/create/held-cart/hooks/useSaleHeldCart.js`
- `src/features/sales/create/held-cart/hooks/useSaleHeldCartAutosave.js`
- `src/features/sales/create/held-cart/services/saleHeldCartRecovery.js`
- `src/features/sales/create/held-cart/projections/saleHeldCartProjection.js`
- `src/features/sales/create/held-cart/index.js`
- focused wiring changes in `src/features/sales/create/pages/CreateSalePage.jsx`
- repository contract evidence

## Non-goals

- Held-cart API contract changes
- database changes
- visual redesign
- customer-search changes
- sale completion redesign
- runtime or operational certification without executable evidence

## Verification Boundary

Repository evidence can prove ownership, isolation, exports, and entrypoint delegation. Runtime and Operational PASS require executable evidence.