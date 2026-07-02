# Login & Checkout Dependency Verification

Status: DRAFT / VERIFIED PASS 01
Scope: Frontend LoginPage, online LoginForm, and CheckoutPage runtime dependency review
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Map: `docs/map/Dependency_Map.md`

---

## 1. Purpose

This document records the focused verification pass for Login and online checkout surfaces during Frontend Architecture Certification.

เป้าหมายคือบันทึกผลการตรวจเฉพาะส่วน Login และ Checkout ก่อนแก้ Login/Auth Runtime

This is not an implementation plan.

---

## 2. Files Reviewed

```txt
src/features/auth/pages/LoginPage.jsx
src/features/online/order/components/LoginForm.jsx
src/features/online/order/pages/CheckoutPage.jsx
```

---

## 3. LoginPage Verification

Reviewed file:

```txt
src/features/auth/pages/LoginPage.jsx
```

Observed dependencies:

- Reads `loginAction` from authStore.
- Reads `isAuthenticatedSelector` from authStore.
- Reads `isBootstrappingAuth` from authStore.
- Reads `role`, `profileType`, `employee`, `user`, `rememberMe`, and `lastLoginIdentifier` from authStore.
- Calls `useAuthStore.getState()` after login to inspect final runtime state.
- Uses `navigate()` for role-based redirects.

Observed login flow:

1. User submits email/phone and password.
2. Calls `loginAction({ emailOrPhone, password, rememberMe })`.
3. Reads updated authStore state imperatively.
4. If superadmin, navigates to `/superadmin/dashboard`.
5. If employee/admin/employee profile, requires `employee.branchId`.
6. For POS staff, navigates to `/${employee.branchSlug || 'general-pos'}/pos/dashboard`.
7. If customer, navigates to previous route or `/`.
8. If unknown role/profile, calls `logoutAction()` and navigates to `/partner-portal`.

Observed auto-redirect behavior:

- If already authenticated and bootstrap is complete, LoginPage redirects based on current role/profile.
- Superadmin redirects to `/superadmin/dashboard`.
- POS staff redirects to `/${employee.branchSlug || 'general-pos'}/pos/dashboard`.

Risk:

```txt
HIGH
```

Reasons:

- LoginPage owns post-login navigation decisions.
- LoginPage also calls `logoutAction()` in error/invalid-role branches.
- `logoutAction()` itself forces `window.location.href = '/login'`, so LoginPage navigation after `logoutAction()` may conflict.
- POS route slug fallback is `general-pos` if `employee.branchSlug` is missing.
- LoginPage references `state.user`, while authStore verified state primarily owns `employee` and `customer`; this may be legacy display/debug usage.

---

## 4. Online LoginForm Verification

Reviewed file:

```txt
src/features/online/order/components/LoginForm.jsx
```

Observed dependencies:

- Reads `loginAction` from authStore.
- Reads cart state/actions from cartStore.
- Reads `setCurrentBranch` from branchStore.
- Calls `onSuccess(role)` callback when login succeeds.

Observed flow:

1. User submits credential and password.
2. Calls `loginAction({ emailOrPhone: credential, password })`.
3. Receives `{ token, role, profile }` from loginAction.
4. If role is `employee` and `profile.branch` exists, calls `setCurrentBranch(profile.branch)`.
5. If cart has local items, calls `mergeCartAction()`.
6. Calls `fetchCartAction()`.
7. Calls `clearCart()`.
8. Calls `onSuccess(role)`.

Risk:

```txt
HIGH for shared loginAction impact
MEDIUM for checkout-local behavior
```

Reasons:

- Online checkout uses the same `loginAction` as POS login.
- Any change to loginAction return shape may break online checkout login.
- Online LoginForm may handle employee login by setting current branch, which may be surprising in a customer checkout surface.
- It does not pass `rememberMe`, unlike LoginPage.

---

## 5. CheckoutPage Verification

Reviewed file:

```txt
src/features/online/order/pages/CheckoutPage.jsx
```

Observed dependencies:

- Reads `token` and `customer` from authStore.
- Reads `selectedBranchId` from branchStore.
- Imperatively reads `token`, `customer`, and `currentBranch` via store `getState()` inside loadCart effect.
- Uses cartStore for cart fetch, branch price fetch, and quantity changes.
- Uses orderOnlineStore for submit order.

Observed checkout flow:

1. On mount, calls `fetchCartAction()`.
2. Reads stored auth state and current branch through `getState()`.
3. If token/customer/currentBranch.id exist, fetches cart branch prices using `currentBranch.id`.
4. Login success callback fetches cart and branch prices, then selects all cart items.
5. Submit requires `token`, `customer`, and `selectedBranchId`.
6. Submit payload uses `customer.id` and `selectedBranchId`.

Risk:

```txt
HIGH for branch truth ambiguity
MEDIUM for auth dependency
```

Reasons:

- Checkout uses both `currentBranch.id` and `selectedBranchId` in different places.
- Branch price fetch uses `currentBranch.id`, while order payload uses `selectedBranchId`.
- Online branch selection depends on branchStore and should remain separate from POS employee branch identity.
- Checkout depends on `token/customer` existing in authStore, so authStore changes can affect online checkout.

---

## 6. Verified Discoveries

### DISC-FE-LOGIN-001 — LoginPage owns role-based post-login navigation

Status: VERIFIED

Evidence:

- LoginPage redirects superadmin, POS staff, and customer users after login.
- LoginPage also redirects already-authenticated users after bootstrap completes.

Impact:

- Auth refactor must preserve post-login navigation behavior or intentionally move it into a dedicated runtime/navigation owner.

---

### DISC-FE-LOGIN-002 — POS staff route slug depends on employee.branchSlug

Status: VERIFIED

Evidence:

- LoginPage uses `employeeState?.branchSlug || 'general-pos'` for authenticated redirect.
- LoginPage uses `st.employee?.branchSlug || 'general-pos'` after login.

Impact:

- Missing branchSlug can route staff to `/general-pos/pos/dashboard`.
- BranchSlug ownership must be clarified before route guard or canonical slug work.

---

### DISC-FE-LOGIN-003 — Online checkout shares POS loginAction

Status: VERIFIED

Evidence:

- Online LoginForm calls authStore `loginAction`.
- LoginPage also calls authStore `loginAction`.

Impact:

- LoginAction is shared between POS/partner login and online checkout login.
- Any loginAction return-shape or role-derivation change must be tested against both surfaces.

---

### DISC-FE-CHECKOUT-001 — Checkout uses both currentBranch and selectedBranchId

Status: VERIFIED

Evidence:

- Checkout fetches branch prices using `currentBranch.id`.
- Checkout submits order using `selectedBranchId`.

Impact:

- Online order branch truth should be clarified.
- This should not be mixed with POS employee branch truth.

---

## 7. Impact on Current Auth Agenda

Current Auth stabilization must preserve:

```txt
POS LoginPage redirects
Superadmin redirect
Customer checkout login
Cart merge/fetch after online login
Online checkout token/customer checks
Branch price fetch for online checkout
Order submit branchId behavior
```

Still out of scope:

```txt
RBAC activation
Route guard activation
Permission-based checkout behavior
Multi-branch switching
Backend auth changes
```

---

## 8. Next Verification Targets

Continue with:

```txt
src/features/auth/components/SubEmployeeManager.jsx
src/features/pos/components/sidebar/SidebarLoader.jsx
src/config/sidebarMenuConfig.js
src/config/sidebarStockItems.js
src/features/online/cart/store/cartStore.js
src/features/online/order/store/orderOnlineStore.js
```

Search next:

```txt
branchSlug
general-pos
selectedBranchId
currentBranch.id
loginAction({
logoutAction?.()
```

---

## 9. Working Conclusion

LoginPage is the main post-login navigation decision point for POS, customer, and superadmin identities.

Online checkout shares `loginAction`, so AuthStore changes cannot be treated as POS-only.

Checkout branch context currently uses both `currentBranch.id` and `selectedBranchId`, which should be clarified before branch/auth refactor.

Therefore, Auth stabilization must continue as architecture mapping before implementation.
