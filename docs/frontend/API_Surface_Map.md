# API Surface Map

Status: DRAFT / CERTIFICATION IN PROGRESS
Scope: Frontend API surface classification for Auth, Branch, Cart, Online Order, and apiClient consumers
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Maps:
- `docs/map/Dependency_Map.md`
- `docs/map/Runtime_Flow_Map.md`
- `docs/map/Data_Ownership_Map.md`
- `docs/frontend/Legacy_Surface_Map.md`

---

## 1. Purpose

This map records frontend API surfaces and classifies their dependency on token, branch, customer, refresh, and runtime ownership.

เป้าหมายคือระบุ API ฝั่ง Frontend ว่า API ไหนต้องพึ่ง Token, Branch, Customer, Refresh หรือ Runtime Owner ใด ก่อนยกระดับ Auth/Login/Branch

This is not a Backend contract approval yet.

---

## 2. Transport Owner

Primary transport file:

```txt
src/utils/apiClient.js
```

Verified behavior:

- Resolves baseURL dynamically.
- Sends `withCredentials=true`.
- Reads bearer token from authStore through `useAuthStore.getState()`.
- Attaches Authorization header to non-auth-bypass requests.
- Owns 401 refresh queue and original request retry.
- Uses direct axios call for `/auth/refresh` to avoid interceptor loops.
- Updates authStore token/session after refresh succeeds.

Classification:

```txt
Owner: apiClient
Runtime dependency: authStore token/session
Refresh dependency: yes
Impact: system-wide
Risk: CRITICAL
```

---

## 3. Auth API Surface

Primary file:

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

Classification:

```txt
Owner: authApi wrapper + authStore lifecycle
Requires token: mixed
Uses refresh retry: mostly bypassed for auth endpoints
Requires branch: login/verify require branchId for employee/admin after response
Requires customer: no
Risk: CRITICAL
```

Important note:

AuthStore uses both imported authApi functions and direct apiClient calls for some auth endpoints.

Risk:

Endpoint ownership is not fully centralized.

---

## 4. Branch API Surface

Primary file:

```txt
src/features/branch/api/branchApi.jsx
```

Verified endpoints:

```txt
GET    /branches
GET    /branches/:id
POST   /branches
PUT    /branches/:id
DELETE /branches/:id
POST   /branch-prices/clone
```

Classification:

```txt
Owner: branchApi + branchStore
Requires token: yes through apiClient unless backend allows public branch list
Uses refresh retry: yes
Requires branch input: getBranchById, updateBranch, deleteBranch, cloneBranchPrice
Requires customer: no
Risk: HIGH
```

Runtime note:

AuthStore calls branchStore after login/verify, and branchStore calls branchApi to load branch details.

Risk:

If branch API fails after successful auth, POS may have identity but incomplete branch detail.

---

## 5. Cart API Surface

Primary file:

```txt
src/features/online/cart/api/cartApi.js
```

Verified endpoints:

```txt
POST   /cart/merge
GET    /cart
DELETE /cart
DELETE /cart/items/:productId
PATCH  /cart/item/:productId
POST   /cart/delete-many
POST   /cart/items
GET    /cart/branch-prices/:branchId
```

Classification:

```txt
Owner: cartApi + cartStore
Requires token: yes for server cart actions
Uses refresh retry: yes
Requires branch: branch price endpoint requires branchId
Requires customer: implicitly via authenticated session for cart
Risk: HIGH
```

Runtime note:

cartStore reads `authStore.token` via `getState()` to decide whether to sync with server or operate locally.

Risk:

If authStore token naming or availability changes, cart sync can silently stop.

---

## 6. Online Order API Surface

Primary file:

```txt
src/features/online/order/api/orderOnlineApi.js
```

Verified endpoints:

```txt
POST   /order-online
GET    /order-online
GET    /order-online/:id
PATCH  /order-online/:id
DELETE /order-online/:id
```

Classification:

```txt
Owner: orderOnlineApi + orderOnlineStore
Requires token: yes through apiClient for protected order operations
Uses refresh retry: yes
Requires branch: createOrder payload receives branchId from caller
Requires customer: createOrder payload receives customerId from caller
Risk: HIGH
```

Runtime note:

orderOnlineStore does not own customerId or branchId. CheckoutPage composes and passes payload.

Risk:

API layer trusts caller-provided customer/branch payload.

---

## 7. apiClient Consumer Inventory

Repository search found many direct apiClient consumers, including:

```txt
src/features/auth/api/authApi.js
src/features/branch/api/branchApi.jsx
src/features/sales/api/saleApi.js
src/features/stock/api/stockApi.js
src/features/category/api/categoryApi.js
src/features/unit/api/unitApi.js
src/features/supplier/api/supplierApi.js
src/features/productType/api/productTypeApi.js
src/features/productProfile/api/productProfileApi.js
src/features/purchaseOrder/store/purchaseOrderStore.js
src/features/salesReport/api/salesReportApi.js
src/features/branchPrice/api/branchPriceApi.js
src/features/employee/api/employeeApi.js
src/features/customer/api/customerApi.js
src/features/online/productOnline/api/productOnlineApi.jsx
src/features/online/cart/api/cartApi.js
src/features/online/order/api/orderOnlineApi.js
src/features/payment/api/paymentApi.js
src/features/paymentOnline/api/paymentOnlineApi.js
src/features/stockItem/api/stockItemApi.js
src/features/quickReceive/api/quickReceiveApi.js
src/features/deliveryNote/api/deliveryNoteApi.js
src/features/barcode/api/barcodeApi.js
```

Interpretation:

apiClient is a global runtime dependency, not a local utility.

Risk:

Any apiClient interceptor/baseURL/refresh change can affect the whole frontend.

---

## 8. API Classification Model

Each API surface should eventually be classified by:

```txt
Domain
Owner Store
Endpoint
Method
Requires Token
Requires Branch
Requires Customer
Requires Employee
Uses Refresh Retry
Auth Bypass
Branch Source
Payload Owner
Risk
```

Current pass is high-level and should be expanded module by module.

---

## 9. Known API Runtime Risks

### RISK-API-001 — Auth endpoint ownership is split

AuthStore calls some auth endpoints directly through apiClient while authApi also wraps them.

Impact:

Refactor may miss direct calls unless both authStore and authApi are reviewed.

---

### RISK-API-002 — Branch detail depends on branch API after login

Login/verify can succeed, but branch detail loading may fail.

Impact:

POS may have session identity but incomplete branch display/context.

---

### RISK-API-003 — Cart sync depends on authStore token naming

cartStore checks `authStore.token` directly.

Impact:

If token field changes to accessToken-only, cart may stop server sync.

---

### RISK-API-004 — Online order payload depends on caller-owned branch/customer

orderOnlineStore submits caller-provided payload.

Impact:

Checkout branch/customer truth must be fixed upstream.

---

### RISK-API-005 — apiClient is system-wide

Many modules import apiClient.

Impact:

Transport changes require broad regression testing.

---

## 10. Required Regression Coverage For API Refactor

Before changing apiClient/authStore API behavior, test:

```txt
POS login
POS reload
POS module API request
Branch detail load after login
Cart add without login
Cart add with login
Cart merge after online login
Checkout branch price fetch
Checkout submit order
Logout
Refresh after reload
401 retry behavior
Auth endpoint bypass behavior
```

---

## 11. Open Questions

1. Should authStore use authApi wrappers consistently instead of direct apiClient calls?
2. Should cartStore read `accessToken || token` instead of only `token`?
3. Should branch list be public for online shop, or require auth?
4. Should online product APIs be separated from protected POS APIs?
5. Should orderOnlineStore validate customerId/branchId before calling createOrder?
6. Should apiClient refresh failure reset auth state or leave caller to decide?
7. Should apiClient expose explicit auth-bypass rules in documentation or config?

---

## 12. Next Certification Step

Create:

```txt
docs/frontend/State_Management_Map.md
```

Reason:

State management is the next layer after API surface. It will classify Zustand stores and persistence behavior.
