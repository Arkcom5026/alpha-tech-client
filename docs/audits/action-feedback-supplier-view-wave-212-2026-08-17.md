# Wave 212 — Supplier View cross-context read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-212`
Base: `feature/action-feedback-residual-wave-211`

## Residual found

`SupplierViewWorkspace.jsx` still had an ungoverned async read path. `getSupplierById(id)` could resolve after the route supplier, shop slug, or selected branch changed and overwrite the new Supplier View context with stale data. The load failure path also used `console.error` plus inline state only, so the action-feedback standard did not surface a governed user-facing load event.

## Change

- Added `supplierContextRef` covering supplier id, shop slug, and selected branch id.
- Added `loadRequestRef` sequencing for supplier reads.
- Each load snapshots supplier id, shop slug, branch id, and context key before the request.
- Stale success/error/finally outcomes are discarded when request ownership or context no longer matches.
- Supplier and error state are reset when context changes so the previous entity is not shown under a new route.
- Replaced the console-only failure path with ADS `feedback.actionError`.
- Load feedback identity is entity-scoped as `supplier:view:<supplierId>:load:error`.

## Contract

`tests/supplier-view-cross-context-read-authority.contract.test.js` locks the context/ref sequencing, immutable read snapshots, ADS entity-scoped error event, and removal of the console-only failure path.

## Scope

Expected changed files only:

1. `src/features/supplier/workspace/SupplierViewWorkspace.jsx`
2. `tests/supplier-view-cross-context-read-authority.contract.test.js`
3. `docs/audits/action-feedback-supplier-view-wave-212-2026-08-17.md`
