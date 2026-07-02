# Component Layer Map

Status: DRAFT / CERTIFICATION IN PROGRESS
Scope: Frontend component responsibility boundaries, runtime components, shell components, feature pages, and UI components
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Maps:
- `docs/map/Runtime_Flow_Map.md`
- `docs/map/Data_Ownership_Map.md`
- `docs/map/Dependency_Map.md`
- `docs/frontend/State_Management_Map.md`
- `docs/frontend/API_Surface_Map.md`

---

## 1. Purpose

This map classifies frontend components by responsibility before any major Auth/Login/Branch refactor.

เป้าหมายคือแยกให้ชัดว่า Component ใดเป็น Runtime Owner, Runtime Consumer, Shell, Feature Page หรือ Pure UI ก่อนเริ่ม Refactor

---

## 2. Component Layer Model

```txt
Application Layer
  ↓
Router Layer
  ↓
Layout Layer
  ↓
Shell Layer
  ↓
Feature Page Layer
  ↓
Feature Component Layer
  ↓
Shared Component Layer
  ↓
Pure UI Layer
```

---

## 3. Application Layer

### App

Path:

```txt
src/App.jsx
```

Classification:

```txt
APPLICATION RUNTIME OWNER / BOOTSTRAP CALLER
```

Responsibilities:

- Creates router through AppRouter.
- Calls authStore.bootstrapAuthAction at root level.
- Renders RouterProvider.

Risks:

```txt
HIGH
```

Reason:

Router renders while auth bootstrap may still be in progress. All route/page components must tolerate incomplete auth/branch state.

Rule:

Do not add business logic to App beyond application bootstrap.

---

## 4. Router Layer

### AppRouter

Path:

```txt
src/routes/AppRouter.jsx
```

Classification:

```txt
ROUTER OWNER / ROUTE TREE SOURCE
```

Responsibilities:

- Defines public partner routes.
- Defines POS route under `/:shopSlug/pos`.
- Defines online route under `/:shopSlug/shop`.
- Defines catch-all redirect.

Risks:

```txt
HIGH
```

Reason:

POS route tree appears not guarded by ProtectedRoute in reviewed files. URL shopSlug can drive navigation independently from authenticated branchSlug.

---

### posPartnerRoutes

Path:

```txt
src/routes/partner/posPartnerRoutes.jsx
```

Classification:

```txt
POS ROUTE CONFIG
```

Responsibilities:

- Defines POS module child routes.
- Does not mount ProtectedRoute in reviewed pass.

Risk:

```txt
HIGH if route guard introduced broadly
```

---

## 5. Layout Layer

### PartnerPosMasterLayout

Path:

```txt
src/routes/AppRouter.jsx
```

Classification:

```txt
POS LAYOUT SHELL COMPOSER
```

Responsibilities:

- Reads shopSlug from route params.
- Composes SidebarLoader, HeaderPos, and Outlet.
- Passes shopSlug into shell components.

Risks:

```txt
HIGH
```

Reason:

The POS shell is URL-shopSlug driven. If shopSlug drifts from authenticated branchSlug, shell navigation may be wrong.

---

## 6. Shell Layer

### HeaderPos

Path:

```txt
src/features/pos/components/header/HeaderPos.jsx
```

Classification:

```txt
SHELL RUNTIME CONSUMER / HIGH COMPLEXITY COMPONENT
```

Reads:

```txt
authStore.employee
authStore.user
authStore.role
authStore.isAuthenticatedSelector
authStore.logoutAction
branchStore.currentBranch
branchStore.selectedBranchId
branchStore.clearBranch
branchStore.loadAndSetBranchById
shopSlug prop
```

Mutates / side effects:

```txt
loadAndSetBranchById(selectedBranchId)
clearBranch()
logoutAction()
navigate()
```

Responsibilities:

- Displays POS identity/branch context.
- Builds top navigation using shopSlug.
- Handles logout.
- Can reload branch.

Risks:

```txt
CRITICAL
```

Reasons:

- Reads both auth and branch runtime.
- Logout ownership is split between authStore and HeaderPos.
- Branch reload uses selectedBranchId rather than explicitly using authStore.employee.branchId.

Refactor candidate:

```txt
HeaderPos Runtime Hook
HeaderPos Actions
HeaderPos UI
```

---

### SidebarLoader

Path:

```txt
src/features/pos/components/sidebar/SidebarLoader.jsx
```

Classification:

```txt
SHELL NAVIGATION CONSUMER / URL-DRIVEN SIDEBAR ENGINE
```

Reads:

```txt
shopSlug from useParams()
pathname from useLocation()
sidebar menu config
```

Does not read:

```txt
authStore
branchStore
```

Responsibilities:

- Determines active POS module from URL.
- Loads sidebar menu config using shopSlug.
- Renders module sidebar groups and items.

Risks:

```txt
MEDIUM
```

Reason:

Sidebar trusts URL shopSlug and does not validate against authenticated branch identity.

Refactor candidate:

```txt
Sidebar Engine
Sidebar Renderer
Sidebar Config
```

---

### UnifiedMainNav

Path:

```txt
src/components/common/UnifiedMainNav.jsx
```

Classification:

```txt
SHARED NAVIGATION SHELL / LOGOUT CONSUMER
```

Responsibilities:

- Shared navigation across non-POS or online surfaces.
- Calls logoutAction/logoutAllDevicesAction.
- Clears cart and branch storage.
- Navigates after logout.

Risks:

```txt
HIGH
```

Reason:

Logout redirect ownership is split between authStore and caller.

---

### LogoutButton

Path:

```txt
src/components/LogoutButton.jsx
```

Classification:

```txt
SHARED ACTION COMPONENT / LOGOUT CONSUMER
```

Responsibilities:

- Calls authStore.logout.
- Navigates to `/login`.

Risks:

```txt
MEDIUM
```

Reason:

Uses `logout`, while other surfaces use `logoutAction`.

---

## 7. Feature Page Layer

### LoginPage

Path:

```txt
src/features/auth/pages/LoginPage.jsx
```

Classification:

```txt
FEATURE PAGE / LOGIN RUNTIME ORCHESTRATOR / HIGH COMPLEXITY
```

Reads:

```txt
authStore.loginAction
authStore.isAuthenticatedSelector
authStore.isBootstrappingAuth
authStore.role
authStore.profileType
authStore.employee
authStore.rememberMe
authStore.lastLoginIdentifier
```

Mutates / side effects:

```txt
loginAction(credentials)
logoutAction() for invalid role branch
navigate() based on role/profile/branchSlug
useAuthStore.getState() after login
```

Responsibilities:

- Owns POS/customer/superadmin post-login navigation decision.
- Handles already-authenticated redirect.
- Uses `employee.branchSlug || general-pos` for POS route.

Risks:

```txt
CRITICAL
```

Reason:

LoginPage is not only a UI form. It is the current post-login navigation policy owner.

Refactor candidate:

```txt
Login Form UI
Login Runtime Handler
Post-login Navigation Policy
```

---

### CheckoutPage

Path:

```txt
src/features/online/order/pages/CheckoutPage.jsx
```

Classification:

```txt
FEATURE PAGE / ONLINE CHECKOUT ORCHESTRATOR / HIGH COMPLEXITY
```

Reads:

```txt
authStore.token
authStore.customer
branchStore.selectedBranchId
branchStore.currentBranch via getState()
cartStore
orderOnlineStore
```

Mutates / side effects:

```txt
fetchCartAction()
fetchCartBranchPricesAction(currentBranch.id)
submitOrderAction(payload)
navigate() after order success
```

Responsibilities:

- Owns online checkout orchestration.
- Composes order payload with customerId and branchId.
- Handles cart fetch, branch price fetch, and order submit.

Risks:

```txt
HIGH
```

Reason:

Uses both currentBranch.id and selectedBranchId in different points. Depends on authStore identity and branchStore branch selection.

Refactor candidate:

```txt
Checkout Runtime Hook
Checkout Form UI
Checkout Submit Policy
```

---

## 8. Feature Component Layer

### Online LoginForm

Path:

```txt
src/features/online/order/components/LoginForm.jsx
```

Classification:

```txt
FEATURE COMPONENT / SHARED AUTH CONSUMER
```

Responsibilities:

- Calls authStore.loginAction.
- Merges/fetches cart after login.
- Calls onSuccess(role).
- May set currentBranch for employee profile branch.

Risks:

```txt
HIGH
```

Reason:

Uses same loginAction as POS LoginPage. AuthStore changes affect online checkout.

---

### StaffSettingsPage

Path:

```txt
src/features/auth/pages/StaffSettingsPage.jsx
```

Classification:

```txt
FEATURE PAGE / UI-GATED ADMIN SETTINGS
```

Responsibilities:

- Reads authStore.employee.
- Reads authStore.isAdminOrAboveSelector.
- Renders access denied UI if not allowed.

Risk:

```txt
MEDIUM
```

Reason:

Authorization is page-level UI gate, not route-level guard.

---

## 9. Shared / Pure UI Layer

Examples:

```txt
Button
Card
Dialog
Input
Table
Avatar
Badge
```

Classification:

```txt
PURE UI / LOW RISK IF KEPT STATELESS
```

Rule:

Pure UI components should not own auth, branch, API, navigation, or persistence logic.

---

## 10. High Complexity Component Register

### Critical

```txt
HeaderPos
LoginPage
CheckoutPage
```

Reasons:

- Read multiple stores.
- Trigger runtime actions.
- Navigate.
- Perform business policy decisions.

---

### High

```txt
UnifiedMainNav
SidebarLoader
Online LoginForm
PartnerPosMasterLayout
```

Reasons:

- Runtime shell behavior.
- Navigation ownership.
- Cross-store cleanup or shared Auth action usage.

---

### Medium

```txt
StaffSettingsPage
LogoutButton
Sidebar config files
```

Reasons:

- Runtime consumer but smaller surface.

---

## 11. Component Refactor Principles

When implementation starts:

```txt
1. Do not rewrite high-complexity components in one pass.
2. Extract runtime hooks before changing UI.
3. Extract navigation policy before changing route behavior.
4. Extract action handlers before changing store semantics.
5. Keep behavior-preserving patches small.
6. Verify one file at a time.
```

---

## 12. Proposed Future Component Architecture

### HeaderPos

```txt
useHeaderPosRuntime()
useHeaderPosActions()
HeaderPosView
```

### SidebarLoader

```txt
getActivePosModule(pathname)
buildSidebarMenu(shopSlug)
SidebarRenderer
```

### LoginPage

```txt
useLoginRuntime()
resolvePostLoginRoute(authState)
LoginFormView
```

### CheckoutPage

```txt
useCheckoutRuntime()
buildOrderPayload()
CheckoutView
```

---

## 13. Current Working Conclusion

The highest-risk components are not risky because of UI. They are risky because they mix runtime, navigation, store reads, store writes, and business policy decisions.

Before Auth/Login refactor, these components should be treated as runtime surfaces, not simple React components.

Frontend Architecture Certification should continue with Architecture Decision Log / ADR next.
