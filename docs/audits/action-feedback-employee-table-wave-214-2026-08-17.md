# Wave 214 — Employee Table status reconciliation authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-214`
Base: `feature/action-feedback-residual-wave-213`

## Residual found

`EmployeeTable.jsx` still treated the list status toggle as a render-state guarded mutation. The persistence success feedback was emitted before `onRefresh` and the refresh callback was not awaited. If the employee status persisted successfully but the list reload failed, the UI could show success while leaving stale rows without a governed partial-success outcome. Same-tick duplicate confirmation was also still possible before React committed `toggling`.

## Change

- Added synchronous `toggleRef` ownership for activate/suspend commands.
- Confirmation now freezes only employee id, display name, and requested active state instead of retaining the full row as mutation authority.
- Mutation uses immutable `employeeIdSnapshot` and `nextActiveSnapshot`.
- Persistence success remains distinct from reconciliation.
- `onRefresh()` is awaited and its observable `{ ok, stale }` outcome from Employee List is inspected.
- A non-stale refresh failure emits partial-success warning `employee:<id>:list-<operation>:refresh:error` instead of being misclassified as persistence failure.
- Success/error feedback is employee- and operation-scoped.
- Adjacent edit navigation and additional toggles remain frozen while the synchronous mutation owner exists.

## Event authority

- `employee:<employeeId>:list-activate:success/error`
- `employee:<employeeId>:list-suspend:success/error`
- `employee:<employeeId>:list-activate:refresh:error`
- `employee:<employeeId>:list-suspend:refresh:error`

## Contract

`tests/employee-table-status-reconciliation-authority.contract.test.js` locks synchronous ownership, immutable intent snapshots, observable list reconciliation, partial-success feedback, and interaction freeze.

## Scope

Expected changed files only:

1. `src/features/employee/components/EmployeeTable.jsx`
2. `tests/employee-table-status-reconciliation-authority.contract.test.js`
3. `docs/audits/action-feedback-employee-table-wave-214-2026-08-17.md`
