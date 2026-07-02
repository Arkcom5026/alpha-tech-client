# P1 Dependency Map — Frontend Architecture Certification

Status: DRAFT / PERMISSION HELPERS VERIFIED
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

Current role:

- Owns token/session state.
- Owns role/profile identity state.
- Owns employee/customer identity state.
- Exposes login, verify, bootstrap, logout, and reset actions.

Current risk:

- High impact. Many files import or read `useAuthStore`.
- Must not refactor until dependency categories are verified.

---

### 3.2 Branch Runtime Owner

Primary file:

```txt
src/features/branch/store/branchStore.js
```

Current role:

- Owns `currentBranch`.
- Owns `selectedBranchId`.
- Owns branch loading and branch selection behavior.

Current risk:

- High impact for POS because POS branch truth must not drift from logged-in employee branch.
- Online branch selection and POS branch identity must be separated clearly.

---

### 3.3 Transport Runtime Owner

Primary file:

```txt
src/utils/apiClient.js
```

Current role:

- Owns axios transport configuration.
- Reads auth token from authStore.
- Handles refresh/retry behavior on 401.

Current risk:

- Very high impact. Most API modules depend on `apiClient`.
- Changes here can affect every feature surface.

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
- StaffSettingsPage may read employee/branch identity and requires detailed review.

Risk:

- Login behavior affects both POS and online checkout login surfaces.
- Do not assume Login/Auth is POS-only.

---

### 4.3 POS Shell / Navigation Consumers

```txt
src/features/pos/components/header/HeaderPos.jsx
src/components/common/UnifiedMainNav.jsx
src/components/LogoutButton.jsx
src/features/superadmin/sidebar/SidebarSuperAdmin.jsx
```

Interpretation:

- HeaderPos displays session and triggers logout.
- UnifiedMainNav and LogoutButton may also trigger session changes.
- SidebarSuperAdmin uses logout/session state for the superadmin surface.

Risk:

- Logout behavior is not isolated to one component.
- A logout refactor must identify every caller, not only HeaderPos.

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

## 5. AuthStore Action Dependency Inventory

### 5.1 `bootstrapAuthAction`

Known consumers:

```txt
src/App.jsx
src/features/auth/store/authStore.js
```

Interpretation:

- App-level bootstrap appears centralized.

Risk:

- If bootstrap changes, initial page rendering and refresh recovery are affected.

---

### 5.2 `verifySessionAction`

Known consumers:

```txt
src/features/auth/store/authStore.js
```

Interpretation:

- Verify appears internally owned by authStore.

Risk:

- Good isolation, but must read implementation before changing refresh/verify flow.

---

### 5.3 `loginAction`

Known consumers:

```txt
src/features/auth/pages/LoginPage.jsx
src/features/online/order/components/LoginForm.jsx
src/features/auth/store/authStore.js
```

Interpretation:

- Login is shared by POS/partner login and online checkout login.

Risk:

- Do not change login return shape without checking both surfaces.

---

### 5.4 `logoutAction`

Known consumers:

```txt
src/features/auth/store/authStore.js
src/features/auth/pages/LoginPage.jsx
src/features/pos/components/header/HeaderPos.jsx
src/components/common/UnifiedMainNav.jsx
src/features/superadmin/sidebar/SidebarSuperAdmin.jsx
```

Interpretation:

- Logout has multiple UI triggers.

Risk:

- Logout clean-state work must be coordinated with branchStore clearing and redirects.

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
- branchHelpers reads `allBranches`, while the active branchStore map previously described `branches/currentBranch/selectedBranchId`; this may indicate stale code or naming drift.

---

### 6.2 POS Shell Consumers

```txt
src/features/pos/components/header/HeaderPos.jsx
src/components/common/UnifiedMainNav.jsx
```

Interpretation:

- Header and navigation display branch context.
- Header may also trigger branch loading or clearing.

Risk:

- POS branch display must follow logged-in employee branch, not arbitrary selected branch.

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

Risk:

- Online branch selection must not be treated the same as POS login branch identity.

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

Risk:

- This appears closer to POS identity branch truth than `selectedBranchId`.
- Must be treated carefully as candidate canonical POS branch source.

---

### 9.3 `employee.branchSlug`

Known consumers include:

```txt
src/features/auth/pages/StaffSettingsPage.jsx
```

Also documented in existing maps, but direct runtime usage appears limited from initial search.

Risk:

- URL `shopSlug` is widely used while `employee.branchSlug` direct search appears limited.
- This suggests slug canonicalization needs deeper route-level review.

---

### 9.4 `shopSlug`

Known broad consumers include:

```txt
src/routes/AppRouter.jsx
src/config/sidebarMenuConfig.js
src/config/sidebarStockItems.js
src/features/pos/components/sidebar/SidebarLoader.jsx
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

Reason:
These files sit at runtime entry, identity, branch context, transport, shell, or guard level.

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

Reason:
These files are runtime consumers or compatibility surfaces and may break if store shape or branch ownership changes.

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

### DISC-FE-BRANCH-001 — branchHelpers appears online/geo-selection oriented

Status: VERIFIED BY FILE READ

Evidence:

- `branchHelpers.js` fetches location via `ip-api.com` and estimates nearest branch.
- It reads branch state imperatively through `useBranchStore.getState()`.

Impact:

- This should not be mixed with POS identity branch ownership.
- Import path and field names need verification before treating it as active runtime.

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

## 12. Open Questions

1. Is `rootStore.js` still imported by active components?
2. Which pages read `employee.branchId` as operational branch truth?
3. Which pages read `selectedBranchId` as online branch selection only?
4. Which pages mutate branch state directly?
5. Does any feature call `logoutAction` outside the known navigation components?
6. Does any print page bypass normal bootstrap assumptions?
7. Should `shopSlug` be derived from logged-in branch or remain URL-driven?
8. Which old components still read deprecated employeeStore compatibility fields?

---

## 13. Next Investigation

Open and review these files next:

```txt
src/features/auth/pages/StaffSettingsPage.jsx
src/components/LogoutButton.jsx
src/components/common/UnifiedMainNav.jsx
src/features/superadmin/sidebar/SidebarSuperAdmin.jsx
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
```

After that, update this map with verified READ / WRITE / MUTATE classifications.

---

## 14. Working Conclusion

The frontend Auth and Branch runtime surface is broader than LoginPage and HeaderPos.

AuthStore affects POS, online checkout, product/master-data, employee/settings, and print surfaces.

BranchStore affects POS shell, online branch selection, product/supplier pages, and report/print pages.

apiClient is a system-wide transport dependency.

ProtectedRoute exists but appears not mounted in the reviewed active POS route files.

employeeStore documents itself as HR/Employee Management only and should not be treated as active session source of truth.

branchHelpers appears online/geo branch selection oriented and may have stale import/field assumptions.

Permission helpers exist but appear dormant and currently derive identity from employeeStore/customerStore instead of authStore.

Therefore, the current Login/Auth stabilization must continue as read-only architecture mapping before any refactor.
