# Wave 211 — Employee Role Management mutation authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-211`
Base: `feature/action-feedback-residual-wave-210`

## Residual found

`ManageRolesWorkspace.jsx` still relied on React render state (`changingRole` / `changingEmployeeId`) as the primary authority for two privileged employee mutations: Role changes and activate/suspend lifecycle changes.

That leaves a same-tick duplicate-submit window before React commits the loading state. The command also retained the full pending employee object instead of freezing only the identifiers and requested mutation intent that must define persistence and feedback identity.

## Change

- Added shared synchronous `mutationRef` ownership across Role and lifecycle mutations.
- Role changes snapshot `employeeId`, `userId`, and `nextRole` before persistence.
- Lifecycle changes snapshot `employeeId` and `nextActive` before persistence.
- Render-visible `mutating` now includes synchronous mutation ownership.
- Success and error feedback is employee-scoped and operation-scoped.
- `finally` only releases the synchronous owner matching the command type and employee id.

## Event authority

- `employee:<employeeId>:role:update:success`
- `employee:<employeeId>:role:update:error`
- `employee:<employeeId>:role-lifecycle:activate:success/error`
- `employee:<employeeId>:role-lifecycle:suspend:success/error`

## Contract

`tests/employee-role-management-mutation-authority.contract.test.js` locks the shared synchronous authority, immutable command snapshots, entity-scoped feedback identity, and render-visible lock integration.

## Scope

Expected changed files only:

1. `src/features/employee/workspaces/ManageRolesWorkspace.jsx`
2. `tests/employee-role-management-mutation-authority.contract.test.js`
3. `docs/audits/action-feedback-employee-role-management-wave-211-2026-08-17.md`
