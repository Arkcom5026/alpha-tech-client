# Wave 209 — Employee Legacy Edit cross-context authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-209`
Base: `feature/action-feedback-residual-wave-208`

## Residual found

`LegacyEmployeeFormWorkspace.jsx` remained materially behind the modern Employee edit workspace. It used React `submitting` as the only mutation guard, had no request sequencing for employee reads, and allowed an in-flight legacy update to navigate using route context after the employee/shop identity had changed.

A stale `getEmployeeById()` response could also write Employee A into a later Employee B context because the legacy read only used effect cleanup and did not sequence overlapping route/token loads.

## Change

- Added synchronous `submittingRef` ownership.
- Added `employeeContextRef` covering employee id and shop slug.
- Added separate read and update request sequencing refs.
- Employee reads snapshot entity/shop authority and discard stale results.
- Legacy update snapshots employee id, shop slug, and form payload before persistence.
- Success navigation occurs only while the original request still owns the current route context.
- Successful persistence after a context change emits `employee:legacy-update:<employeeId>:context-changed:error` and does not navigate.
- Error/finally writes are restricted to the current request owner.
- Load/update feedback is employee-scoped.
- Form and back navigation use the synchronous mutation lock as well as render state.

## Contract

`tests/employee-legacy-edit-cross-context-authority.contract.test.js` locks synchronous submit ownership, context/request sequencing, immutable command snapshots, entity-scoped feedback, and owner-only release.

## Scope

Expected changed files only:

1. `src/features/employee/workspaces/LegacyEmployeeFormWorkspace.jsx`
2. `tests/employee-legacy-edit-cross-context-authority.contract.test.js`
3. `docs/audits/action-feedback-employee-legacy-edit-wave-209-2026-08-17.md`
