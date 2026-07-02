# Runtime Flow Map — Frontend Architecture Certification

Status: DRAFT / INITIAL VERIFIED PASS
Scope: Frontend runtime startup, auth bootstrap, router, POS layout, branch handoff, API transport, login, and checkout flows
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`

---

## 1. Purpose

This map records how the frontend starts, restores session state, routes users, and connects Auth / Branch / API / Page runtime.

เป้าหมายคือทำแผนที่ Runtime Flow ของ Frontend ก่อนแก้ Login/Auth เพื่อป้องกัน Regression

This document is not an implementation plan yet.

---

## 2. Files Verified In This Pass

```txt
src/main.jsx
src/App.jsx
src/routes/AppRouter.jsx
src/routes/partner/posPartnerRoutes.jsx
src/routes/partner/onlinePartnerRoutes.jsx
src/features/auth/store/authStore.js
src/features/branch/store/branchStore.js
src/utils/apiClient.js
src/features/auth/pages/LoginPage.jsx
src/features/online/order/components/LoginForm.jsx
src/features/online/order/pages/CheckoutPage.jsx
src/features/pos/components/header/HeaderPos.jsx
src/features/pos/components/sidebar/SidebarLoader.jsx
```

---

## 3. Application Startup Flow

```txt
Browser
  ↓
src/main.jsx
  ↓
<App />
  ↓
useEffect()
  ↓
authStore.bootstrapAuthAction()
  ↓
RouterProvider(router)
```

Verified behavior:

- `main.jsx` only bootstraps React and renders `<App />`.
- `main.jsx` explicitly documents that auth / branch lifecycle should not be decided there.
- `App.jsx` creates browser router from `AppRouter`.
- `App.jsx` calls `bootstrapAuthAction()` in a root-level effect.
- `App.jsx` renders `<RouterProvider router={router} />`.

Interpretation:

- Auth bootstrap and router rendering happen from the same root component.
- RouterProvider is rendered regardless of whether bootstrap has completed.
- Pages/components must tolerate initial bootstrap state.

Risk:

```txt
HIGH
```

Reason:

If pages assume auth/branch state is ready before bootstrap finishes, refresh/reload may show incomplete or unauthenticated behavior.

---

## 4. Auth Bootstrap Flow

```txt
bootstrapAuthAction()
  ↓
set isBootstrappingAuth = true
  ↓
if accessToken/token in memory
      verifySessionAction()
else
      POST /auth/refresh
          ↓
      store accessToken/session
          ↓
      verifySessionAction()
```

Verified behavior:

- AuthStore persists only `rememberMe` and `lastLoginIdentifier`.
- Token/session/employee/customer are not persisted by Zustand.
- Reload recovery depends on `/auth/refresh` and browser cookie transport.
- `/auth/refresh` response must provide a usable access token.
- Full identity recovery depends on follow-up `/auth/me` verification.

Risk:

```txt
VERY HIGH
```

Reason:

Frequent login loss after reload or idle use can be caused by any break in this chain:

```txt
refresh cookie
withCredentials
host/baseURL consistency
/auth/refresh response
accessToken storage
/auth/me verification
branch handoff
```

---

## 5. Verify Session Flow

```txt
verifySessionAction()
  ↓
requires accessToken/token
  ↓
GET /auth/me
  ↓
derive role/profile/employee/customer
  ↓
require employee/admin branchId
  ↓
set authStore identity
  ↓
branchStore.loadAndSetBranchById(branchId)
```

Verified behavior:

- Employee/admin identities require branchId.
- AuthStore derives effective role/profile from server role, profile type, employee position, and branch data.
- AuthStore builds employee or customer identity object.
- AuthStore hands branchId to branchStore when branchId exists.

Interpretation:

- AuthStore owns identity truth.
- BranchStore owns branch detail after AuthStore passes branchId.

Risk:

```txt
HIGH
```

Reason:

If `/auth/me` succeeds but branch handoff fails, POS identity may exist while branch detail is incomplete.

---

## 6. API Transport Refresh Flow

```txt
apiClient request
  ↓
withCredentials = true
  ↓
attach Bearer token except auth-bypass endpoints
  ↓
API response 401?
  ↓
if eligible and not already retried
      refreshAccessToken()
          ↓
      shared refreshPromise
          ↓
      POST /auth/refresh with axios
          ↓
      update authStore token/session
          ↓
      retry original request once
else
      reject error
```

Verified behavior:

- `apiClient` resolves baseURL dynamically for each request.
- `apiClient` forces `withCredentials=true`.
- `apiClient` reads token from authStore via `useAuthStore.getState()`.
- `apiClient` has an auth-bypass endpoint list.
- Login, register, forgot-password, reset-password, refresh, and logout bypass refresh retry.
- On refresh success, apiClient updates token/session only.
- Full identity rebuild still depends on authStore verify/bootstrap.

Risk:

```txt
VERY HIGH
```

Reason:

apiClient is system-wide. Any interceptor or refresh behavior change impacts most API modules.

---

## 7. Router Flow

```txt
AppRouter
  ├── /
  ├── /partner-portal
  ├── /partner-portal/forgot-password
  ├── /partner-portal/reset-password
  ├── /:shopSlug/pos
  │     └── PartnerPosMasterLayout
  │           ├── SidebarLoader
  │           ├── HeaderPos
  │           └── Outlet(posPartnerRoutes)
  ├── /:shopSlug/shop
  │     └── onlinePartnerRoutes
  └── * → /advancetech/pos/dashboard
```

Verified behavior:

- POS route tree is mounted under `:shopSlug/pos`.
- POS layout does not mount ProtectedRoute in reviewed route files.
- POS layout passes `shopSlug` to HeaderPos and SidebarLoader.
- Catch-all redirects to hardcoded `/advancetech/pos/dashboard`.

Risk:

```txt
HIGH
```

Reason:

POS route access appears not guarded at route level in reviewed files. URL shopSlug can drive navigation independently of authenticated branchSlug.

---

## 8. POS Layout Flow

```txt
/:shopSlug/pos/*
  ↓
PartnerPosMasterLayout
  ↓
SidebarLoader(shopSlug)
HeaderPos(shopSlug)
Outlet()
```

Verified behavior:

- Sidebar derives active module from URL pathname.
- Sidebar builds menu links from URL `shopSlug`.
- Header builds top navigation from URL `shopSlug`.
- Header reads authStore and branchStore.
- Header can reload branch using `selectedBranchId`.

Risk:

```txt
HIGH
```

Reason:

If `selectedBranchId` differs from `authStore.employee.branchId`, HeaderPos may reload/display a branch not anchored to POS login identity.

---

## 9. LoginPage Flow

```txt
LoginPage submit
  ↓
authStore.loginAction(credentials)
  ↓
authStore sets token/session/identity
  ↓
authStore loads branch by employee branchId
  ↓
LoginPage reads authStore.getState()
  ↓
route by role/profile
```

Verified routing:

```txt
superadmin → /superadmin/dashboard
employee/admin → /{employee.branchSlug || general-pos}/pos/dashboard
customer → previous route or /
unknown → logoutAction + /partner-portal
```

Risk:

```txt
HIGH
```

Reason:

LoginPage owns role-based navigation and uses `general-pos` fallback if branchSlug is missing.

---

## 10. Online Checkout Flow

```txt
CheckoutPage mount
  ↓
fetchCartAction()
  ↓
read token/customer/currentBranch via getState()
  ↓
fetch branch prices using currentBranch.id

Online LoginForm submit
  ↓
authStore.loginAction()
  ↓
cart merge/fetch
  ↓
CheckoutPage success callback

Submit order
  ↓
requires token + customer + selectedBranchId
  ↓
payload customerId + selectedBranchId + items
  ↓
orderOnlineStore.submitOrderAction(payload)
```

Verified behavior:

- Online checkout uses the same authStore `loginAction` as POS login.
- Checkout fetches branch prices using `currentBranch.id`.
- Checkout submits order using `selectedBranchId`.
- orderOnlineStore does not own auth or branch truth.

Risk:

```txt
HIGH for branch truth ambiguity
MEDIUM for auth dependency
```

Reason:

Online checkout uses both `currentBranch.id` and `selectedBranchId`. This should remain separate from POS branch identity.

---

## 11. Current Runtime Risks

### RISK-FE-RUNTIME-001 — Router renders while bootstrap is in progress

Impact:

Pages must handle `isBootstrappingAuth` and incomplete branch/auth state.

---

### RISK-FE-RUNTIME-002 — POS route guard appears dormant

Impact:

POS page access may rely on API/page behavior rather than route-level enforcement.

---

### RISK-FE-RUNTIME-003 — URL shopSlug can drift from auth branchSlug

Impact:

Sidebar/Header route generation may not match logged-in employee branch.

---

### RISK-FE-RUNTIME-004 — BranchStore mixes POS detail and online selection

Impact:

Online auto-selection must not override POS identity branch.

---

### RISK-FE-RUNTIME-005 — Logout redirect ownership is split

Impact:

Some callers navigate, while `logoutAction` also forces `window.location.href`.

---

## 12. Working Rules Before Refactor

- Do not activate route guard yet.
- Do not activate RBAC/menu filtering yet.
- Do not change apiClient refresh behavior without a test plan.
- Do not change authStore token fields without checking cartStore and apiClient.
- Do not change branchStore selectedBranch/currentBranch behavior until POS vs online branch ownership is decided.
- Do not change LoginPage navigation until canonical POS slug rule is decided.

---

## 13. Next Required Map

Create or update:

```txt
docs/map/Data_Ownership_Map.md
```

Purpose:

Define which store owns each runtime data field.
