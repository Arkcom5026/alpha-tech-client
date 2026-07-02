# P1 Dependency Map — Frontend Architecture Certification

Status: DRAFT / API TRANSPORT VERIFIED
Scope: Frontend only
Repository: alpha-tech-client
Active Blueprint: `docs/blueprint/Active_Blueprint.md`

---

## 1. Purpose

This map records frontend runtime dependencies before any Login/Auth refactor.

เป้าหมายคือทำให้เห็นว่า Runtime หลักของ Frontend ถูกเรียกใช้จากไฟล์ไหนบ้าง ก่อนแก้ระบบ Login/Auth เพื่อป้องกัน Regression

This document is not a refactor plan yet.

เอกสารนี้ยังไม่ใช่แผนแก้โค้ด แต่เป็นแผนที่ผลกระทบ

---

## 2. Current Investigation Status

### Completed Initial Searches

- `useAuthStore`
- `useBranchStore`
- `useAuthStore.getState`
- `useBranchStore.getState`
- `loginAction`
- `logoutAction`
- `bootstrapAuthAction`
- `verifySessionAction`
- `selectedBranchId`
- `currentBranch`
- `employee.branchId`
- `employee.branchSlug`
- `shopSlug`
- `apiClient`
- `ProtectedRoute`
- `AuthGate`, `RequireAuth`, `PrivateRoute`, `ProtectRoute`
- `usePermission`
- `RequirePermission`
- `IfPermission`

### Completed File Reads

- `src/features/auth/components/ProtectedRoute.jsx`
- `src/routes/AppRouter.jsx`
- `src/routes/partner/posPartnerRoutes.jsx`
- `src/store/rootStore.js`
- `src/utils/branchHelpers.js`
- `src/features/employee/store/employeeStore.js`
- `src/hooks/usePermission.js`
- `src/components/auth/RequirePermission.jsx`
- `src/components/auth/IfPermission.jsx`
- `src/features/auth/pages/StaffSettingsPage.jsx`
- `src/components/LogoutButton.jsx`
- `src/components/common/UnifiedMainNav.jsx`
- `src/features/superadmin/sidebar/SidebarSuperAdmin.jsx`
- `src/features/auth/store/authStore.js`
- `src/features/branch/store/branchStore.js`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/utils/apiClient.js`
- `src/features/auth/api/authApi.js`

### Related Focused Verification

```txt
docs/map/Permission_Identity_Dependency_Verification.md
```

### Important Note

Search results are broad and must be reviewed file-by-file before making architectural claims final.

ผลการค้นหาเป็นรอบแรก ยังต้องเปิดอ่านไฟล์สำคัญทีละไฟล์ก่อนล็อกข้อสรุป

---

## 3. Core Runtime Owners

### 3.1 Auth Runtime Owner

Primary file:

```txt
src/features/auth/store/authStore.js
```

Verified role:

- Owns token/session state: `token`, `accessToken`, `session`, `rememberMe`, `lastLoginIdentifier`.
- Owns identity state: `role`, `profileType`, `employee`, `customer`, `isSuperAdmin`.
- Owns auth lifecycle actions: `loginAction`, `verifySessionAction`, `bootstrapAuthAction`, `logout`, `logoutAction`, `logoutAllDevicesAction`, `resetAuthStateAction`.
- Imports `apiClient` and calls `/auth/me`, `/auth/refresh`, and `/auth/add-sub-employee` through frontend transport.
- Imports `useBranchStore` and calls `loadAndSetBranchById` after login/verify when branchId exists.
- Persists only `rememberMe` and `lastLoginIdentifier`.

Current risk:

- HIGH. AuthStore controls app bootstrap, login, verify, refresh, logout, identity, and branch handoff.
- Any AuthStore refactor can affect both POS and online customer flows.

---

### 3.2 Branch Runtime Owner

Primary file:

```txt
src/features/branch/store/branchStore.js
```

Verified role:

- Owns `branches`, `currentBranch`, `selectedBranchId`, and `version`.
- Owns loading branch list and branch by id.
- Owns online branch auto-selection through geolocation and last-selected localStorage key.
- Owns `clearBranch` and `clearStorage`.
- Persists `currentBranch`, `selectedBranchId`, and `version`.

Current risk:

- HIGH. BranchStore mixes POS branch detail handoff from authStore with online branch auto-selection behavior.
- POS identity branch must not drift from logged-in employee branch.

---

### 3.3 Transport Runtime Owner

Primary file:

```txt
src/utils/apiClient.js
```

Verified role:

- Owns runtime baseURL resolution.
- Forces `withCredentials=true` on requests.
- Reads bearer token from authStore through `useAuthStore.getState()`.
- Attaches Authorization header to non-auth-bypass requests.
- Owns 401 handling with one shared refresh queue.
- Calls `/auth/refresh` directly with axios, not apiClient, to avoid interceptor loops.
- Updates authStore token/session after refresh succeeds.
- Retries the original request once after refresh.
- Does not reset authStore automatically on refresh failure.

Current risk:

- VERY HIGH. Most API modules depend on `apiClient`.
- Session continuity depends heavily on cookie transport, refresh endpoint behavior, and refresh queue correctness.

---

### 3.4 Employee Management Store

Primary file:

```txt
src/features/employee/store/employeeStore.js
```

Verified status:

- File header explicitly states this store is HR / Employee Management only.
- File header explicitly states Auth / current login branch Source of Truth is `authStore.employee.branchId`.
- File header explicitly states Branch detail / selected branch is owned by branchStore.
- It keeps deprecated compatibility fields: `employee`, `branch`, `position`, `token`, `role`.
- These compatibility fields are not intended to be source of truth for current session.
- Persist config uses `migrate: () => ({})` and `partialize: () => ({})`, so active session/branch/token/role are not persisted here.

Interpretation:

`employeeStore` should be treated as HR/Employee-management state, not Auth Runtime owner.

Risk:

MEDIUM while compatibility fields remain. Old components may still read deprecated fields, but the file itself documents that authStore is the real login/session authority.

---

## 4. AuthStore Dependency Inventory

### 4.1 Root / Runtime Bootstrap Consumers

```txt
src/App.jsx
src/store/rootStore.js
src/utils/apiClient.js
```

Interpretation:

- `App.jsx` is the global bootstrap caller.
- `apiClient.js` is a transport-level consumer of auth token/session state.
- `rootStore.js` aggregates multiple stores but imports from legacy-looking paths and must not be treated as authoritative without import-path verification.

Risk:

- Changing authStore action names or state shape can break bootstrap or transport.
- rootStore may be stale or alias-inconsistent because it imports `./authStore` and `./branchStore` while active stores reviewed elsewhere live under feature paths.

---

### 4.2 Login / Auth Page Consumers

```txt
src/features/auth/pages/LoginPage.jsx
src/features/auth/pages/ForgotPasswordPage.jsx
src/features/auth/pages/ResetPasswordPage.jsx
src/features/auth/pages/PartnerWelcomePage.jsx
src/features/auth/pages/StaffSettingsPage.jsx
src/features/online/order/components/LoginForm.jsx
```

Interpretation:

- LoginPage is the main POS/partner login entry.
- Online order LoginForm also calls auth login behavior.
- StaffSettingsPage reads employee from authStore and checks `isAdminOrAboveSelector` for UI-level access.

Risk:

- Login behavior affects both POS and online checkout login surfaces.
- Do not assume Login/Auth is POS-only.
- StaffSettingsPage is UI-gated by authStore selector, not by route guard.

---

### 4.3 POS / Shared Shell / Navigation Consumers

```txt
src/features/pos/components/header/HeaderPos.jsx
src/components/common/UnifiedMainNav.jsx
src/components/LogoutButton.jsx
src/features/superadmin/sidebar/SidebarSuperAdmin.jsx
```

Interpretation:

- HeaderPos displays session and triggers logout.
- HeaderPos reads `employee`, `user`, `logoutAction`, `isAuthenticatedSelector`, and `role` from authStore.
- HeaderPos reads `currentBranch.name`, `selectedBranchId`, `clearBranch`, and `loadAndSetBranchById` from branchStore.
- UnifiedMainNav triggers logout and logout-all-devices for online/shared navigation.
- LogoutButton calls `state.logout`, not `logoutAction`, and redirects to `/login`.
- SidebarSuperAdmin calls `logoutAction` but does not navigate itself.

Risk:

- Logout behavior is not isolated to one component.
- A logout refactor must identify every caller, not only HeaderPos.
- `logoutAction` already forces `window.location.href = '/login'`, so components that call it and also navigate may create competing redirects.
- `LogoutButton` uses `logout`, which exists, but has different redirect ownership than `logoutAction`.
- HeaderPos branch reload logic currently uses `selectedBranchId`, not directly `employee.branchId`, which may drift from POS login identity branch.

---

### 4.4 Product / Master Data Consumers

```txt
src/features/product/pages/ListProductPage.jsx
src/features/product/components/ProductForm.jsx
src/features/productTemplate/pages/ListProductTemplatePage.jsx
src/features/productTemplate/pages/EditProductTemplatePage.jsx
src/features/productType/pages/ListProductTypePage.jsx
src/features/productType/pages/CreateProductTypePage.jsx
src/features/productType/pages/EditProductTypePage.jsx
src/features/productProfile/pages/CreateProductProfilePage.jsx
src/features/productProfile/pages/ListProductProfilePage.jsx
src/features/category/pages/ListCategoryPage.jsx
src/features/brand/pages/ListBrandPage.jsx
src/features/bank/page/ListBankPage.jsx
```

Interpretation:

- Product/master-data pages read auth state directly.
- Some of these pages may use auth only for branchId, role, or UI display.

Risk:

- Product and master-data surfaces are likely indirect Auth Runtime consumers.
- This increases risk of changing `employee`, `role`, or branch fields in authStore.

---

### 4.5 Employee / Settings Consumers

```txt
src/features/employee/pages/ListEmployeePage.jsx
src/features/employee/pages/EditEmployeePage.jsx
src/features/employee/pages/EmployeeFormPage.jsx
src/features/employee/pages/ManageRolesPage.jsx
src/features/employee/components/EmployeeTable.jsx
src/features/auth/components/SubEmployeeManager.jsx
```

Interpretation:

- Employee/settings surfaces have auth dependencies.
- Some may overlap with future RBAC or position capability work.

Risk:

- Keep RBAC out of the current Auth stabilization scope.
- These files should be reviewed before changing role/profile fields.

---

### 4.6 Online / Customer Consumers

```txt
src/features/online/cart/components/CartPanel.jsx
src/features/online/cart/pages/CartPage.jsx
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/order/components/CustomerInfoForm.jsx
src/features/customer/components/CheckoutForm.jsx
```

Interpretation:

- AuthStore affects online customer checkout and cart surfaces.
- Auth refactor must preserve customer login and checkout behavior.

Risk:

- POS session work could accidentally break online customer flow.

---

### 4.7 Operational / Print Consumers

```txt
src/features/purchaseOrder/components/PurchaseOrderSupplierSelector.jsx
src/features/purchaseOrder/pages/PrintPurchaseOrderPage.jsx
src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx
```

Interpretation:

- Some operational and print surfaces read auth/employee/branch context.

Risk:

- Print pages often run on direct open/refresh, so bootstrap timing matters.

---

## 5. AuthStore Lifecycle Inventory

### 5.1 `bootstrapAuthAction`

Verified behavior:

- Sets `isBootstrappingAuth=true`.
- If access token already exists in memory, calls `verifySessionAction`.
- If no token exists, calls `/auth/refresh` through `apiClient.post`.
- If refresh returns accessToken, stores token/session and then calls `verifySessionAction`.
- If refresh returns 401/403, clears token/accessToken and marks `authChecked=true`.

Risk:

- Bootstrap depends on refresh cookie/backend behavior.
- Since authStore persists only rememberMe and lastLoginIdentifier, reload recovery depends on `/auth/refresh` and cookie transport.

---

### 5.2 `verifySessionAction`

Verified behavior:

- Requires in-memory `accessToken || token`.
- Calls `/auth/me` through apiClient.
- Derives effective role/profile from server role, profile type, employee position, and branch data.
- Requires branchId for `employee` or `admin` before POS access.
- Builds `employee` or `customer` identity object in authStore.
- Calls `branchStore.loadAndSetBranchById(branchId)` if branchId exists.
- On error, it does not force reset for 401 to allow apiClient silent refresh path, but sets `authChecked=false`.

Risk:

- `authChecked=false` after verify failure may make UI look unauthenticated even if apiClient is trying to refresh.
- Role/position derivation is central and affects StaffSettingsPage, HeaderPos, and future permission gates.

---

### 5.3 `loginAction`

Verified behavior:

- Calls `loginUser(credentials)`.
- Derives effective role/profile type similarly to verify.
- Requires branchId for employee/admin.
- Stores token/accessToken/session/identity.
- Calls `branchStore.loadAndSetBranchById(targetBranchId)` after login.
- Returns token, role, profileType, and profile.

Risk:

- Login response shape is critical for POS and online login.
- Branch handoff to branchStore is part of login runtime and must remain stable until branch ownership is redesigned.

---

### 5.4 Logout Actions

Verified actions:

```txt
logout
logoutAction
logoutAllDevicesAction
resetAuthStateAction
clearStorage
```

Verified behavior:

- `logout` calls `logoutSession()` then `resetAuthStateAction()`.
- `logoutAction` calls `logoutSession()`, then `resetAuthStateAction()`, then forces `window.location.href = '/login'`.
- `logoutAllDevicesAction` calls `logoutAllSessions()` then `resetAuthStateAction()`.
- `resetAuthStateAction` preserves rememberMe and lastLoginIdentifier depending on rememberMe, clears all other auth state, and removes legacy localStorage `token` and `role`.

Risk:

- Different UI surfaces call different logout actions and also perform their own navigation.
- `logoutAction` owning `window.location.href` makes it harder for callers to control redirect consistently.

---

## 6. BranchStore Dependency Inventory

### 6.1 Core / Utility Consumers

```txt
src/store/rootStore.js
src/utils/branchHelpers.js
src/features/branch/store/branchStore.js
src/features/auth/store/authStore.js
```

Interpretation:

- AuthStore calls branchStore behavior after login/verify.
- branchHelpers directly reads branch store state.
- branchHelpers uses IP-based geo logic to select nearest branch; this is online/geo selection behavior, not POS login branch ownership.

Risk:

- Branch logic exists outside branchStore itself.
- branchHelpers imports `useBranchStore` from `@/stores/branchStore`, which looks inconsistent with the reviewed feature-store path and must be verified before use.
- branchHelpers reads `allBranches`, while current branchStore owns `branches`; this may indicate stale code or naming drift.

---

### 6.2 POS / Shared Shell Consumers

```txt
src/features/pos/components/header/HeaderPos.jsx
src/components/common/UnifiedMainNav.jsx
```

Interpretation:

- Header and navigation display branch context.
- Header may also trigger branch loading or clearing.
- UnifiedMainNav clears branch storage via `clearStorage` during online/shared logout.

Risk:

- POS branch display must follow logged-in employee branch, not arbitrary selected branch.
- Branch cleanup names differ across surfaces and require verification: `clearBranch`, `clearStorage`.
- Both `clearBranch` and `clearStorage` exist and currently perform the same reset of branch state plus localStorage branch-storage removal.

---

### 6.3 Online Branch Consumers

```txt
src/features/online/components/SidebarOnline.jsx
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/order/components/LoginForm.jsx
src/features/online/productOnline/pages/ProductOnlineListPage.jsx
src/features/online/productOnline/pages/ProductOnlineDetailPage.jsx
src/features/online/productOnline/components/ProductCardOnline.jsx
src/features/online/productOnline/store/productOnlineStore.jsx
```

Interpretation:

- Online surfaces depend heavily on branchStore.
- BranchStore contains explicit online auto-select behavior and localStorage key `online_last_branch_id`.

Risk:

- Online branch selection must not be treated the same as POS login branch identity.
- `ensureSelectedBranchAction` can select last branch, geo branch, or first branch. This must not override POS identity branch unless explicitly allowed.

---

### 6.4 Product / Supplier / Stock Consumers

```txt
src/features/product/pages/ListProductPage.jsx
src/features/product/pages/ViewProductPage.jsx
src/features/product/pages/CreateProductPage.jsx
src/features/product/pages/ReadyToSellListPage.jsx
src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx
src/features/productTemplate/pages/CreateProductTemplatePage.jsx
src/features/productTemplate/pages/EditProductTemplatePage.jsx
src/features/supplier/pages/ListSupplierPage.jsx
src/features/supplier/pages/CreateSupplierPage.jsx
src/features/supplier/pages/EditSupplierPage.jsx
src/features/supplier/pages/UpdateSupplierPage.jsx
src/features/supplier/pages/ViewSupplierPage.jsx
src/features/supplier/components/SupplierForm.jsx
src/features/supplier/store/supplierStore.js
```

Interpretation:

- Product, supplier, and related stock surfaces depend on branch runtime.

Risk:

- Branch context mistakes can affect product filtering, supplier views, and stock operations.

---

### 6.5 Reports / Print Consumers

```txt
src/features/inputTaxReport/pages/ListInputTaxReportPage.jsx
src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx
src/features/salesTaxReport/pages/PrintSalesTaxReportPage.jsx
src/features/purchaseOrder/pages/PrintPurchaseOrderPage.jsx
```

Interpretation:

- Reporting and print surfaces need branch context.

Risk:

- Direct refresh/open behavior requires stable bootstrap and branch recovery.

---

## 7. Transport Dependency Inventory

### 7.1 apiClient Direct Consumers

API and service modules using `apiClient` include:

```txt
src/features/auth/api/authApi.js
src/features/branch/api/branchApi.jsx
src/features/unit/api/unitApi.js
src/features/product/api/productApi.js
src/features/product/api/productImagesApi.js
src/features/productLookup/api/productLookupApi.js
src/features/productType/api/productTypeApi.js
src/features/productTemplate/api/productTemplateApi.js
src/features/productProfile/api/productProfileApi.js
src/features/category/api/categoryApi.js
src/features/brand/api/brandApi.js
src/features/bank/api/bankApi.js
src/store/bankStore.js
src/features/sales/api/saleApi.js
src/features/salesReport/api/salesReportApi.js
src/features/salesTaxReport/api/salesTaxReportApi.js
src/features/saleReturn/api/saleReturnApi.js
src/features/stock/api/stockApi.js
src/features/stockAudit/api/stockAuditApi.js
src/features/stockItem/api/stockItemApi.js
src/features/quickReceive/api/quickReceiveApi.js
src/features/quickReceive/store/quickReceiveStore.js
src/features/purchaseOrder/api/purchaseOrderApi.js
src/features/purchaseOrder/services/procurementService.js
src/features/purchaseOrder/store/purchaseOrderStore.js
src/features/purchaseReport/api/purchaseReportApi.js
src/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi.js
src/features/purchaseOrderReceiptItem/api/purchaseOrderReceiptItemApi.js
src/features/payment/api/paymentApi.js
src/features/paymentOnline/api/paymentOnlineApi.js
src/features/finance/api/financeApi.js
src/features/customer/api/customerApi.js
src/features/customerReceipt/api/customerReceiptApi.js
src/features/customerDeposit/api/customerDepositApi.js
src/features/online/cart/api/cartApi.js
src/features/online/order/api/orderOnlineApi.js
src/features/online/productOnline/api/productOnlineApi.jsx
src/features/address/api/addressApi.js
src/features/employee/api/employeeApi.js
src/features/position/api/positionApi.js
src/features/supplier/api/supplierApi.js
src/features/supplierPayment/api/supplierPaymentApi.js
src/features/deliveryNote/api/deliveryNoteApi.js
src/features/barcode/api/barcodeApi.js
src/features/combinedBilling/api/combinedBillingApi.js
```

Interpretation:

- apiClient is a system-wide transport dependency.

Risk:

- Any apiClient refresh/interceptor change is broad-impact and must be tested across modules.

---

### 7.2 Auth API Surface

Reviewed file:

```txt
src/features/auth/api/authApi.js
```

Verified endpoints:

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all
POST /auth/forgot-password
POST /auth/reset-password
```

Interpretation:

- authApi is a thin wrapper over apiClient.
- authStore uses some imported authApi functions and also calls apiClient directly for `/auth/me`, `/auth/refresh`, and `/auth/add-sub-employee`.

Risk:

- Auth API calls are not fully centralized in authApi because authStore also calls apiClient directly.
- During refactor, endpoint ownership should be standardized only after mapping is complete.

---

### 7.3 apiClient Refresh Behavior

Verified behavior:

- Request interceptor resolves baseURL dynamically on every request.
- Request interceptor sends `withCredentials=true` on every request.
- Request interceptor attaches bearer token from authStore except auth bypass endpoints.
- Response interceptor only attempts refresh on 401 for non-auth-bypass, non-refresh, non-logout requests.
- Refresh uses a shared `refreshPromise` so concurrent 401s share one refresh call.
- Refresh success updates authStore token/accessToken/session and marks `authChecked=true`.
- Original request is retried once with the new bearer token.

Risk:

- Session continuity depends on refresh cookie presence and host consistency.
- If refresh succeeds, only token/session are updated; full identity rebuild still depends on authStore verify/bootstrap behavior.
- If refresh fails, authStore is not automatically cleared by apiClient; caller receives refresh error.

---

## 8. Route Guard / Permission Dependency Inventory

### 8.1 ProtectedRoute File Verification

Reviewed file:

```txt
src/features/auth/components/ProtectedRoute.jsx
```

Observed behavior:

- Reads `isAuthenticatedSelector`, `isBootstrappingAuth`, `role`, and `token` from `authStore`.
- While `isBootstrappingAuth` is true, it returns `null` and does not redirect.
- If a token exists but `isAuthenticated` is false, it returns `null` and waits.
- If unauthenticated, it redirects to `/login`.
- If `allowedRoles` is provided and the role is not allowed, it redirects to `/unauthorized`.
- If allowed, it renders `children` or `<Outlet />`.

### 8.2 Active Route Mount Verification

Reviewed files:

```txt
src/routes/AppRouter.jsx
src/routes/partner/posPartnerRoutes.jsx
```

Current finding:

- Search found only the component file and documentation references.
- `AppRouter.jsx` does not import or mount `ProtectedRoute`.
- `posPartnerRoutes.jsx` does not import or mount `ProtectedRoute`.
- POS route tree mounts `PartnerPosMasterLayout` directly under `/:shopSlug/pos`.

Interpretation:

- `ProtectedRoute` exists and is reasonably defensive against premature redirect during bootstrap.
- At this pass, it appears dormant in the active POS route tree.
- Current POS access appears to rely mainly on App bootstrap, authStore, apiClient refresh/retry, page-level behavior, and the catch-all redirect.

Risk:

- HIGH. If POS pages render without a mounted guard, invalid or missing auth may only be detected after page/API behavior.
- HIGH. If a guard is later added too broadly, it may affect all POS modules at once.

---

### 8.3 Permission Candidate Files

Reviewed files:

```txt
src/hooks/usePermission.js
src/components/auth/RequirePermission.jsx
src/components/auth/IfPermission.jsx
src/features/auth/rbac/rbacClient.js
```

Verified behavior:

- `usePermission` reads `employee` from employeeStore and `customer` from customerStore.
- `usePermission` derives `activeUser` as `employee || customer`.
- `usePermission` does not read identity from authStore.
- `RequirePermission` uses `usePermission()` and returns `null` if role/permission checks fail.
- `IfPermission` uses `usePermission()` and returns `null` if permission checks fail.
- `RequirePermission` and `IfPermission` do not redirect, do not call APIs, and do not mutate state.
- Repository search found only their own files and documentation references during this pass.

Interpretation:

- Permission/RBAC helper code exists but appears dormant in this pass.
- Permission helpers currently derive identity from employeeStore/customerStore, not authStore.
- Because employeeStore is documented as HR/Employee Management only, permission identity source is not certified for active runtime gating.
- AuthStore itself also exposes capability selectors through rbacClient. These are currently consumed by some UI selectors such as `isAdminOrAboveSelector`.

Risk:

- LOW if dormant.
- HIGH if mounted without identity-source migration.
- VERY HIGH if activated during Login/Auth stabilization.

Working rule:

Do not activate or refactor RBAC / permission gating during current Login/Auth stability work.

---

## 9. Branch Truth Dependencies

### 9.1 `selectedBranchId`

Known consumers include:

```txt
src/utils/branchHelpers.js
src/features/branch/store/branchStore.js
src/features/pos/components/header/HeaderPos.jsx
src/features/online/components/SidebarOnline.jsx
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/productOnline/pages/ProductOnlineListPage.jsx
src/features/online/productOnline/pages/ProductOnlineDetailPage.jsx
src/features/product/pages/ListProductPage.jsx
src/features/product/pages/ViewProductPage.jsx
src/features/product/pages/ReadyToSellListPage.jsx
src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx
src/features/supplier/pages/ListSupplierPage.jsx
src/features/supplier/store/supplierStore.js
```

Risk:

- `selectedBranchId` may represent online branch selection, POS branch context, or admin-selected branch depending on surface.
- This must be clarified before any branch/auth refactor.
- HeaderPos currently reloads branch from `selectedBranchId` when employee/authenticated conditions pass.

---

### 9.2 `employee.branchId`

Known consumers include:

```txt
src/features/auth/store/authStore.js
src/features/auth/pages/LoginPage.jsx
src/features/employee/store/employeeStore.js
src/features/brand/pages/ListBrandPage.jsx
src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx
src/features/purchaseOrder/pages/PrintPurchaseOrderPage.jsx
```

Verified role:

- AuthStore derives this from login and `/auth/me` responses.
- AuthStore requires branchId for employee/admin.
- AuthStore passes branchId to branchStore after login/verify.

Risk:

- This is the strongest candidate canonical POS branch identity source.
- BranchStore selectedBranchId must not override it without explicit authorized branch-switch behavior.

---

### 9.3 `employee.branchSlug`

Known consumers include:

```txt
src/features/auth/pages/StaffSettingsPage.jsx
```

Verified use:

- StaffSettingsPage displays `@employee.branchSlug` or fallback `สาขาหลัก`.

Risk:

- URL `shopSlug` is widely used while `employee.branchSlug` direct runtime usage appears limited.
- This suggests slug canonicalization needs deeper route-level review.

---

### 9.4 `shopSlug`

Known broad consumers include:

```txt
src/routes/AppRouter.jsx
src/config/sidebarMenuConfig.js
src/config/sidebarStockItems.js
src/features/pos/components/sidebar/SidebarLoader.jsx
src/features/pos/components/header/HeaderPos.jsx
src/features/purchaseOrder/hooks/usePurchaseOrderForm.js
src/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore.js
src/features/salesReport/pages/SalesDashboardPage.jsx
src/features/salesReport/pages/SalesListPage.jsx
src/features/salesReport/pages/SalesDetailPage.jsx
src/features/employee/pages/ListEmployeePage.jsx
src/features/employee/pages/EditEmployeePage.jsx
src/features/employee/pages/EmployeeFormPage.jsx
src/features/brand/pages/CreateBrandPage.jsx
src/features/brand/pages/EditBrandPage.jsx
src/features/brand/pages/ListBrandPage.jsx
src/features/category/pages/CreateCategoryPage.jsx
src/features/productTemplate/pages/ListProductTemplatePage.jsx
src/features/unit/pages/CreateUnitPage.jsx
src/features/unit/pages/EditUnitPage.jsx
src/features/unit/pages/ListUnitPage.jsx
src/features/barcode/pages/BarcodeReceiptListPage.jsx
src/features/customerReceipt/pages/PrintCustomerReceiptPage.jsx
```

Risk:

- URL slug is a major navigation dependency.
- HeaderPos builds all top nav paths from URL `shopSlug`.
- If POS canonical branch slug changes, many route-building components may be affected.

---

## 10. Preliminary Dependency Risk Matrix

### High Risk

- `src/features/auth/store/authStore.js`
- `src/features/branch/store/branchStore.js`
- `src/utils/apiClient.js`
- `src/App.jsx`
- `src/features/auth/pages/LoginPage.jsx`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/routes/AppRouter.jsx`
- `src/features/auth/components/ProtectedRoute.jsx` if mounted later
- Logout surfaces using inconsistent actions or redirects

Reason:
These files sit at runtime entry, identity, branch context, transport, shell, guard, or session cleanup level.

---

### Medium Risk

- Product/master-data pages using authStore or branchStore.
- Supplier pages and supplierStore.
- Online checkout and online product pages.
- Report/print pages.
- Employee/settings pages.
- `src/features/employee/store/employeeStore.js` compatibility fields.
- `src/store/rootStore.js` if still imported anywhere.
- `src/utils/branchHelpers.js` because it may contain stale branch imports/field names.
- `src/features/auth/pages/StaffSettingsPage.jsx` because it is UI-gated, not route-gated.

Reason:
These files are runtime consumers or compatibility surfaces and may break if store shape, permission logic, or branch ownership changes.

---

### Low Risk For Current Agenda

- RBAC helper files if kept dormant.
- Sidebar menu config files if not changing permission behavior.
- Static page-level components that only display state and do not mutate runtime.

---

## 11. Verified Discoveries

### DISC-FE-AUTH-001 — ProtectedRoute is candidate/dormant in POS route tree

Status: VERIFIED IN REVIEWED ROUTES

Evidence:

- `ProtectedRoute.jsx` exists and reads authStore state.
- `AppRouter.jsx` and `posPartnerRoutes.jsx` do not mount it.

Impact:

- Do not assume route-level protection is active for POS.

---

### DISC-FE-AUTH-002 — employeeStore is not session source of truth

Status: VERIFIED BY FILE HEADER AND PERSIST CONFIG

Evidence:

- `employeeStore.js` file header explicitly documents HR / Employee Management only.
- It states Auth/current login branch Source of Truth is `authStore.employee.branchId`.
- It does not persist session/branch/token/role.

Impact:

- `employeeStore` should not own active Login/Auth session.
- Deprecated compatibility fields must be treated carefully until all consumers are reviewed.

---

### DISC-FE-AUTH-003 — authStore persists only rememberMe and lastLoginIdentifier

Status: VERIFIED BY FILE READ

Evidence:

- `authStore` persist partialize includes only `rememberMe` and `lastLoginIdentifier`.
- Token/session/employee/customer are not persisted by Zustand.

Impact:

- Browser reload session recovery depends on `/auth/refresh` and cookie transport, not local Zustand persistence.

---

### DISC-FE-AUTH-004 — AuthStore owns branch handoff after login/verify

Status: VERIFIED BY FILE READ

Evidence:

- `loginAction` and `verifySessionAction` call `useBranchStore.getState().loadAndSetBranchById(...)` when branchId exists.

Impact:

- BranchStore runtime details are derived from AuthStore employee branch identity after login/verify.

---

### DISC-FE-TRANSPORT-001 — apiClient owns refresh queue and retry

Status: VERIFIED BY FILE READ

Evidence:

- apiClient keeps a module-level `refreshPromise`.
- On eligible 401, it calls `/auth/refresh`, updates authStore token/session, and retries the original request once.

Impact:

- Token continuity is already partially handled at transport level.
- Full identity/branch recovery still depends on authStore verify/bootstrap.

---

### DISC-FE-TRANSPORT-002 — apiClient bypasses auth endpoints from refresh retry

Status: VERIFIED BY FILE READ

Evidence:

- Login, register, forgot-password, reset-password, refresh, and logout endpoints are auth-bypass endpoints.
- apiClient does not attach bearer token or retry refresh for these endpoints.

Impact:

- This helps prevent refresh loops.
- Logout and refresh behavior must be coordinated with authStore because auth endpoints bypass retry.

---

### DISC-FE-BRANCH-001 — branchHelpers appears online/geo-selection oriented

Status: VERIFIED BY FILE READ

Evidence:

- `branchHelpers.js` fetches location via `ip-api.com` and estimates nearest branch.
- It reads branch state imperatively through `useBranchStore.getState()`.

Impact:

- This should not be mixed with POS identity branch ownership.
- Import path and field names need verification before treating it as active runtime.

---

### DISC-FE-BRANCH-002 — branchStore mixes POS branch details and online auto-select

Status: VERIFIED BY FILE READ

Evidence:

- `loadAndSetBranchById` sets `currentBranch` and `selectedBranchId`.
- `ensureSelectedBranchAction` can select branch from current branch, last online branch, geolocation, or first branch.
- branchStore persists `currentBranch` and `selectedBranchId`.

Impact:

- POS branch identity must be anchored by `authStore.employee.branchId`.
- Online branch auto-selection must not override POS branch context unless explicitly authorized.

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

### DISC-FE-LOGOUT-001 — Logout behavior is split across multiple surfaces

Status: VERIFIED BY FILE READ

Evidence:

- UnifiedMainNav calls `logoutAction`, clears cart, clears branch storage, then navigates to `/`.
- UnifiedMainNav also calls `logoutAllDevicesAction`.
- LogoutButton calls `logout`, then navigates to `/login`.
- SidebarSuperAdmin calls `logoutAction` but does not navigate.
- HeaderPos calls `clearBranch`, then `logoutAction`, then `navigate('/')`.

Impact:

- Logout must be standardized before Auth cleanup.
- Need to decide whether authStore or caller owns redirect.

---

### DISC-FE-STAFF-001 — StaffSettingsPage uses authStore UI-gating

Status: VERIFIED BY FILE READ

Evidence:

- StaffSettingsPage reads `employee` from authStore.
- StaffSettingsPage reads `isAdminOrAboveSelector` from authStore.
- If not admin-or-above, it renders access-denied UI instead of redirecting.

Impact:

- Staff access is UI-gated at page level, not route-guarded.
- Role selector semantics must remain stable until authorization is redesigned.

---

### DISC-FE-HEADER-001 — HeaderPos can reload branch using selectedBranchId

Status: VERIFIED BY FILE READ

Evidence:

- HeaderPos effect checks authenticated employee and calls `loadAndSetBranchById(selectedBranchId)`.

Impact:

- Potential branch drift risk if selectedBranchId differs from authStore.employee.branchId.
- This must be reviewed before changing branch ownership.

---

## 12. Open Questions

1. Is `rootStore.js` still imported by active components?
2. Which pages read `employee.branchId` as operational branch truth?
3. Which pages read `selectedBranchId` as online branch selection only?
4. Which pages mutate branch state directly?
5. Does any feature call `logoutAction` outside the known navigation components?
6. Does any print page bypass normal bootstrap assumptions?
7. Should `shopSlug` be derived from logged-in branch or remain URL-driven?
8. Which old components still read deprecated employeeStore compatibility fields?
9. Should authStore own redirects in logoutAction, or should callers own navigation?
10. Should HeaderPos reload branch from `employee.branchId` instead of `selectedBranchId`?
11. Should BranchStore separate POS identity branch from online selected branch in the future?
12. Should authStore use authApi wrappers consistently instead of mixing authApi and direct apiClient calls?

---

## 13. Next Investigation

Open and review these files next:

```txt
src/features/auth/components/SubEmployeeManager.jsx
src/features/auth/pages/LoginPage.jsx
src/features/online/order/components/LoginForm.jsx
src/features/online/order/pages/CheckoutPage.jsx
src/features/pos/components/sidebar/SidebarLoader.jsx
```

Search next:

```txt
useRootStore
from '@/stores/branchStore'
from './authStore'
from './branchStore'
allBranches
useEmployeeStore((state) => state.employee)
useEmployeeStore.getState
setSession
clearSession
setEmployee
logoutAllDevicesAction
clearStorage
```

After that, update this map with verified READ / WRITE / MUTATE classifications.

---

## 14. Working Conclusion

The frontend Auth and Branch runtime surface is broader than LoginPage and HeaderPos.

AuthStore affects POS, online checkout, product/master-data, employee/settings, and print surfaces.

BranchStore affects POS shell, online branch selection, product/supplier pages, and report/print pages.

apiClient is a system-wide transport dependency and owns refresh queue/retry behavior.

ProtectedRoute exists but appears not mounted in the reviewed active POS route files.

employeeStore documents itself as HR/Employee Management only and should not be treated as active session source of truth.

branchHelpers appears online/geo branch selection oriented and may have stale import/field assumptions.

Permission helpers exist but appear dormant and currently derive identity from employeeStore/customerStore instead of authStore.

Logout behavior is split across multiple surfaces and must be standardized before Auth cleanup.

AuthStore persists only rememberMe and lastLoginIdentifier, so reload recovery depends on refresh cookie and `/auth/refresh`.

BranchStore currently mixes POS branch detail storage with online branch auto-selection.

Therefore, the current Login/Auth stabilization must continue as read-only architecture mapping before any refactor.
