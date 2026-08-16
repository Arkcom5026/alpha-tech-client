# Wave 213 — Employee List cross-context read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-213`
Base: `feature/action-feedback-residual-wave-212`

## Residual found

`EmployeeListWorkspace.jsx` still had two material read-authority gaps.

The employee list request wrote directly into shared page state without request sequencing. A slower response from an older auth/branch/shop context could therefore overwrite the newer employee list after context changed. The load failure path was also console-only plus inline error state, so it did not participate in governed action feedback.

The Super Admin branch dropdown had the same stale-response problem and silently swallowed failures.

## Change

- Added `listContextRef` covering shop, branch, Super Admin mode, and current auth token authority.
- Added `listRequestRef` sequencing for employee-list reads.
- Added `branchOptionsRequestRef` sequencing for Super Admin branch dropdown reads.
- List requests snapshot their context before the API call and discard stale success/error/finally writes.
- Employee rows are reset when the owning context changes so old data is not displayed while the new request is in flight.
- Branch dropdown results are discarded when Super Admin ownership has changed.
- Employee-list and branch-dropdown load failures now emit governed ADS feedback.

## Event authority

- `employee:list:<branchScope>:load:error`
- `employee:list:branches:load:error`

## Contract

`tests/employee-list-cross-context-read-authority.contract.test.js` locks the context refs, request sequencing, stale-response discard, governed failure feedback, and removal of the console-only employee-list failure path.

## Scope

Expected changed files only:

1. `src/features/employee/workspaces/EmployeeListWorkspace.jsx`
2. `tests/employee-list-cross-context-read-authority.contract.test.js`
3. `docs/audits/action-feedback-employee-list-wave-213-2026-08-17.md`
