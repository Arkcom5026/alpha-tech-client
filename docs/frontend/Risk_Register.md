# Frontend Risk Register

Status: DRAFT / ACTIVE
Scope: Frontend Architecture Certification
Repository: alpha-tech-client
Related Index: `docs/frontend/README.md`
Related Blueprint: `docs/blueprint/Active_Blueprint.md`

---

## 1. Purpose

This file records frontend architecture risks discovered during certification.

ไฟล์นี้ใช้บันทึกความเสี่ยงของ Frontend ที่พบจากการอ่านไฟล์จริง เพื่อใช้วางแผนก่อน Refactor

---

## 2. Risk Levels

```txt
CRITICAL — can break login/session/store operation broadly
HIGH     — can break important runtime flows or create regression
MEDIUM   — important but limited to a smaller surface
LOW      — safe if kept dormant or unchanged
```

---

## 3. Active Risk Register

### RISK-FE-001 — Branch ownership is mixed

Level: CRITICAL

Current state:

- AuthStore owns employee identity and branchId.
- BranchStore owns currentBranch and selectedBranchId.
- BranchStore also owns online auto-selection behavior.
- HeaderPos can reload branch from selectedBranchId.

Impact:

POS branch identity may drift from authenticated employee branch.

Required decision:

```txt
POS branch identity must be anchored to authStore.employee.branchId.
Online branch selection must remain separate from POS branch identity.
```

Related docs:

- `docs/map/Data_Ownership_Map.md`
- `docs/map/Runtime_Flow_Map.md`
- `docs/map/Branch_Navigation_Cart_Dependency_Verification.md`

---

### RISK-FE-002 — Logout redirect ownership is split

Level: HIGH

Current state:

- authStore.logoutAction forces `window.location.href = '/login'`.
- HeaderPos calls clearBranch, logoutAction, then navigate('/').
- UnifiedMainNav calls logoutAction and navigate('/').
- LogoutButton calls logout and navigate('/login').
- SidebarSuperAdmin calls logoutAction but does not navigate.

Impact:

Logout may redirect inconsistently depending on UI surface.

Required decision:

```txt
Either authStore owns redirect, or UI callers own redirect. Avoid both.
```

Related docs:

- `docs/map/Dependency_Map.md`
- `docs/map/Data_Ownership_Map.md`

---

### RISK-FE-003 — URL shopSlug can drift from authenticated branchSlug

Level: HIGH

Current state:

- POS routes use `/:shopSlug/pos`.
- Header and Sidebar build navigation from URL shopSlug.
- LoginPage redirects POS staff using employee.branchSlug or fallback `general-pos`.
- AppRouter catch-all redirects to hardcoded `/advancetech/pos/dashboard`.

Impact:

User can be on a URL slug that does not match authenticated branch.

Required decision:

```txt
Define canonical POS slug rule before route guard or auth refactor.
```

Related docs:

- `docs/map/Runtime_Flow_Map.md`
- `docs/map/Data_Ownership_Map.md`
- `docs/map/Login_Checkout_Dependency_Verification.md`

---

### RISK-FE-004 — Session recovery depends on refresh chain

Level: CRITICAL

Current state:

- authStore does not persist token/session/employee/customer.
- apiClient uses withCredentials and refresh queue.
- bootstrapAuthAction calls `/auth/refresh` when no in-memory token exists.
- verifySessionAction then calls `/auth/me`.

Impact:

If cookie, baseURL, refresh response, or verify flow fails, user may appear logged out.

Required decision:

```txt
Document and test refresh chain before backend changes.
```

Related docs:

- `docs/map/Runtime_Flow_Map.md`
- `docs/map/Dependency_Map.md`

---

### RISK-FE-005 — Route guard exists but appears dormant

Level: HIGH if activated prematurely

Current state:

- ProtectedRoute exists.
- Reviewed AppRouter and POS route tree do not mount it.
- It is defensive against bootstrap redirects, but not active in reviewed POS route tree.

Impact:

Activating it broadly may affect all POS modules at once.

Required decision:

```txt
Do not activate route guard during mapping. Add guard only after Auth Runtime rules are certified.
```

Related docs:

- `docs/map/Dependency_Map.md`

---

### RISK-FE-006 — RBAC / permission helpers are dormant and use non-auth identity

Level: HIGH if activated prematurely

Current state:

- usePermission reads employeeStore/customerStore, not authStore.
- employeeStore is documented as HR / Employee Management only.
- RequirePermission and IfPermission are not active security boundaries in reviewed usage.

Impact:

Activating permission gating now may use the wrong identity source.

Required decision:

```txt
Keep RBAC out of current Auth stabilization.
```

Related docs:

- `docs/map/Permission_Identity_Dependency_Verification.md`
- `docs/map/Dependency_Map.md`

---

### RISK-FE-007 — LoginAction is shared by POS and online checkout

Level: HIGH

Current state:

- POS LoginPage uses authStore.loginAction.
- Online LoginForm also uses authStore.loginAction.
- Online checkout expects token/customer/cart behavior.

Impact:

Changing loginAction return shape or identity behavior can break online checkout.

Required decision:

```txt
Test POS login and online checkout login together during Auth refactor.
```

Related docs:

- `docs/map/Login_Checkout_Dependency_Verification.md`

---

### RISK-FE-008 — Checkout uses both currentBranch.id and selectedBranchId

Level: HIGH

Current state:

- Checkout fetches branch prices using currentBranch.id.
- Checkout submits order using selectedBranchId.

Impact:

Online order branch truth may be inconsistent.

Required decision:

```txt
Choose one online checkout branch truth before changing branch runtime.
```

Related docs:

- `docs/map/Login_Checkout_Dependency_Verification.md`
- `docs/map/Branch_Navigation_Cart_Dependency_Verification.md`

---

## 4. Dormant Risk Register

### DORMANT-FE-001 — Sidebar capability metadata

Status: DORMANT

Risk if activated:

HIGH

Rule:

Do not activate permission-based menu filtering during Auth stabilization.

---

### DORMANT-FE-002 — employeeStore compatibility fields

Status: COMPATIBILITY / LEGACY RISK

Risk if treated as session owner:

HIGH

Rule:

employeeStore is HR/Employee Management only. Do not treat it as Login/Auth source of truth.

---

## 5. Certification Gate

Frontend Auth refactor should not begin until these are decided:

```txt
1. POS branch ownership rule
2. Online branch ownership rule
3. Logout redirect ownership rule
4. Route shopSlug / branchSlug canonical rule
5. apiClient refresh failure handling rule
```
