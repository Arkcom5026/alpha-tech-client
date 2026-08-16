# Wave 205 — Employee Edit cross-entity authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-205`
Base: `feature/action-feedback-residual-wave-204`

## Residual found

`EmployeeEditWorkspace.jsx` already had a synchronous submit ref, immutable form snapshot, and ADS success/error feedback. The remaining defect was cross-entity ownership when the route changed while an employee update was still in flight.

The persistence command snapshots `id`, but the old flow still used live `shopSlug` for navigation and unconditionally released the shared submit state in `finally`. Therefore an update started for Employee A could finish after the workspace had moved to Employee B or another shop and then navigate/release state in the new context.

## Change

- Added `employeeContextRef` for current employee/shop ownership.
- Added `updateRequestRef` for request sequencing.
- Route identity changes invalidate the previous update owner and reset the new workspace state.
- Update commands snapshot employee id, shop slug, and form payload before persistence.
- Success navigation only occurs while the original request still owns the current route context.
- A successful persistence followed by a context change is reported as partial success with `employee:update:<employeeId>:context-changed:error` instead of redirecting the user into the old shop context.
- Error and finally state writes are limited to the current owner.
- Employee load feedback is now employee-scoped.

## Contract

`tests/employee-edit-cross-entity-authority.contract.test.js` locks the context ref, request sequencing, immutable route snapshots, entity-scoped feedback, and ownership checks.

## Scope

Expected changed files only:

1. `src/features/employee/workspaces/EmployeeEditWorkspace.jsx`
2. `tests/employee-edit-cross-entity-authority.contract.test.js`
3. `docs/audits/action-feedback-employee-edit-wave-205-2026-08-17.md`
