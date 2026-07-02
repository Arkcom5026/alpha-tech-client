# State Management Map

Status: DRAFT / CERTIFICATION IN PROGRESS
Scope: Frontend Zustand stores, persistence, ownership, legacy/dormant surfaces
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Maps:
- `docs/map/Data_Ownership_Map.md`
- `docs/map/Dependency_Map.md`
- `docs/frontend/API_Surface_Map.md`
- `docs/frontend/Legacy_Surface_Map.md`

---

## 1. Purpose

This map classifies frontend state management before Auth/Login/Branch refactor.

เป้าหมายคือแยกให้ชัดว่า Store ใดเป็น Source of Truth, Store ใดเป็น Consumer, Store ใดเป็น Legacy หรือ Dormant ก่อนเริ่ม Refactor

---

## 2. Classification Model

```txt
OWNER STORE      — owns runtime truth and mutation rules
CONSUMER STORE   — consumes another owner but owns local feature state
DERIVED STORE    — derives state from API or another store
LEGACY STORE     — compatibility or older architecture, not source of truth
DORMANT SURFACE  — exists but intentionally not active for current agenda
```

---

## 3. Certified Owner Stores

### authStore

Path:

```txt
src/features/auth/store/authStore.js
```

Classification:

```txt
OWNER STORE / AUTH RUNTIME
```

Owns:

```txt
token
accessToken
session
rememberMe
lastLoginIdentifier
authChecked
isBootstrappingAuth
role
profileType
employee
customer
isSuperAdmin
loginAction
verifySessionAction
bootstrapAuthAction
logout/logoutAction/logoutAllDevicesAction
```

Persistence:

```txt
rememberMe
lastLoginIdentifier
```

Does not persist:

```txt
token
session
employee
customer
role
profileType
```

Risk:

```txt
CRITICAL
```

Reason:

AuthStore controls identity, session lifecycle, branch handoff, login, verify, bootstrap, and logout.

---

### branchStore

Path:

```txt
src/features/branch/store/branchStore.js
```

Classification:

```txt
OWNER STORE / BRANCH RUNTIME
```

Owns:

```txt
branches
currentBranch
selectedBranchId
version
loadBranchesAction
loadAndSetBranchById
setCurrentBranch
setSelectedBranchId
ensureSelectedBranchAction
clearBranch
clearStorage
```

Persistence:

```txt
currentBranch
selectedBranchId
version
```

Risk:

```txt
CRITICAL
```

Reason:

BranchStore currently mixes POS branch detail and online selected branch behavior.

Working rule:

```txt
POS branch identity should be anchored to authStore.employee.branchId.
Online branch selection should remain separate.
```

---

### cartStore

Path:

```txt
src/features/online/cart/store/cartStore.js
```

Classification:

```txt
OWNER STORE / ONLINE CART RUNTIME
CONSUMER OF AUTH TOKEN
```

Owns:

```txt
cartItems
selectedItems
branchPrices
```

Persistence:

```txt
cartItems
selectedItems
```

Consumes:

```txt
authStore.token via getState()
caller-provided branchId for branch price fetch
```

Risk:

```txt
HIGH
```

Reason:

If authStore token fields change, cart server sync may break.

---

### orderOnlineStore

Path:

```txt
src/features/online/order/store/orderOnlineStore.js
```

Classification:

```txt
OWNER STORE / ONLINE ORDER SUBMIT STATE
CONSUMER OF CALLER-PROVIDED CUSTOMER + BRANCH PAYLOAD
```

Owns:

```txt
isSubmitting
orders
selectedOrder
isLoading
error
```

Does not own:

```txt
customerId
branchId
token
currentBranch
selectedBranchId
```

Risk:

```txt
MEDIUM
```

Reason:

CheckoutPage owns branch/customer payload composition before submit.

---

## 4. Management / Legacy Stores

### employeeStore

Path:

```txt
src/features/employee/store/employeeStore.js
```

Classification:

```txt
LEGACY / HR MANAGEMENT STORE
NOT AUTH SESSION OWNER
```

Verified rule:

```txt
Auth/current login branch Source of Truth = authStore.employee.branchId
Branch detail / selected branch = branchStore
```

Risk:

```txt
MEDIUM
```

Reason:

Deprecated compatibility fields still exist and old components may read them.

---

### rootStore

Path:

```txt
src/store/rootStore.js
```

Classification:

```txt
LEGACY / AGGREGATE CANDIDATE
REQUIRES FINAL USAGE VERIFICATION
```

Risk:

```txt
MEDIUM
```

Reason:

It imports store paths that may not match current feature-store structure.

---

### branchHelpers

Path:

```txt
src/utils/branchHelpers.js
```

Classification:

```txt
LEGACY / ONLINE GEO BRANCH HELPER CANDIDATE
REQUIRES IMPORT + FIELD VERIFICATION
```

Risk:

```txt
MEDIUM
```

Reason:

Reads branch state imperatively and appears oriented around IP/geolocation branch selection.

---

## 5. Dormant / Out-of-Scope State Surfaces

```txt
ProtectedRoute
usePermission
RequirePermission
IfPermission
Sidebar capability metadata
RBAC capability filtering
```

Classification:

```txt
DORMANT FOR CURRENT AUTH STABILIZATION
```

Rule:

Do not activate route guard, RBAC, or menu capability filtering during current Login/Auth stabilization.

---

## 6. Cross-Store Runtime Flows

### Login branch handoff

```txt
authStore.loginAction / verifySessionAction
  ↓
branchStore.loadAndSetBranchById(employee.branchId)
```

Risk:

Branch detail can fail even when login succeeds.

---

### Cart token sync

```txt
cartStore action
  ↓
useAuthStore.getState().token
  ↓
server cart API if token exists
  ↓
local cart fallback if no token
```

Risk:

Token naming or persistence changes affect cart sync.

---

### Checkout submit

```txt
CheckoutPage
  ↓
reads authStore.customer/token
reads branchStore.selectedBranchId/currentBranch
  ↓
orderOnlineStore.submitOrderAction(payload)
```

Risk:

Checkout uses both currentBranch.id and selectedBranchId in different places.

---

### apiClient refresh mutation

```txt
apiClient receives 401
  ↓
/auth/refresh
  ↓
updates authStore token/session
  ↓
retries original request
```

Risk:

apiClient updates token/session but does not rebuild full identity/branch detail.

---

## 7. Persistence Matrix

```txt
authStore       → rememberMe, lastLoginIdentifier only
branchStore     → currentBranch, selectedBranchId, version
cartStore       → cartItems, selectedItems
employeeStore   → intentionally does not persist session/branch/token/role
orderOnlineStore → no critical persisted runtime identified in certification pass
```

---

## 8. Required Decisions

Before refactor:

```txt
1. Should POS branch identity always come from authStore.employee.branchId?
2. Should branchStore split POS branch detail from online selected branch?
3. Should cartStore read token or accessToken || token?
4. Should apiClient refresh success trigger identity verify automatically?
5. Should employeeStore compatibility fields be migrated or left dormant?
6. Should rootStore be removed, ignored, or documented as legacy?
```

---

## 9. State Management Risks

### RISK-STATE-001 — BranchStore has mixed ownership

Level:

```txt
CRITICAL
```

Impact:

POS and Online branch contexts may drift.

---

### RISK-STATE-002 — AuthStore token is not persisted

Level:

```txt
CRITICAL
```

Impact:

Reload recovery depends entirely on refresh cookie and verify flow.

---

### RISK-STATE-003 — CartStore reads token imperatively

Level:

```txt
HIGH
```

Impact:

Cart may not react predictably to token shape changes.

---

### RISK-STATE-004 — employeeStore compatibility fields may confuse ownership

Level:

```txt
MEDIUM
```

Impact:

Old components may treat employeeStore as active session owner.

---

## 10. Next Certification Step

Create:

```txt
docs/frontend/Component_Layer_Map.md
```

Reason:

Component responsibility boundaries must be mapped before implementation cleanup starts.
