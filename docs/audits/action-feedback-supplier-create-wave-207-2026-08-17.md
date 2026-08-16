# Wave 207 — Supplier Create cross-context authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-207`
Base: `feature/action-feedback-residual-wave-206`

## Residual found

`SupplierCreateWorkspace.jsx` already had a synchronous mutation ref, payload normalization, UI locking, and ADS feedback. The remaining defect was route/branch ownership after persistence.

The create command captured a payload and list path, but the page did not bind the in-flight request to the current `shopSlug` and `branchId`. If the operator changed store or branch while creation was in flight, the old request could still navigate using its previous destination and unconditionally release shared mutation state in the new context.

## Change

- Added `createContextRef` for the current shop/branch authority.
- Added `createRequestRef` for request sequencing.
- Context changes invalidate the previous create owner and release the new workspace from the old request lock.
- Create commands snapshot shop slug, branch id, payload, and list destination before persistence.
- Successful persistence navigates only while the original request still owns the current context.
- If the supplier was created successfully but the context changed, the page reports partial success through `supplier:create:<branchId>:context-changed:error` and does not redirect.
- Error/finally state writes are limited to the current owner.
- Success and failure feedback are branch scoped.

## Contract

`tests/supplier-create-cross-context-authority.contract.test.js` locks request sequencing, context snapshots, ownership checks, branch-scoped events, and the partial-success boundary.

## Scope

Expected changed files only:

1. `src/features/supplier/workspace/SupplierCreateWorkspace.jsx`
2. `tests/supplier-create-cross-context-authority.contract.test.js`
3. `docs/audits/action-feedback-supplier-create-wave-207-2026-08-17.md`
