# Dependency Map — Frontend Architecture Certification

Status: DRAFT / INITIAL SEARCH PASS
Scope: Frontend dependency discovery for Auth, Branch, API transport, guard, and permission surfaces
Repository: alpha-tech-client

---

## 1. Purpose

This map records which frontend files depend on major runtime layers before any Login/Auth refactor.

เป้าหมายคือระบุว่าไฟล์ใดพึ่งพา Runtime หลักก่อนแก้ Login/Auth เพื่อป้องกันผลกระทบที่มองไม่เห็น

---

## 2. Current Certification Context

Active agenda:

`STEP P1-FE-AUTH-CERT-01 — Frontend Authentication Architecture Certification`

Related command center:

`docs/blueprint/Active_Blueprint.md`

Related maps:

- `docs/map/Frontend_Auth_Runtime_Map`
- `docs/map/Frontend_Navigation_Route_Surface_Map.md`

Naming note:

Future map filenames should prefer short names such as `Auth_Runtime_Map.md`, `Navigation_Route_Map.md`, and `Dependency_Map.md` because frontend and backend are separated by repository.

---

## 3. Dependency Classes

### READ

A file reads runtime state but does not directly change it.

### WRITE / MUTATE

A file calls an action that changes runtime state.

### TRANSPORT

A file sends requests through the API layer.

### GUARD

A file decides whether a user can access or render a surface.

### PERMISSION

A file participates in permission or RBAC behavior.

---

## 4. AuthStore Dependency Surface

Search target:

`useAuthStore`

Initial search found many consumers, including:

- `src/App.jsx`
- `src/store/rootStore.js`
- `src/features/auth/pages/LoginPage.jsx`
- `src/utils/apiClient.js`
- `src/features/auth/components/ProtectedRoute.jsx`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/components/common/UnifiedMainNav.jsx`
- `src/components/LogoutButton.jsx`
- many feature pages and stores

### Interpretation

`authStore` is a high-impact runtime dependency.

Any structural change to `authStore` must be treated as high risk until all consumers are grouped by read/write behavior.

### Initial Impact Level

HIGH

Reason:

AuthStore touches app bootstrap, login, transport, POS header, protected route candidate, online checkout, admin/superadmin surfaces, product pages, employee pages, supplier store, and shared navigation.

---

## 5. AuthStore Action Dependencies

### bootstrapAuthAction

Search target:

`bootstrapAuthAction`

Confirmed usage:

- `src/App.jsx`
- `src/features/auth/store/authStore.js`

Interpretation:

Auth bootstrap currently starts at application root.

Risk:

If bootstrap timing changes, the whole app startup behavior may change.

---

### loginAction

Search target:

`loginAction`

Confirmed usage:

- `src/features/auth/pages/LoginPage.jsx`
- `src/features/online/order/components/LoginForm.jsx`
- `src/features/auth/store/authStore.js`

Interpretation:

Login exists in both partner/POS login and online order login surfaces.

Risk:

Changing loginAction payload or return shape may affect both POS login and online checkout login.

---

### verifySessionAction

Search target:

`verifySessionAction`

Confirmed usage:

- `src/features/auth/store/authStore.js`

Interpretation:

Session verification appears internally owned by authStore during this initial pass.

Risk:

Medium. It is central, but fewer direct external consumers were found.

---

### logoutAction

Search target:

`logoutAction`

Confirmed usage:

- `src/features/auth/store/authStore.js`
- `src/features/auth/pages/LoginPage.jsx`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/components/common/UnifiedMainNav.jsx`
- `src/features/superadmin/sidebar/SidebarSuperAdmin.jsx`

Interpretation:

Logout behavior is triggered from multiple navigation surfaces.

Risk:

High. Logout redirect and state clearing must be standardized before changes.

---

### isAuthenticatedSelector

Search target:

`isAuthenticatedSelector`

Confirmed usage:

- `src/features/auth/store/authStore.js`
- `src/features/auth/components/ProtectedRoute.jsx`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/features/product/components/ProductForm.jsx`
- `src/features/auth/pages/LoginPage.jsx`

Interpretation:

Authentication state affects route protection, header rendering, product form behavior, and login redirect behavior.

Risk:

High. Selector semantics must remain stable during certification.

---

## 6. Direct AuthStore getState Dependencies

Search target:

`useAuthStore getState`

Confirmed usage:

- `src/utils/apiClient.js`
- `src/features/auth/pages/LoginPage.jsx`
- `src/features/online/cart/store/cartStore.js`
- `src/features/supplier/store/supplierStore.js`
- `src/features/online/order/pages/CheckoutPage.jsx`
- `src/features/auth/store/authStore.js`
- `src/features/productTemplate/pages/ListProductTemplatePage.jsx`
- `src/features/product/pages/ListProductPage.jsx`

### Interpretation

Some consumers bypass React selectors and read auth state imperatively.

This is important because these consumers may not re-render when auth state changes.

### Risk

HIGH

Reason:

Imperative access can hide dependencies from normal component flow and can preserve stale assumptions.

---

## 7. BranchStore Dependency Surface

Search target:

`useBranchStore`

Initial search found many consumers, including:

- `src/store/rootStore.js`
- `src/utils/branchHelpers.js`
- `src/features/branch/store/branchStore.js`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/features/online/components/SidebarOnline.jsx`
- `src/features/online/order/pages/CheckoutPage.jsx`
- `src/features/online/order/components/LoginForm.jsx`
- `src/features/online/productOnline/store/productOnlineStore.jsx`
- `src/features/online/productOnline/pages/ProductOnlineListPage.jsx`
- `src/features/online/productOnline/pages/ProductOnlineDetailPage.jsx`
- `src/features/product/pages/ListProductPage.jsx`
- `src/features/product/pages/CreateProductPage.jsx`
- `src/features/product/pages/ViewProductPage.jsx`
- `src/features/product/pages/ReadyToSellListPage.jsx`
- `src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx`
- `src/features/supplier/pages/*`
- `src/features/inputTaxReport/pages/*`
- `src/features/salesTaxReport/pages/*`
- `src/features/settings/pages/ListBranchPage.jsx`

### Interpretation

BranchStore is used by both POS/internal surfaces and online/shop surfaces.

### Risk

HIGH

Reason:

Online branch selection and POS branch identity may be mixed if ownership rules are not clarified.

---

## 8. Direct BranchStore getState Dependencies

Search target:

`useBranchStore getState`

Confirmed usage:

- `src/utils/branchHelpers.js`
- `src/features/supplier/store/supplierStore.js`
- `src/features/online/components/SidebarOnline.jsx`
- `src/features/online/order/pages/CheckoutPage.jsx`
- `src/features/auth/store/authStore.js`
- `src/features/online/productOnline/store/productOnlineStore.jsx`
- `src/features/product/pages/ListProductPage.jsx`

### Interpretation

Branch runtime is also accessed imperatively.

### Risk

HIGH

Reason:

Imperative branch reads can make branch context drift harder to detect.

---

## 9. Branch Runtime Action Dependencies

### loadAndSetBranchById

Search target:

`loadAndSetBranchById`

Confirmed usage:

- `src/features/branch/store/branchStore.js`
- `src/features/auth/store/authStore.js`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/features/purchaseOrder/pages/PrintPurchaseOrderPage.jsx`

Interpretation:

Branch details can be loaded by auth runtime, POS header, and print surfaces.

Risk:

High. POS branch identity should not drift from the logged-in employee branch.

---

### clearBranch

Search target:

`clearBranch`

Confirmed usage:

- `src/features/branch/store/branchStore.js`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/components/common/UnifiedMainNav.jsx`

Interpretation:

Branch clearing can happen from more than one navigation surface.

Risk:

Medium to High. Logout sequence must be standardized.

---

## 10. API Transport Dependency Surface

Search target:

`apiClient`

Initial search found broad API dependency usage across:

- `src/utils/apiClient.js`
- `src/features/auth/api/authApi.js`
- `src/features/sales/api/saleApi.js`
- `src/features/stock/api/stockApi.js`
- `src/features/finance/api/financeApi.js`
- `src/features/payment/api/paymentApi.js`
- `src/features/branch/api/branchApi.jsx`
- `src/features/product/api/productApi.js`
- `src/features/quickReceive/api/quickReceiveApi.js`
- `src/features/purchaseOrder/api/purchaseOrderApi.js`
- `src/features/customer/api/customerApi.js`
- `src/features/customerReceipt/api/customerReceiptApi.js`
- `src/features/deliveryNote/api/deliveryNoteApi.js`
- `src/features/online/order/api/orderOnlineApi.js`
- `src/features/online/cart/api/cartApi.js`
- many other domain API files

### Interpretation

apiClient is a global transport dependency.

Any change to token injection, refresh handling, baseURL, or withCredentials affects most domain API calls.

### Risk

VERY HIGH

Reason:

apiClient is shared by operational modules across sales, stock, finance, purchasing, online, auth, and settings domains.

---

## 11. Guard / Route Protection Surface

### ProtectedRoute

Search target:

`ProtectedRoute`

Confirmed file:

- `src/features/auth/components/ProtectedRoute.jsx`

### AuthGate / RequireAuth / PrivateRoute / ProtectRoute

Search target:

`AuthGate RequireAuth PrivateRoute ProtectRoute`

Initial search did not find additional concrete guard files beyond existing documentation references and `ProtectedRoute`.

### Interpretation

A route protection component exists, but it has not yet been confirmed as mounted in the active route tree.

### Risk

HIGH until verified.

Reason:

If ProtectedRoute is unused, POS relies mostly on app bootstrap and apiClient recovery. If it is used somewhere, its bootstrap timing and redirect behavior may be a root cause of perceived session loss.

---

## 12. Permission / RBAC Dependency Surface

Search targets:

- `P1_CAP`
- `usePermission`
- `RequirePermission`
- `IfPermission`

Confirmed files:

- `src/features/auth/rbac/rbacClient.js`
- `src/features/auth/store/authStore.js`
- `src/features/pos/components/header/HeaderPos.jsx`
- `src/hooks/usePermission.js`
- `src/components/auth/RequirePermission.jsx`
- `src/components/auth/IfPermission.jsx`
- multiple sidebar config files containing `P1_CAP`

### Interpretation

Permission/RBAC helper code exists, but current agenda treats RBAC as out of scope.

### Risk

Medium if dormant.

Very High if activated during Login/Auth stabilization.

Reason:

Permission rollout would mix authorization changes with authentication/session stabilization.

---

## 13. Employee / Legacy Identity Surface

Search target:

`employeeStore`

Confirmed files include:

- `src/features/employee/store/employeeStore.js`
- `src/hooks/usePermission.js`
- `src/features/employee/pages/ViewEmployeePage.jsx`
- `src/features/employee/pages/ApproveEmployeePage.jsx`
- `src/features/employee/utils/employeeAccess.js`
- `src/features/brand/pages/ListBrandPage.jsx`
- `src/features/purchaseOrder/pages/PrintPurchaseOrderPage.jsx`

### Interpretation

There may be legacy or parallel employee identity/runtime code outside authStore.

### Risk

HIGH until reviewed.

Reason:

If employeeStore and authStore both represent employee/session concepts, they may create competing sources of truth.

---

## 14. Current High-Risk Dependency Clusters

### Cluster A — AuthStore Runtime

Includes:

- App bootstrap
- Login surfaces
- POS header
- ProtectedRoute candidate
- apiClient
- Logout navigation
- Online checkout
- Supplier and cart stores

Risk:

Changing authStore shape or selectors can break many unrelated surfaces.

---

### Cluster B — BranchStore Runtime

Includes:

- POS header
- Online branch selection
- Product pages
- Supplier pages
- Report print pages
- Purchase order print page
- Branch helpers

Risk:

POS branch identity and online branch selection must be separated by rule.

---

### Cluster C — apiClient Transport

Includes:

- Auth API
- Sales API
- Stock API
- Finance API
- Purchase API
- Online API
- Product API
- Upload / media / report APIs

Risk:

Any change to refresh, token attachment, baseURL, or credentials can affect the entire app.

---

### Cluster D — Guard / Permission Candidate Code

Includes:

- ProtectedRoute
- usePermission
- RequirePermission
- IfPermission
- rbacClient
- sidebar capability configs

Risk:

Must be reviewed, but should not be activated during current Login/Auth stability work.

---

## 15. Initial Conclusions

1. AuthStore is not isolated.

AuthStore is used by core app startup, navigation, login, transport, checkout, product, supplier, employee, and admin/superadmin surfaces.

2. BranchStore has mixed online and POS relevance.

This is acceptable only if ownership rules are explicit.

3. apiClient is a global dependency.

Transport refactor must be treated as very high risk.

4. ProtectedRoute exists.

The next step is to read it and confirm whether it is actually mounted in active routes.

5. RBAC/permission helpers exist.

They should remain out of scope during session stabilization.

6. employeeStore exists.

This must be reviewed before declaring authStore the only identity owner.

---

## 16. Next Investigation Checklist

Read next:

- `src/features/auth/components/ProtectedRoute.jsx`
- `src/hooks/usePermission.js`
- `src/components/auth/RequirePermission.jsx`
- `src/components/auth/IfPermission.jsx`
- `src/features/employee/store/employeeStore.js`
- `src/store/rootStore.js`
- `src/utils/branchHelpers.js`
- `src/components/LogoutButton.jsx`
- `src/components/common/UnifiedMainNav.jsx`

Confirm next:

- Is ProtectedRoute mounted in active router?
- Is employeeStore still used as runtime identity?
- Which files mutate branch selection?
- Which files call logoutAction or clearBranch?
- Which pages read selectedBranchId directly?
- Which pages read employee.branchId directly?
- Which API files bypass apiClient, if any?

---

## 17. Working Rule

No AuthStore, BranchStore, apiClient, or route guard refactor should begin until this Dependency Map has been expanded from search results into reviewed dependency groups.

ห้ามเริ่ม Refactor authStore, branchStore, apiClient หรือ route guard จนกว่า Dependency Map จะถูกขยายจากผลการค้นหาเป็นกลุ่ม Dependency ที่ผ่านการอ่านไฟล์จริงแล้ว
