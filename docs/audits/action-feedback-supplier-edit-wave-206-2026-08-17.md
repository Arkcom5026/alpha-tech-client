# Wave 206 — Supplier Edit cross-entity authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-206`
Base: `feature/action-feedback-residual-wave-205`

## Residual found

`SupplierEditWorkspace.jsx` already had synchronous mutation serialization and immutable supplier/payload snapshots, but the remaining defect was cross-entity ownership across supplier, shop, and branch route context.

The previous read path could let a stale supplier response write into a newer supplier context. Update/delete also used a live route-derived list path and unconditionally released shared mutation state in `finally`, so a mutation started for Supplier A could finish after the workspace moved to Supplier B, another shop, or another branch and then navigate/release state in the new context.

## Change

- Added `supplierContextRef` as the current supplier/shop/branch authority.
- Added `loadRequestRef` to sequence supplier reads and discard stale responses.
- Added `mutationRequestRef` to sequence update/delete ownership.
- Route identity changes invalidate prior read/mutation owners and reset the new workspace state.
- Update/delete snapshot supplier id, shop slug, branch id, payload/list destination before persistence.
- Success navigation happens only while the original command still owns the current workspace context.
- Persistence success followed by context change reports partial success through entity-scoped `context-changed:error` feedback rather than redirecting the user into the old supplier context.
- Error/finally state writes are limited to the current owner.
- Supplier load/update/delete feedback is now supplier-scoped.

## Contract

`tests/supplier-edit-cross-entity-authority.contract.test.js` locks the context ref, read/mutation sequencing, immutable route snapshots, entity-scoped feedback, and context-change boundaries.

## Scope

Expected changed files only:

1. `src/features/supplier/workspace/SupplierEditWorkspace.jsx`
2. `tests/supplier-edit-cross-entity-authority.contract.test.js`
3. `docs/audits/action-feedback-supplier-edit-wave-206-2026-08-17.md`

## Checkpoint note

Residuals after Wave 206 are increasingly isolated cross-context/stale-async edges rather than missing basic confirmation or toast behavior. Continue scanning, but prepare to close the agenda once the next broad residual checkpoint no longer finds material user-facing mutation/feedback defects.
