# Runtime Event Catalog

Status: DRAFT / CERTIFICATION IN PROGRESS
Scope: Frontend runtime events, side effects, state mutations, API calls, navigation, and risk classification
Repository: alpha-tech-client
Related Runtime Certification: `docs/frontend/Frontend_Runtime_Certification.md`
Related Dependency Graph: `docs/frontend/Runtime_Dependency_Graph.md`
Related Sequence Catalog: `docs/frontend/Runtime_Sequence_Catalog.md`

---

## 1. Purpose

This catalog documents key frontend runtime events and their side effects before implementation refactor begins.

เป้าหมายคือบันทึกว่า Event สำคัญของ Frontend ทำอะไรบ้าง กระทบ Store ไหน เรียก API ไหน และ Navigate ไปไหน เพื่อป้องกัน Regression ตอนยกระดับ Auth/Login/Branch/Token

---

## 2. Event Documentation Model

Every runtime event should identify:

```txt
Event Trigger
Primary Owner
State Read
State Mutation
API Calls
Navigation
Side Effects
Error Path
Recovery Path
Risk
Related ADR
Related Risk Register
```

---

## 3. EVT-FE-001 — Application Bootstrap Event

Trigger:

```txt
App.jsx mounted
```

Primary owner:

```txt
App.jsx + authStore.bootstrapAuthAction
```

Sequence:

```txt
App.jsx useEffect
  ↓
bootstrapAuthAction()
  ↓
check in-memory token
  ↓
refresh if no token
  ↓
verifySessionAction()
```

State read:

```txt
authStore.accessToken
authStore.token
```

State mutation:

```txt
isBootstrappingAuth
authChecked
token/accessToken/session if refresh succeeds
employee/customer if verify succeeds
```

API calls:

```txt
POST /auth/refresh
GET /auth/me
```

Navigation:

```txt
None directly from bootstrap.
Router already renders through RouterProvider.
```

Risk:

```txt
CRITICAL
```

Reason:

Router and pages may render while bootstrap is in progress.

---

## 4. EVT-FE-002 — Session Refresh Event

Trigger:

```txt
bootstrap with no in-memory token
or apiClient receives eligible 401
```

Primary owner:

```txt
apiClient refresh queue + authStore bootstrap
```

Sequence:

```txt
401 or bootstrap refresh need
  ↓
POST /auth/refresh
  ↓
receive accessToken/session
  ↓
update authStore token/session
  ↓
retry original request if from apiClient interceptor
```

State mutation:

```txt
authStore.token
authStore.accessToken
authStore.session
authStore.authChecked
authStore.isBootstrappingAuth
authStore.authError
```

API calls:

```txt
POST /auth/refresh
```

Navigation:

```txt
None directly
```

Risk:

```txt
CRITICAL
```

Reason:

Session continuity depends on cookie, withCredentials, baseURL, refresh response, and token update.

---

## 5. EVT-FE-003 — Verify Session Event

Trigger:

```txt
bootstrapAuthAction after refresh/token
manual verifySessionAction call
```

Primary owner:

```txt
authStore.verifySessionAction
```

Sequence:

```txt
verifySessionAction
  ↓
GET /auth/me
  ↓
derive role/profile
  ↓
build employee/customer identity
  ↓
branchStore.loadAndSetBranchById(branchId)
```

State read:

```txt
authStore.accessToken || authStore.token
```

State mutation:

```txt
authStore.employee
authStore.customer
authStore.role
authStore.profileType
authStore.authChecked
branchStore.currentBranch
branchStore.selectedBranchId
```

API calls:

```txt
GET /auth/me
GET /branches/:id through branchStore handoff
```

Risk:

```txt
HIGH
```

Reason:

Identity may verify but branch detail loading may fail.

---

## 6. EVT-FE-004 — POS Login Submit Event

Trigger:

```txt
LoginPage form submit
```

Primary owner:

```txt
LoginPage + authStore.loginAction
```

Sequence:

```txt
submit credentials
  ↓
loginAction(credentials)
  ↓
POST /auth/login
  ↓
set token/session/identity
  ↓
load branch by employee.branchId
  ↓
LoginPage reads authStore.getState()
  ↓
navigate by role/profile/branchSlug
```

State mutation:

```txt
authStore token/session/employee/customer/role/profileType
branchStore currentBranch/selectedBranchId
```

API calls:

```txt
POST /auth/login
GET /branches/:id if branchId exists
```

Navigation:

```txt
superadmin → /superadmin/dashboard
employee/admin → /{employee.branchSlug || general-pos}/pos/dashboard
customer → previous route or /
unknown → logoutAction + /partner-portal
```

Risk:

```txt
CRITICAL
```

Reason:

LoginPage owns current post-login navigation policy.

---

## 7. EVT-FE-005 — Online Login Submit Event

Trigger:

```txt
Online LoginForm submit during checkout
```

Primary owner:

```txt
Online LoginForm + authStore.loginAction + cartStore
```

Sequence:

```txt
submit credential/password
  ↓
loginAction
  ↓
optional setCurrentBranch if employee profile branch exists
  ↓
mergeCartAction if local cart exists
  ↓
fetchCartAction
  ↓
clearCart
  ↓
onSuccess(role)
```

State mutation:

```txt
authStore token/session/customer/employee
cartStore cartItems/selectedItems
branchStore currentBranch if employee profile branch exists
```

API calls:

```txt
POST /auth/login
POST /cart/merge
GET /cart
```

Risk:

```txt
HIGH
```

Reason:

Online checkout shares the same loginAction as POS LoginPage.

---

## 8. EVT-FE-006 — Branch Handoff Event

Trigger:

```txt
loginAction or verifySessionAction receives branchId
```

Primary owner:

```txt
authStore → branchStore handoff
```

Sequence:

```txt
authStore derives branchId
  ↓
useBranchStore.getState().loadAndSetBranchById(branchId)
  ↓
branchApi.getBranchById(branchId)
  ↓
set currentBranch and selectedBranchId
```

State mutation:

```txt
branchStore.currentBranch
branchStore.selectedBranchId
branchStore.version
```

API calls:

```txt
GET /branches/:id
```

Risk:

```txt
CRITICAL
```

Reason:

branchStore also supports online selected branch behavior; POS identity branch must not drift.

---

## 9. EVT-FE-007 — HeaderPos Branch Reload Event

Trigger:

```txt
HeaderPos effect sees authenticated employee and selectedBranchId
```

Primary owner:

```txt
HeaderPos + branchStore
```

Sequence:

```txt
HeaderPos effect
  ↓
if authenticated employee and selectedBranchId
  ↓
loadAndSetBranchById(selectedBranchId)
```

State read:

```txt
authStore.employee
authStore.isAuthenticatedSelector
branchStore.selectedBranchId
```

State mutation:

```txt
branchStore.currentBranch
branchStore.selectedBranchId
```

Risk:

```txt
CRITICAL
```

Reason:

If selectedBranchId differs from authStore.employee.branchId, POS branch display/context can drift.

---

## 10. EVT-FE-008 — POS Navigation Event

Trigger:

```txt
User clicks HeaderPos or SidebarLoader navigation link
```

Primary owner:

```txt
HeaderPos / SidebarLoader / sidebarMenuConfig
```

Sequence:

```txt
read URL shopSlug
  ↓
build nav path
  ↓
navigate to /{shopSlug}/pos/module
```

State read:

```txt
URL shopSlug
pathname
```

State mutation:

```txt
None directly
```

Navigation:

```txt
URL shopSlug-driven POS routes
```

Risk:

```txt
HIGH
```

Reason:

URL shopSlug may drift from authenticated employee branchSlug.

---

## 11. EVT-FE-009 — Checkout Load Event

Trigger:

```txt
CheckoutPage mount
```

Primary owner:

```txt
CheckoutPage + cartStore
```

Sequence:

```txt
CheckoutPage mount
  ↓
fetchCartAction()
  ↓
read authStore token/customer and branchStore currentBranch via getState
  ↓
fetchCartBranchPricesAction(currentBranch.id)
```

State read:

```txt
authStore.token
authStore.customer
branchStore.currentBranch
```

State mutation:

```txt
cartStore.cartItems
cartStore.branchPrices
```

API calls:

```txt
GET /cart
GET /cart/branch-prices/:branchId
```

Risk:

```txt
HIGH
```

Reason:

Checkout price context uses currentBranch.id while submit uses selectedBranchId.

---

## 12. EVT-FE-010 — Checkout Submit Event

Trigger:

```txt
User submits checkout form
```

Primary owner:

```txt
CheckoutPage + orderOnlineStore
```

Sequence:

```txt
validate token/customer/selectedBranchId
  ↓
build payload customerId + selectedBranchId + items
  ↓
submitOrderAction(payload)
  ↓
createOrder(payload)
  ↓
clear cart on success
  ↓
navigate / order confirmation behavior
```

State read:

```txt
authStore.token
authStore.customer
branchStore.selectedBranchId
cartStore.cartItems
```

State mutation:

```txt
orderOnlineStore.isSubmitting/orders/error
cartStore.clearCart on success
```

API calls:

```txt
POST /order-online
```

Risk:

```txt
HIGH
```

Reason:

orderOnlineStore trusts caller-provided customer/branch payload.

---

## 13. EVT-FE-011 — Logout Event

Trigger:

```txt
HeaderPos / UnifiedMainNav / LogoutButton / SidebarSuperAdmin logout action
```

Primary owner:

```txt
authStore logout variants + UI caller
```

Sequence:

```txt
UI logout trigger
  ↓
logout or logoutAction or logoutAllDevicesAction
  ↓
POST /auth/logout or /auth/logout-all
  ↓
resetAuthStateAction
  ↓
optional branch/cart cleanup
  ↓
navigation by caller or window.location from logoutAction
```

State mutation:

```txt
authStore cleared
branchStore cleared by some callers
cartStore cleared by some callers
legacy localStorage token/role removed
```

API calls:

```txt
POST /auth/logout
POST /auth/logout-all
```

Navigation:

```txt
mixed: /login, /, or caller-defined
```

Risk:

```txt
HIGH
```

Reason:

Redirect ownership is split between authStore and UI callers.

---

## 14. EVT-FE-012 — Cart Server Sync Event

Trigger:

```txt
Cart add/remove/increase/decrease/fetch actions
```

Primary owner:

```txt
cartStore
```

Sequence:

```txt
cart action
  ↓
read authStore.token via getState
  ↓
if token exists call server cart API
  ↓
else operate locally where supported
```

State read:

```txt
authStore.token
cartStore.cartItems
```

State mutation:

```txt
cartStore.cartItems
cartStore.selectedItems
```

Risk:

```txt
HIGH
```

Reason:

cartStore depends on authStore.token field naming and availability.

---

## 15. Event Risk Matrix

```txt
CRITICAL:
- Application Bootstrap Event
- Session Refresh Event
- POS Login Submit Event
- Branch Handoff Event
- HeaderPos Branch Reload Event

HIGH:
- Verify Session Event
- Online Login Submit Event
- POS Navigation Event
- Checkout Load Event
- Checkout Submit Event
- Logout Event
- Cart Server Sync Event
```

---

## 16. Next Certification Step

Create:

```txt
docs/frontend/Error_Recovery_Catalog.md
```

Reason:

Events are now mapped. The next certification layer is failure and recovery behavior.
