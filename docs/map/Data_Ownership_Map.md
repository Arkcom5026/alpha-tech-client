# Data Ownership Map — Frontend Architecture Certification

Status: DRAFT / INITIAL VERIFIED PASS
Scope: Frontend runtime data ownership for Auth, Branch, API Transport, Login, POS Shell, Online Cart, and Online Order
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Maps:
- `docs/map/Dependency_Map.md`
- `docs/map/Runtime_Flow_Map.md`
- `docs/map/Login_Checkout_Dependency_Verification.md`
- `docs/map/Branch_Navigation_Cart_Dependency_Verification.md`

---

## 1. Purpose

This map defines which frontend runtime layer owns each important data field before Login/Auth refactor.

เป้าหมายคือระบุว่าใครเป็นเจ้าของข้อมูล Runtime แต่ละตัว เพื่อไม่ให้แก้ Auth/Branch แล้วทำให้ข้อมูลสองแหล่งขัดกัน

This is not an implementation plan yet.

---

## 2. Ownership Terms

### Owner

The source of truth that should mutate or define the data.

### Consumer

A file or layer that reads the data but should not redefine its meaning.

### Handoff

A controlled transfer from one owner to another layer for detail loading or display.

### Candidate / Dormant

Existing code that may be useful later but should not be treated as active runtime authority yet.

---

## 3. Auth Runtime Ownership

### Owner

```txt
src/features/auth/store/authStore.js
```

### Owned Data

```txt
token
accessToken
session
rememberMe
lastLoginIdentifier
authChecked
isBootstrappingAuth
authError
role
profileType
employee
customer
isSuperAdmin
```

### Owned Actions

```txt
loginAction
verifySessionAction
bootstrapAuthAction
logout
logoutAction
logoutAllDevicesAction
resetAuthStateAction
clearStorage
```

### Persistence Rule

AuthStore persists only:

```txt
rememberMe
lastLoginIdentifier
```

AuthStore does not persist:

```txt
token
accessToken
session
employee
customer
role
profileType
```

### Implication

Browser reload recovery depends on:

```txt
HttpOnly refresh cookie
/api/auth/refresh or /auth/refresh behavior
apiClient withCredentials
verifySessionAction
```

### Consumers

Known consumers include:

```txt
src/App.jsx
src/utils/apiClient.js
src/features/auth/pages/LoginPage.jsx
src/features/pos/components/header/HeaderPos.jsx
src/components/common/UnifiedMainNav.jsx
src/components/LogoutButton.jsx
src/features/online/cart/store/cartStore.js
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/order/components/LoginForm.jsx
src/features/auth/pages/StaffSettingsPage.jsx
```

---

## 4. Employee Identity Ownership

### Owner

```txt
src/features/auth/store/authStore.js
```

### Owned Data

```txt
employee.id
employee.branchId
employee.branchSlug
employee.position
employee.role / effectiveRole
employee.profileType
employee.permissions / capability metadata if provided
```

### Non-Owner / Management Store

```txt
src/features/employee/store/employeeStore.js
```

Verified rule:

- employeeStore is HR / Employee Management only.
- employeeStore is not active session source of truth.
- Deprecated compatibility fields exist but should not be treated as session authority.

### Candidate Canonical POS Branch Field

```txt
authStore.employee.branchId
```

Reason:

- AuthStore requires branchId for employee/admin login and verify.
- AuthStore hands this branchId to branchStore after login/verify.

---

## 5. Customer Identity Ownership

### Owner

```txt
src/features/auth/store/authStore.js
```

### Owned Data

```txt
customer.id
customer profile fields
profileType = customer
role = customer
```

### Consumers

```txt
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/order/components/LoginForm.jsx
src/features/online/cart/store/cartStore.js
src/features/customer/components/CheckoutForm.jsx
```

### Rule

Online customer identity must not be mixed with POS employee branch authority.

---

## 6. Branch Runtime Ownership

### Owner

```txt
src/features/branch/store/branchStore.js
```

### Owned Data

```txt
branches
currentBranch
selectedBranchId
version
```

### Owned Actions

```txt
loadBranchesAction
loadAndSetBranchById
setCurrentBranch
setSelectedBranchId
ensureSelectedBranchAction
clearBranch
clearStorage
```

### Persistence Rule

BranchStore persists:

```txt
currentBranch
selectedBranchId
version
```

### Critical Ambiguity

BranchStore currently supports two different concepts:

```txt
POS branch detail loaded from authStore.employee.branchId
Online selected branch / auto-selected branch
```

These must not be treated as the same ownership rule.

---

## 7. POS Branch Truth

### Candidate Owner

```txt
authStore.employee.branchId
```

### Detail Handoff Owner

```txt
branchStore.currentBranch
branchStore.selectedBranchId
```

### Verified Handoff

```txt
authStore.loginAction / verifySessionAction
  ↓
branchStore.loadAndSetBranchById(employee.branchId)
```

### Risk

`HeaderPos` can reload branch from `selectedBranchId`, not directly from `employee.branchId`.

This creates potential branch drift if selectedBranchId changes through online/admin branch selection.

### Working Rule

Until branch ownership is redesigned:

```txt
POS identity branch should be anchored to authStore.employee.branchId.
branchStore should provide branch display/detail for that branch.
```

---

## 8. Online Branch Truth

### Owner

```txt
branchStore.selectedBranchId
branchStore.currentBranch
```

### Supporting Actions

```txt
ensureSelectedBranchAction
setSelectedBranchId
setCurrentBranch
```

### Verified Behavior

- Online branch can be selected from current branch.
- Online branch can be selected from last localStorage branch.
- Online branch can be selected from geolocation or first available branch.

### Consumers

```txt
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/cart/store/cartStore.js via caller-supplied branchId
src/features/online/productOnline/*
```

### Risk

Online branch selection must not override POS logged-in employee branch.

---

## 9. Route Slug Ownership

### Current Source

```txt
URL param: shopSlug
```

### Consumers

```txt
src/routes/AppRouter.jsx
src/features/pos/components/header/HeaderPos.jsx
src/features/pos/components/sidebar/SidebarLoader.jsx
src/config/sidebarMenuConfig.js
module-specific sidebar config files
```

### Auth-Linked Candidate

```txt
authStore.employee.branchSlug
```

### Verified Behavior

- LoginPage navigates POS staff to `/${employee.branchSlug || 'general-pos'}/pos/dashboard`.
- Sidebar and Header build paths from URL `shopSlug`.
- AppRouter catch-all redirects to `/advancetech/pos/dashboard`.

### Risk

URL `shopSlug` can drift from authenticated employee branchSlug.

### Open Rule

Not yet decided:

```txt
Should POS trust URL shopSlug?
Should POS correct URL shopSlug from authStore.employee.branchSlug?
Should branchSlug be required for employee login?
Should general-pos fallback be allowed?
```

---

## 10. API Transport Ownership

### Owner

```txt
src/utils/apiClient.js
```

### Owned Data / Behavior

```txt
runtime baseURL
withCredentials policy
Authorization header attachment
401 refresh retry policy
refreshPromise queue
network error normalization
```

### Reads From

```txt
authStore.accessToken || authStore.token
```

### Mutates

On refresh success, apiClient mutates:

```txt
authStore.token
authStore.accessToken
authStore.session
authStore.rememberMe
authStore.authChecked
authStore.isBootstrappingAuth
authStore.authError
```

### Risk

apiClient does not rebuild employee/customer identity after refresh. Identity rebuild depends on authStore verify/bootstrap.

---

## 11. Cart Ownership

### Owner

```txt
src/features/online/cart/store/cartStore.js
```

### Owned Data

```txt
cartItems
selectedItems
branchPrices
```

### Persistence Rule

CartStore persists:

```txt
cartItems
selectedItems
```

CartStore does not persist:

```txt
branchPrices
```

### Reads From

```txt
authStore.token via useAuthStore.getState()
```

### Does Not Own

```txt
customer identity
branch identity
```

### Handoff

CartStore fetches branch prices only when caller provides branchId.

---

## 12. Online Order Ownership

### Owner

```txt
src/features/online/order/store/orderOnlineStore.js
```

### Owned Data

```txt
isSubmitting
orders
selectedOrder
isLoading
error
```

### Does Not Own

```txt
customerId
branchId
auth token
selectedBranchId
currentBranch
```

### Handoff

CheckoutPage provides customerId and branchId in payload.

### Risk

orderOnlineStore submits whatever customer/branch payload it receives from caller.

---

## 13. Permission / RBAC Ownership

### Candidate Files

```txt
src/hooks/usePermission.js
src/components/auth/RequirePermission.jsx
src/components/auth/IfPermission.jsx
src/features/auth/rbac/rbacClient.js
```

### Current Status

Dormant / out of scope for current Auth stabilization.

### Current Risk

Permission helpers currently read employeeStore/customerStore rather than authStore.

### Working Rule

Do not activate permission gating during Login/Auth stabilization.

---

## 14. Logout Ownership

### Current Split

```txt
authStore.logout
authStore.logoutAction
authStore.logoutAllDevicesAction
HeaderPos
UnifiedMainNav
LogoutButton
SidebarSuperAdmin
```

### Verified Problem

Redirect ownership is split:

- `logoutAction` forces `window.location.href = '/login'`.
- HeaderPos also calls `navigate('/')` after logoutAction.
- UnifiedMainNav calls logoutAction and navigates to `/`.
- LogoutButton calls `logout` and navigates to `/login`.
- SidebarSuperAdmin calls logoutAction and does not navigate.

### Open Rule

Need to decide:

```txt
Should authStore own redirect?
Should UI caller own redirect?
Should POS logout and online logout target different routes?
```

---

## 15. Ownership Risk Matrix

### Critical

```txt
authStore token/session/identity
apiClient refresh queue/retry
POS branch identity ownership
```

### High

```txt
branchStore currentBranch/selectedBranchId
LoginPage post-login navigation
HeaderPos branch reload/logout
CheckoutPage branch/customer payload
```

### Medium

```txt
cartStore token-dependent sync
orderOnlineStore caller-provided payload
Sidebar shopSlug route generation
employeeStore deprecated compatibility fields
```

### Low If Dormant

```txt
RBAC helpers
sidebar capability metadata
ProtectedRoute candidate component
```

---

## 16. Current Working Rules

1. AuthStore owns active login/session identity.
2. employeeStore is HR/employee-management state only.
3. apiClient owns transport refresh but not full identity rebuild.
4. BranchStore owns branch details/selection, but POS vs online branch ownership must be separated by rule.
5. POS branch identity should be anchored to authStore.employee.branchId until redesigned.
6. Online branch selection should remain branchStore-selected and not override POS branch.
7. LoginPage owns current post-login navigation.
8. CheckoutPage owns online order customerId/branchId payload composition.
9. RBAC and route guard activation are out of scope for current stabilization.
10. No refactor should begin until logout ownership and branch ownership are explicitly decided.

---

## 17. Next Questions Before Refactor

- Should POS require employee.branchSlug, or allow `general-pos` fallback?
- Should route `shopSlug` be corrected after bootstrap if mismatched?
- Should HeaderPos load branch by employee.branchId instead of selectedBranchId?
- Should AuthStore stop owning redirect in logoutAction?
- Should apiClient refresh failure trigger a controlled auth reset, or should callers decide?
- Should cartStore read `accessToken || token` instead of only token?
- Should CheckoutPage standardize on currentBranch.id or selectedBranchId?

---

## 18. Working Conclusion

Frontend runtime ownership is now clear enough to identify the major risk areas.

The highest-risk unresolved ownership issue is Branch Runtime: POS branch identity and online selected branch currently share branchStore fields.

The second highest-risk issue is Logout Runtime: redirect ownership is split across authStore and UI callers.

The third highest-risk issue is Route Slug Runtime: URL shopSlug is used broadly and can drift from authenticated employee branchSlug.

These rules should be decided before Auth refactor begins.
