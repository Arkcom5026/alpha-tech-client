# Wave 208 — Supplier Legacy Update cross-context authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-208`
Base: `feature/action-feedback-residual-wave-207`

## Residual found

`SupplierLegacyUpdateWorkspace.jsx` remained materially behind the modern Supplier edit/create workspaces. It used React `loading` as the only update guard, had no request sequencing for supplier reads, and allowed an in-flight legacy update to use route-derived navigation after supplier/shop/branch context had changed.

A stale `getSupplierById()` response could overwrite a newer supplier context, and `finally` from an old update could release loading state in the new workspace.

## Change

- Added synchronous `mutationRef` ownership.
- Added `supplierContextRef` covering supplier id, shop slug, and branch id.
- Added separate read and update request sequencing refs.
- Supplier reads snapshot entity/branch authority and discard stale results.
- Legacy update snapshots supplier id, shop slug, branch id, payload, and destination before persistence.
- Success navigation occurs only when the original request still owns the current context.
- Successful persistence after a context change emits `supplier:legacy:<supplierId>:update:context-changed:error` and does not navigate.
- Error/finally writes are restricted to the current request owner.
- Load/update feedback is entity-scoped.

## Contract

`tests/supplier-legacy-update-cross-context-authority.contract.test.js` locks the synchronous mutation guard, context/ref sequencing, immutable command snapshots, and entity-scoped context-change/success/error outcomes.

## Scope

Expected changed files only:

1. `src/features/supplier/workspace/SupplierLegacyUpdateWorkspace.jsx`
2. `tests/supplier-legacy-update-cross-context-authority.contract.test.js`
3. `docs/audits/action-feedback-supplier-legacy-update-wave-208-2026-08-17.md`
