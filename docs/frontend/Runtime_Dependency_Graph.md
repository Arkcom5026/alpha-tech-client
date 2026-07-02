# Runtime Dependency Graph

Status: DRAFT / CERTIFICATION IN PROGRESS
Scope: Frontend runtime dependency graph across application, auth, branch, transport, router, POS shell, online checkout, cart, and order
Repository: alpha-tech-client
Related Runtime Certification: `docs/frontend/Frontend_Runtime_Certification.md`
Related Sequence Catalog: `docs/frontend/Runtime_Sequence_Catalog.md`

---

## 1. Purpose

This document shows how frontend runtime owners, stores, APIs, components, and route layers depend on each other.

เป้าหมายคือทำกราฟความสัมพันธ์ของ Runtime ทั้งระบบ เพื่อให้เห็นว่าถ้าแก้จุดหนึ่ง จะกระทบจุดใดบ้าง

---

## 2. Graph Legend

```txt
[OWNER]      Runtime source of truth
[CONSUMER]   Reads owner state
[MUTATOR]    Writes or triggers state change
[API]        Network layer
[ROUTE]      Navigation / route layer
[SHELL]      Layout or shell runtime component
[DORMANT]    Exists but intentionally inactive
[LEGACY]     Compatibility / old surface
```

---

## 3. Top-Level Runtime Graph

```txt
Browser
  ↓
main.jsx
  ↓
App.jsx [MUTATOR]
  ↓
authStore.bootstrapAuthAction [OWNER]
  ↓
RouterProvider
  ↓
AppRouter [ROUTE]
  ├── POS Runtime
  ├── Online Runtime
  ├── SuperAdmin Runtime
  └── Auth Pages
```

Key risk:

```txt
Router can render while auth bootstrap is still in progress.
```

---

## 4. Auth Runtime Graph

```txt
App.jsx
  ↓
authStore [OWNER]
  ├── loginAction
  ├── verifySessionAction
  ├── bootstrapAuthAction
  ├── logout / logoutAction / logoutAllDevicesAction
  ├── employee
  ├── customer
  ├── token / accessToken / session
  └── role / profileType
        ↓
apiClient [API / TRANSPORT OWNER]
        ↓
/auth/refresh
/auth/me
/auth/login
```

Consumers:

```txt
LoginPage
HeaderPos
UnifiedMainNav
LogoutButton
StaffSettingsPage
CheckoutPage
cartStore
apiClient
```

Critical dependency:

```txt
apiClient reads authStore token.
authStore also imports apiClient for auth lifecycle calls.
```

Risk:

```txt
AuthStore and apiClient are mutually coupled at runtime.
```

---

## 5. Transport Runtime Graph

```txt
apiClient [OWNER]
  ↓ reads
useAuthStore.getState().accessToken || token
  ↓ attaches
Authorization: Bearer token
  ↓ sends
withCredentials = true
  ↓ handles
401 response
  ↓
refreshPromise
  ↓
/auth/refresh
  ↓
updates authStore token/session
  ↓
retries original request once
```

Consumers:

```txt
authApi
branchApi
cartApi
orderOnlineApi
productApi
salesApi
stockApi
paymentApi
supplierApi
employeeApi
many domain APIs
```

Risk:

```txt
apiClient changes are system-wide and require broad regression testing.
```

---

## 6. Branch Runtime Graph

```txt
authStore.employee.branchId [IDENTITY SOURCE]
  ↓
authStore.loginAction / verifySessionAction
  ↓
branchStore.loadAndSetBranchById(branchId) [MUTATOR]
  ↓
branchStore [OWNER]
  ├── currentBranch
  ├── selectedBranchId
  ├── branches
  └── version
```

Online branch flow:

```txt
branchStore.ensureSelectedBranchAction
  ├── current branch
  ├── last online branch
  ├── geolocation branch
  └── first branch fallback
```

Consumers:

```txt
HeaderPos
CheckoutPage
Online product pages
Product pages
Supplier pages
Report/print pages
UnifiedMainNav clearStorage
```

Critical risk:

```txt
POS branch identity and online selected branch share branchStore fields.
```

---

## 7. POS Shell Runtime Graph

```txt
AppRouter /:shopSlug/pos
  ↓
PartnerPosMasterLayout [SHELL]
  ├── HeaderPos [SHELL / CONSUMER / MUTATOR]
  ├── SidebarLoader [SHELL / ROUTE CONSUMER]
  └── Outlet(posPartnerRoutes)
```

HeaderPos dependencies:

```txt
HeaderPos
  ├── authStore.employee
  ├── authStore.role
  ├── authStore.logoutAction
  ├── branchStore.currentBranch
  ├── branchStore.selectedBranchId
  ├── branchStore.loadAndSetBranchById
  ├── branchStore.clearBranch
  └── shopSlug prop
```

SidebarLoader dependencies:

```txt
SidebarLoader
  ├── useParams().shopSlug
  ├── useLocation().pathname
  └── sidebarMenuConfig(shopSlug)
```

Risk:

```txt
POS shell navigation is URL shopSlug driven, not authenticated branchSlug validated.
```

---

## 8. Login Runtime Graph

```txt
LoginPage [MUTATOR / NAVIGATION POLICY]
  ↓
authStore.loginAction
  ↓
loginUser / auth API
  ↓
set authStore token/session/identity
  ↓
branchStore.loadAndSetBranchById(employee.branchId)
  ↓
LoginPage reads useAuthStore.getState()
  ↓
navigate by role/profile
```

Navigation dependency:

```txt
superadmin → /superadmin/dashboard
employee/admin → /{employee.branchSlug || general-pos}/pos/dashboard
customer → previous route or /
unknown → logoutAction + /partner-portal
```

Risk:

```txt
LoginPage owns post-login navigation policy and depends on branchSlug.
```

---

## 9. Online Checkout Runtime Graph

```txt
CheckoutPage [ORCHESTRATOR]
  ├── authStore.token
  ├── authStore.customer
  ├── branchStore.selectedBranchId
  ├── branchStore.currentBranch via getState()
  ├── cartStore
  └── orderOnlineStore
```

Cart flow:

```txt
cartStore
  ↓ reads
useAuthStore.getState().token
  ↓
cartApi
  ↓
apiClient
```

Order flow:

```txt
CheckoutPage
  ↓ builds payload
customerId + selectedBranchId + cart items
  ↓
orderOnlineStore.submitOrderAction
  ↓
orderOnlineApi.createOrder
  ↓
apiClient
```

Risk:

```txt
Checkout fetches branch prices using currentBranch.id but submits order using selectedBranchId.
```

---

## 10. Logout Runtime Graph

```txt
HeaderPos
UnifiedMainNav
LogoutButton
SidebarSuperAdmin
  ↓
authStore logout variants
  ├── logout
  ├── logoutAction
  └── logoutAllDevicesAction
  ↓
resetAuthStateAction
  ↓
clear local auth state
```

Additional cleanup:

```txt
HeaderPos → branchStore.clearBranch
UnifiedMainNav → cart clear + branch clearStorage
LogoutButton → navigate('/login')
logoutAction → window.location.href = '/login'
```

Risk:

```txt
Logout state cleanup and navigation ownership are split.
```

---

## 11. Dormant / Legacy Graph

```txt
ProtectedRoute [DORMANT]
RequirePermission [DORMANT]
IfPermission [DORMANT]
usePermission [DORMANT / wrong identity source for current runtime]
RBAC capability metadata [DORMANT]
```

Legacy / compatibility:

```txt
employeeStore [LEGACY / HR MANAGEMENT]
rootStore [LEGACY CANDIDATE]
branchHelpers [LEGACY / ONLINE GEO CANDIDATE]
```

Rule:

```txt
Do not activate dormant security/runtime layers during Auth stabilization.
```

---

## 12. Highest-Risk Dependency Chains

### Chain A — Reload Session Recovery

```txt
Browser reload
  ↓
App bootstrap
  ↓
/auth/refresh
  ↓
authStore token/session
  ↓
/auth/me
  ↓
employee/customer
  ↓
branchStore.loadAndSetBranchById
  ↓
POS/Online page state
```

Risk:

```txt
CRITICAL
```

---

### Chain B — POS Branch Identity

```txt
authStore.employee.branchId
  ↓
branchStore.currentBranch / selectedBranchId
  ↓
HeaderPos display/reload
  ↓
POS operational pages
```

Risk:

```txt
CRITICAL
```

---

### Chain C — Online Checkout Branch

```txt
branchStore.currentBranch / selectedBranchId
  ↓
CheckoutPage branch price + order payload
  ↓
cartStore / orderOnlineStore
  ↓
apiClient
```

Risk:

```txt
HIGH
```

---

### Chain D — Logout

```txt
UI caller
  ↓
authStore logout variant
  ↓
branch/cart cleanup
  ↓
caller navigation OR authStore forced redirect
```

Risk:

```txt
HIGH
```

---

## 13. Refactor Impact Rule

Before changing any runtime owner, check downstream graph:

```txt
authStore change → apiClient, LoginPage, HeaderPos, CheckoutPage, cartStore
branchStore change → HeaderPos, CheckoutPage, POS/Online pages, reports, print
apiClient change → all API modules
LoginPage change → POS login, customer login redirect, superadmin redirect
HeaderPos change → POS identity display, branch reload, logout, top navigation
```

---

## 14. Next Certification Step

Create:

```txt
docs/frontend/Runtime_Event_Catalog.md
```

Reason:

After dependency graph, the next layer is event-level behavior and side effects.
