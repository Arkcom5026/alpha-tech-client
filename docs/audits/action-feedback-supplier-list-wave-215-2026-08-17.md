# Wave 215 — Supplier List cross-branch read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-215`
Base: `feature/action-feedback-residual-wave-214`

## Residual found

`SupplierListWorkspace` reloads the supplier list when branch context changes, but `supplierStore.fetchSuppliersAction()` previously had no request sequencing or current-branch ownership check. A slower response from branch A could therefore arrive after branch B became current and overwrite B's list, error, and loading state.

## Change

- Added `supplierListRequestSequence` as read sequencing authority.
- Added `resolveSupplierBranchId()` as the canonical branch resolver for the list read.
- Each list read snapshots `requestedBranchId` and `requestId` before persistence.
- Success, error, and finally mutate store state only while that request still owns the current branch context.
- Stale success/error outcomes return without replacing current branch state.
- `resetSupplierState()` invalidates outstanding supplier-list reads.
- No mutation API or supplier create/edit/delete behavior changed.

## Contract

`tests/supplier-list-cross-branch-read-authority.contract.test.js` locks branch snapshotting, request sequencing, stale success/error discard, loading-state ownership, and reset invalidation.

## Scope

Expected changed files only:

1. `src/features/supplier/store/supplierStore.js`
2. `tests/supplier-list-cross-branch-read-authority.contract.test.js`
3. `docs/audits/action-feedback-supplier-list-wave-215-2026-08-17.md`
