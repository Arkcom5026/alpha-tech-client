# Permission & Identity Dependency Verification

Status: DRAFT / VERIFIED PASS 01
Scope: Frontend permission helper and employee identity compatibility review
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Map: `docs/map/Dependency_Map.md`

---

## 1. Purpose

This document records the focused verification pass for permission helpers and employee identity compatibility during Frontend Architecture Certification.

เป้าหมายคือบันทึกผลการตรวจเฉพาะส่วน Permission helper และ Employee identity compatibility ก่อนแก้ Login/Auth

This is not an implementation plan and does not activate RBAC.

---

## 2. Files Reviewed

```txt
src/features/employee/store/employeeStore.js
src/hooks/usePermission.js
src/components/auth/RequirePermission.jsx
src/components/auth/IfPermission.jsx
```

Searches also checked:

```txt
usePermission
RequirePermission
IfPermission
```

---

## 3. employeeStore Verification

Reviewed file:

```txt
src/features/employee/store/employeeStore.js
```

Verified findings:

- The file header explicitly states Employee Store = HR / Employee Management only.
- The file header explicitly states Auth/current login branch Source of Truth is `authStore.employee.branchId`.
- The file header explicitly states Branch detail / selected branch is owned by branchStore.
- It keeps deprecated compatibility fields: `employee`, `branch`, `position`, `token`, and `role`.
- These compatibility fields are explicitly marked as deprecated and must not be used as current session Source of Truth.
- Persist config uses `migrate: () => ({})`.
- Persist config uses `partialize: () => ({})`.
- Therefore active session, branch, token, and role are not persisted by employeeStore.

Interpretation:

```txt
authStore = current Login/Auth identity owner
branchStore = branch detail / selected branch owner
employeeStore = HR / Employee Management owner
```

Risk:

```txt
MEDIUM if kept as HR/settings store
HIGH if legacy components still read deprecated employeeStore fields as current login context
```

Working rule:

Do not use employeeStore as Auth Runtime Source of Truth.

---

## 4. usePermission Verification

Reviewed file:

```txt
src/hooks/usePermission.js
```

Observed behavior:

- Imports `useEmployeeStore`.
- Imports `useCustomerStore`.
- Reads `employee` from employeeStore.
- Reads `customer` from customerStore.
- Derives `activeUser` as `employee || customer`.
- Returns helper functions:
  - `hasRole`
  - `hasPermission`
  - `hasAll`
  - `hasSome`

Interpretation:

`usePermission` does not currently read identity from authStore.

This matters because employeeStore is documented as HR / Employee Management only and not the Auth Runtime owner.

Risk:

```txt
LOW if dormant
HIGH if used for real runtime permission checks without identity-source migration
VERY HIGH if activated during Login/Auth stabilization
```

Working rule:

Do not activate permission gating during the current Auth stability agenda.

---

## 5. RequirePermission Verification

Reviewed file:

```txt
src/components/auth/RequirePermission.jsx
```

Observed behavior:

- Uses `usePermission()`.
- Accepts `role`, `permission`, and `all` props.
- Hides children by returning `null` if role or permission checks fail.
- Does not redirect.
- Does not call APIs.
- Does not mutate state.

Search status:

Repository search found only the component file and documentation references during this pass.

Interpretation:

`RequirePermission` appears to be a dormant UI visibility helper, not active route security.

Risk:

```txt
LOW if dormant
HIGH if mounted without first moving permission identity source away from deprecated employeeStore compatibility fields
```

---

## 6. IfPermission Verification

Reviewed file:

```txt
src/components/auth/IfPermission.jsx
```

Observed behavior:

- Uses `usePermission()`.
- Accepts `permission` and `all` props.
- Hides children by returning `null` if permission checks fail.
- Does not redirect.
- Does not call APIs.
- Does not mutate state.

Search status:

Repository search found only the component file and documentation references during this pass.

Interpretation:

`IfPermission` appears to be a dormant UI visibility helper, not active route security.

Risk:

```txt
LOW if dormant
HIGH if mounted without first moving permission identity source away from deprecated employeeStore compatibility fields
```

---

## 7. Discovery Log

### DISC-FE-IDENTITY-001 — employeeStore is not Auth Runtime owner

Status: VERIFIED

Evidence:

- `employeeStore.js` file header explicitly documents HR / Employee Management only.
- Deprecated session compatibility fields are present but not persisted.
- File header points current login branch truth to `authStore.employee.branchId`.

Impact:

- Future Auth refactor should not move session truth into employeeStore.
- Legacy reads of employeeStore compatibility fields need search/classification.

---

### DISC-FE-PERM-001 — Permission helpers are dormant and use non-auth identity source

Status: VERIFIED IN CURRENT SEARCH PASS

Evidence:

- `usePermission` reads employeeStore/customerStore, not authStore.
- `RequirePermission` and `IfPermission` only wrap children and do not mutate state.
- Search did not find active mounted usage beyond their own files and docs during this pass.

Impact:

- Do not activate RBAC / permission gating during Login/Auth stabilization.
- If permission gating is required later, identity source must be redesigned around authStore or a verified capability runtime.

---

## 8. Impact on Current Auth Agenda

Current Auth stabilization scope remains:

```txt
Session continuity
Access token refresh
Auth bootstrap
POS branch context after login
Reload recovery
Logout clean state
```

Still out of scope:

```txt
RBAC activation
Permission-based menu filtering
Position-based access control
Multi-branch switching
```

---

## 9. Next Verification Targets

Continue with:

```txt
src/store/rootStore.js
src/utils/branchHelpers.js
src/features/auth/pages/StaffSettingsPage.jsx
src/components/LogoutButton.jsx
src/components/common/UnifiedMainNav.jsx
src/features/superadmin/sidebar/SidebarSuperAdmin.jsx
```

Search next:

```txt
useEmployeeStore((state) => state.employee)
useEmployeeStore.getState
setSession
clearSession
setEmployee
```

---

## 10. Working Conclusion

EmployeeStore is verified as HR / Employee Management runtime, not current login session owner.

Permission helpers exist but appear dormant and currently derive identity from employeeStore/customerStore instead of authStore.

Therefore, permission/RBAC work must remain locked out of the current Login/Auth stabilization agenda.
