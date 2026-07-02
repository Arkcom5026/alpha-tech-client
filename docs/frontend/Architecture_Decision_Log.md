# Architecture Decision Log

Status: DRAFT / CERTIFICATION IN PROGRESS
Scope: Frontend Architecture Certification and future ADR records
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Index: `docs/frontend/README.md`

---

## 1. Purpose

This document records architecture decisions and pending decisions discovered during Frontend Architecture Certification.

เป้าหมายคือบันทึกเหตุผลของการออกแบบ ไม่ใช่แค่ผลลัพธ์ของการแก้โค้ด เพื่อให้การตัดสินใจในอนาคตมีหลักฐานรองรับ

---

## 2. Decision Status

```txt
PROPOSED   — proposed but not approved
APPROVED   — approved as working rule
CERTIFIED  — verified by file reads and accepted as architecture rule
LOCKED     — should not be changed without a new ADR
SUPERSEDED — replaced by a newer decision
```

---

## 3. Certified / Working Decisions

### ADR-FE-001 — authStore owns active session identity

Status:

```txt
CERTIFIED
```

Decision:

```txt
authStore is the active frontend source of truth for login/session identity.
```

Owns:

```txt
token
accessToken
session
role
profileType
employee
customer
isSuperAdmin
authChecked
isBootstrappingAuth
```

Reason:

- App bootstrap calls authStore.bootstrapAuthAction.
- apiClient reads token from authStore.
- LoginPage calls authStore.loginAction.
- HeaderPos reads authStore employee/role/auth status.
- Checkout reads authStore token/customer.

Implication:

No other store should be treated as active session owner during current Auth stabilization.

---

### ADR-FE-002 — employeeStore is HR management, not session owner

Status:

```txt
CERTIFIED
```

Decision:

```txt
employeeStore is HR / Employee Management state only.
It is not Login/Auth session source of truth.
```

Reason:

- employeeStore header documents that Auth/current login branch source of truth is authStore.employee.branchId.
- employeeStore does not persist active session/branch/token/role.
- Compatibility fields exist but are not session authority.

Implication:

Do not activate permission or auth logic that depends on employeeStore as active identity source.

---

### ADR-FE-003 — apiClient owns transport refresh queue and retry

Status:

```txt
CERTIFIED
```

Decision:

```txt
apiClient owns frontend transport-level refresh and retry behavior.
```

Reason:

- apiClient attaches Authorization headers.
- apiClient forces withCredentials.
- apiClient owns shared refreshPromise.
- apiClient calls /auth/refresh on eligible 401.
- apiClient retries original request once after refresh succeeds.

Implication:

Do not change apiClient refresh behavior without a regression test plan and Backend Auth review.

---

### ADR-FE-004 — RBAC and route guards remain dormant during Auth stabilization

Status:

```txt
APPROVED
```

Decision:

```txt
Do not activate RBAC, permission wrappers, menu capability filtering, or route guard behavior during current Login/Auth stabilization.
```

Reason:

- ProtectedRoute exists but appears not mounted in reviewed POS route tree.
- RequirePermission and IfPermission appear dormant in current pass.
- usePermission currently reads employeeStore/customerStore rather than authStore.
- Activating authorization while stabilizing authentication would increase regression risk.

Implication:

Authorization work must be a later phase after Auth/Branch runtime is stable.

---

## 4. Proposed Decisions Requiring Approval

### ADR-FE-005 — POS branch identity must be anchored to authStore.employee.branchId

Status:

```txt
PROPOSED
```

Decision:

```txt
For POS runtime, authStore.employee.branchId should be the canonical branch identity.
branchStore should provide loaded branch detail/display for that identity.
```

Reason:

- authStore requires branchId for employee/admin login and verify.
- authStore passes branchId to branchStore after login/verify.
- branchStore also supports online selected branch behavior.
- HeaderPos currently can reload branch from selectedBranchId, creating drift risk.

Implication:

Future POS shell cleanup should avoid treating selectedBranchId as identity branch unless it was set from authStore.employee.branchId.

---

### ADR-FE-006 — Online branch selection must be separate from POS identity branch

Status:

```txt
PROPOSED
```

Decision:

```txt
Online selected branch should remain branchStore-managed, but must not override POS employee branch identity.
```

Reason:

- branchStore owns online auto-selection via current/last/geolocation/first branch.
- Checkout uses branchStore selected/current branch for online order context.
- POS branch identity comes from employee login.

Implication:

BranchStore may need explicit separation or naming in a later refactor.

---

### ADR-FE-007 — UI caller should own logout navigation target

Status:

```txt
PROPOSED
```

Decision:

```txt
authStore should clear session state.
UI callers should own redirect/navigation after logout.
```

Reason:

- logoutAction currently forces window.location.href = /login.
- HeaderPos and UnifiedMainNav also navigate after logoutAction.
- LogoutButton calls logout and navigates to /login.
- Different surfaces may need different logout targets.

Implication:

Future logout standardization should split state cleanup from navigation policy.

---

### ADR-FE-008 — POS shopSlug should be validated against authenticated branchSlug after bootstrap

Status:

```txt
PROPOSED
```

Decision:

```txt
POS route shopSlug should not be treated as branch truth by itself.
After bootstrap, it should be validated or corrected against authenticated branchSlug.
```

Reason:

- POS routes use /:shopSlug/pos.
- Header and Sidebar build links from URL shopSlug.
- LoginPage routes staff using employee.branchSlug or general-pos fallback.
- URL shopSlug can drift from employee.branchSlug.

Implication:

Do not activate this until bootstrap and branch ownership rules are stable.

---

### ADR-FE-009 — LoginPage currently owns post-login navigation policy

Status:

```txt
CERTIFIED / FUTURE REFACTOR CANDIDATE
```

Decision:

```txt
For the current runtime, LoginPage owns post-login navigation policy.
```

Reason:

- LoginPage redirects superadmin, employee/admin, and customer identities.
- LoginPage chooses POS route using branchSlug fallback.
- Online LoginForm shares loginAction but delegates success behavior to checkout callback.

Implication:

Future refactor may extract post-login navigation into a dedicated policy function, but behavior must be preserved first.

---

## 5. Pending Questions

```txt
1. Should general-pos fallback be allowed for POS employee route?
2. Should AppRouter catch-all hardcode /advancetech/pos/dashboard?
3. Should apiClient refresh failure reset authStore or leave callers to decide?
4. Should cartStore read accessToken || token instead of token only?
5. Should CheckoutPage standardize on currentBranch.id or selectedBranchId?
6. Should authStore use authApi wrappers consistently?
7. Should branchStore split POS branch detail and online selected branch into separate fields?
```

---

## 6. ADR Process Going Forward

Before any runtime refactor:

```txt
1. Add or update an ADR.
2. Link evidence docs.
3. Mark status as PROPOSED.
4. Get approval.
5. Implement one file at a time.
6. Update ADR to CERTIFIED or SUPERSEDED after verification.
```

---

## 7. Next Recommended Action

Review proposed ADRs:

```txt
ADR-FE-005 POS branch identity
ADR-FE-006 Online branch separation
ADR-FE-007 Logout navigation ownership
ADR-FE-008 POS shopSlug validation
```

These decisions are required before implementation cleanup begins.
