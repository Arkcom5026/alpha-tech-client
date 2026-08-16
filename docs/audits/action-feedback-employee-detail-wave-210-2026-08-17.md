# Wave 210 — Employee Detail status cross-context authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-210`
Base: `feature/action-feedback-residual-wave-209`

## Residual found

`EmployeeDetailWorkspace.jsx` still had a material authority gap in the activate/suspend lifecycle. The page used React `changingStatus` as the only mutation guard, read the live employee/status when starting the command, and allowed an in-flight status mutation to write employee state or release loading after the route changed to another employee/shop context.

The detail read also relied on component cleanup only. Route changes within the mounted workspace needed explicit request sequencing and entity-scoped feedback.

## Change

- Added synchronous `statusMutationRef` ownership.
- Added `employeeContextRef` covering employee id and shop slug.
- Added separate load/status request sequencing refs.
- Employee reads snapshot route authority and discard stale responses.
- Activate/suspend snapshots employee id, route employee id, shop slug, and target active state before persistence.
- Successful persistence after a context change emits `employee:<employeeId>:status:context-changed:error` and does not overwrite the new workspace.
- Success/error/finally writes are restricted to the current request owner.
- Status feedback is employee- and operation-scoped.
- Navigation/edit/status interactions are frozen under the same synchronous mutation authority.

## Contract

`tests/employee-detail-status-cross-context-authority.contract.test.js` locks the context/request refs, immutable command snapshots, stale-context outcome, entity-scoped success/error events, and render-visible mutation lock.

## Scope

Expected changed files only:

1. `src/features/employee/workspaces/EmployeeDetailWorkspace.jsx`
2. `tests/employee-detail-status-cross-context-authority.contract.test.js`
3. `docs/audits/action-feedback-employee-detail-wave-210-2026-08-17.md`
