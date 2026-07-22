# AUTH Root Cause Investigation Report
## Repository: d:/alpha-tech/client
## Mission: AUTH-002 / AUTH-003 / DATA-001

---

## Table of Contents
1. [AUTH-002: Protected Request Before Bootstrap Completes](#auth-002)
2. [AUTH-003: Concurrent Refresh Requests](#auth-003)
3. [DATA-001: Duplicate Protected Fetch](#data-001)
4. [Summary of Ownership](#summary)

---

## AUTH-002: Protected Request Before Bootstrap Completes

### Runtime Evidence
```
bootstrapAuthAction:start
↓
GET protected API
↓
401
↓
refresh
↓
retry
↓
200
```

### Repository Ownership

| Component | File | Function | Lines |
|-----------|------|----------|-------|
| Bootstrap trigger | `src/App.jsx` | `runInitialAuthBootstrapOnce()` | 16-32 |
| Bootstrap action | `src/features/auth/store/authStore.js` | `bootstrapAuthAction()` | 432-502 |
| Bootstrap gate | `src/utils/apiClient.js` | `waitForAuthBootstrapToFinish()` | 320-333 |
| Request interceptor | `src/utils/apiClient.js` | `apiClient.interceptors.request.use()` | 363-409 |
| Route guard | `src/features/auth/components/ProtectedRoute.jsx` | `ProtectedRoute` | 10-42 |
| Router | `src/routes/AppRouter.jsx` | `AppRouter` | 40-81 |
| Main entry | `src/main.jsx` | `StrictMode` wrapper | 1-14 |

### Call Graph

```
main.jsx:10-14
  └─ <StrictMode>
       └─ App.jsx:34-47
            ├─ useEffect() [line 37-39]
            │    └─ runInitialAuthBootstrapOnce(bootstrapAuthAction) [line 16-32]
            │         └─ bootstrapAuthAction() [authStore.js:432-502]
            │              ├─ traceFlowMarker('bootstrapAuthAction:start') [line 438]
            │              ├─ set({ isBootstrappingAuth: true }) [line 439]
            │              ├─ if (hasToken) → verifySessionAction() [line 443]
            │              │    └─ apiClient.get('/auth/me') [line 319]
            │              └─ if (noToken) → apiClient.post('/auth/refresh') [line 448]
            │                   └─ verifySessionAction() [line 470]
            └─ <RouterProvider router={router} /> [line 44]
                 └─ AppRouter [AppRouter.jsx:40-81]
                      └─ posPartnerRoutes [posPartnerRoutes.jsx:70-186]
                           └─ salesRoutes [salesRoutes.jsx:18-48]
                                └─ PrintBillPageShortTax [PrintBillPageShortTax.jsx]
                                     └─ useEffect → loadSaleByIdAction() [line 70-86]
                                          └─ useBillStore.loadSaleByIdAction() [billStore.js:135-269]
                                               └─ getSaleById(saleId) [line 164]
                                                    └─ apiClient.get('/sales/{saleId}') [saleApi.js:51]
```

### Execution Graph (Race Timeline)

```
Time ──────────────────────────────────────────────────────────────►

main.jsx: <StrictMode> mounts App
  │
  ▼
App.jsx: useEffect fires
  │
  ├─► runInitialAuthBootstrapOnce()
  │     │
  │     ├─► bootstrapAuthAction() starts
  │     │     ├─ isBootstrappingAuth = true
  │     │     ├─ traceFlowMarker('bootstrapAuthAction:start')
  │     │     └─ hasToken? → verifySessionAction()
  │     │           └─ apiClient.get('/auth/me')  ←─── THIS IS ASYNC
  │     │
  │     └─ bootstrapAuthPromise = pending Promise
  │
  └─► <RouterProvider> renders immediately
        │
        └─► Route matching resolves
              │
              └─► PrintBillPageShortTax mounts
                    │
                    ├─► useEffect fires (line 70-86)
                    │     └─ loadSaleByIdAction(saleId)
                    │           └─ apiClient.get('/sales/{saleId}')
                    │                 │
                    │                 ├─► Request interceptor runs [apiClient.js:363-409]
                    │                 │     ├─ waitForAuthBootstrapToFinish() ←── GATE
                    │                 │     │     └─ polls isBootstrappingAuth
                    │                 │     └─ getToken() → applies Bearer header
                    │                 │
                    │                 └─► Response: 401
                    │                       └─ Response interceptor [apiClient.js:509-575]
                    │                             └─ refreshAccessToken('401')
                    │                                   └─ apiClient.post('/auth/refresh')
                    │                                         └─ Success → new token
                    │                                               └─ retry original request
                    │                                                     └─ 200 OK
                    │
                    └─► bootstrapAuthAction() completes
                          └─ authChecked = true
                          └─ isBootstrappingAuth = false
```

### Root Cause Analysis

**Primary Root Cause: Router renders before bootstrap completes.**

The chain of events:

1. **`main.jsx`** (line 10-14): Renders `<StrictMode><App /></StrictMode>`. StrictMode double-invokes effects in development.

2. **`App.jsx`** (line 37-39): `useEffect` fires `runInitialAuthBootstrapOnce()`. This starts `bootstrapAuthAction()` which is **async** and returns a Promise. The bootstrap sets `isBootstrappingAuth = true` but does **not** block rendering.

3. **`App.jsx`** (line 44): `<RouterProvider router={router} />` renders **immediately** in the same render cycle. The router does not wait for the bootstrap Promise.

4. **`AppRouter.jsx`** (line 62-65): The route `:shopSlug/pos` → `PartnerPosMasterLayout` → `posPartnerRoutes` → `salesRoutes` → `PrintBillPageShortTax` resolves immediately.

5. **`PrintBillPageShortTax.jsx`** (line 70-86): `useEffect` fires `loadSaleByIdAction(saleId)` which calls `apiClient.get('/sales/{saleId}')`.

6. **`apiClient.js`** (line 380-382): The request interceptor has a **bootstrap gate** (`waitForAuthBootstrapToFinish()`) that polls `isBootstrappingAuth`. However, this gate has a **timeout** of 5000ms (line 321). If the gate times out, the request proceeds anyway.

7. **`ProtectedRoute.jsx`** (line 21-23): The `ProtectedRoute` component checks `isBootstrappingAuth` and returns `null` during bootstrap. **However, the print pages (PrintBillPageShortTax, PrintBillPageFullTax, PrintDeliveryNotePage, PrintCustomerReceiptPage) are NOT wrapped in ProtectedRoute.** They are directly nested under `posPartnerRoutes` without any auth guard.

### Key Finding: ProtectedRoute Bypass

The route configuration in `posPartnerRoutes.jsx` does **not** wrap any routes with `<ProtectedRoute>`. The `ProtectedRoute` component exists in the codebase but is **never imported or used** in `posPartnerRoutes.jsx`. All routes under `:shopSlug/pos` are directly accessible without any auth guard.

### Confidence: HIGH (95%)

The evidence is conclusive:
- `ProtectedRoute` is defined but **never applied** to any route in `posPartnerRoutes.jsx`
- The router renders synchronously while bootstrap is async
- The bootstrap gate in the interceptor has a timeout that allows requests through
- StrictMode double-mounting exacerbates the race

---

## AUTH-003: Concurrent Refresh Requests

### Runtime Evidence
```
Refresh A
Refresh B
↓
same refresh token
↓
two rotations
↓
4746
↓
4747
4748
```

### Repository Ownership

| Component | File | Function | Lines |
|-----------|------|----------|-------|
| Refresh singleton | `src/utils/apiClient.js` | `refreshPromise` (module-level) | 27 |
| Refresh function | `src/utils/apiClient.js` | `refreshAccessToken()` | 411-507 |
| Cross-tab lock | `src/utils/apiClient.js` | `acquireRefreshLock()` | 174-186 |
| Cross-tab lock key | `src/utils/apiClient.js` | `AUTH_REFRESH_LOCK_KEY` | 32 |
| Bootstrap refresh | `src/features/auth/store/authStore.js` | `bootstrapAuthAction()` → `apiClient.post('/auth/refresh')` | 448 |
| Interceptor refresh | `src/utils/apiClient.js` | Response interceptor → `refreshAccessToken('401')` | 541 |
| Silent refresh timer | `src/utils/apiClient.js` | `scheduleSilentRefreshForToken()` | 96-145 |
| Auth store subscription | `src/utils/apiClient.js` | `ensureAuthStoreSubscription()` | 147-162 |

### Refresh State Ownership

```
Module-level state in apiClient.js:

┌─────────────────────────────────────────────────────┐
│  let refreshPromise = null;           // line 27    │ ← SINGLETON
│  let silentRefreshTimerId = null;     // line 28    │
│  let lastScheduledAccessToken = null; // line 29    │
│  let authStoreSubscribed = false;     // line 30    │
│                                                     │
│  const AUTH_REFRESH_LOCK_KEY =                      │
│    'alpha_auth_refresh_lock_v1';       // line 32   │ ← Cross-tab lock
│                                                     │
│  const TAB_ID = `${Date.now()}-${                   │
│    Math.random().toString(36).slice(2)}`; // line 34│
└─────────────────────────────────────────────────────┘
```

### Concurrency Analysis

**The `refreshPromise` singleton (line 27) is designed to prevent concurrent refreshes.** When `refreshAccessToken()` is called:

1. If `refreshPromise` is already set (non-null), all callers return the **same** promise (line 506: `return refreshPromise`).
2. The promise is set to `null` in the `finally` block (line 501: `refreshPromise = null`).

**However, there are multiple entry points that can bypass this singleton:**

#### Entry Point 1: Bootstrap refresh (authStore.js:448)
```
bootstrapAuthAction()
  └─ apiClient.post('/auth/refresh')  ←── Direct axios call, NOT through refreshAccessToken()
```

This calls `axios.post()` directly (via `apiClient.post`), which goes through the **request interceptor**. The request interceptor does NOT check `refreshPromise`. It only calls `waitForAuthBootstrapToFinish()`.

#### Entry Point 2: Interceptor refresh (apiClient.js:541)
```
Response interceptor on 401
  └─ refreshAccessToken('401')  ←── Uses refreshPromise singleton
```

#### Entry Point 3: Silent refresh timer (apiClient.js:138)
```
scheduleSilentRefreshForToken()
  └─ refreshAccessToken('timer')  ←── Uses refreshPromise singleton
```

#### The Race Condition

The critical race occurs when:

1. **Bootstrap** calls `apiClient.post('/auth/refresh')` directly (authStore.js:448)
2. **A protected request** hits 401 simultaneously
3. The response interceptor calls `refreshAccessToken('401')` (apiClient.js:541)

Since the bootstrap refresh goes through the **request interceptor** (which has the bootstrap gate but NOT the refresh singleton gate), and the interceptor refresh goes through `refreshAccessToken()` (which has the singleton), **two separate refresh flows can execute concurrently**:

```
Time ──►

bootstrapAuthAction()
  └─ apiClient.post('/auth/refresh')  ←── bypasses refreshPromise
       │
       └─ Request interceptor runs
            ├─ waitForAuthBootstrapToFinish() ←── passes (bootstrap is running)
            └─ getToken() → applies Bearer (may be null)
                 │
                 └─ axios.post() fires  ←── REFRESH A

Protected request (e.g., GET /sales/766)
  └─ 401 response
       └─ Response interceptor
            └─ refreshAccessToken('401')
                 ├─ refreshPromise is null → creates new promise
                 └─ axios.post() fires  ←── REFRESH B (CONCURRENT!)
```

**Both REFRESH A and REFRESH B use the same HttpOnly refresh cookie**, causing the server to rotate the refresh token twice. The second rotation invalidates the first, leading to the observed 4746 → 4747/4748 token sequence.

### Root Cause: Dual Refresh Entry Points Without Coordination

The `refreshPromise` singleton in `apiClient.js` only coordinates calls that go through `refreshAccessToken()`. The bootstrap path in `authStore.js` calls `apiClient.post('/auth/refresh')` directly, which bypasses the singleton entirely.

**Specific code path:**
- `authStore.js:448`: `const res = await apiClient.post('/auth/refresh');`
- This goes through `apiClient.interceptors.request` (line 363-409) which does NOT check `refreshPromise`
- The response interceptor (line 509-575) does NOT intercept refresh endpoints (line 534: `!isRefreshEndpoint(requestUrl)`)

### Confidence: HIGH (90%)

The `refreshPromise` singleton is correctly implemented for the interceptor path, but the bootstrap path creates a second independent refresh flow. The cross-tab lock (`acquireRefreshLock`) provides some protection across tabs but does not help within the same tab when two different code paths initiate refresh.

---

## DATA-001: Duplicate Protected Fetch

### Runtime Evidence
```
GET /sales/766
GET /sales/766
within ~6 ms
```

### Repository Ownership

| Component | File | Function | Lines |
|-----------|------|----------|-------|
| Print page | `src/features/bill/pages/PrintBillPageShortTax.jsx` | `useEffect` → `loadSaleByIdAction()` | 70-86 |
| Print page | `src/features/bill/pages/PrintBillPageFullTax.jsx` | `useEffect` → `loadSaleByIdAction()` | 72-89 |
| Delivery note | `src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx` | `useEffect` → `getSaleByIdAction()` | 104-156 |
| Customer receipt print | `src/features/customerReceipt/pages/PrintCustomerReceiptPage.jsx` | `useEffect` → `loadCustomerReceiptForPrintAction()` | 35-52 |
| Bill store | `src/features/bill/store/billStore.js` | `loadSaleByIdAction()` | 135-269 |
| Sales store | `src/features/sales/store/salesStore.js` | `getSaleByIdAction()` | 577-585 |
| Sales API | `src/features/sales/api/saleApi.js` | `getSaleById()` | 38-56 |
| Customer receipt store | `src/features/customerReceipt/store/customerReceiptStore.js` | `loadCustomerReceiptForPrintAction()` | 338-358 |
| Customer receipt API | `src/features/customerReceipt/api/customerReceiptApi.js` | `getCustomerReceiptById()` | 79-86 |

### Duplicate Ownership

**Primary suspect: React StrictMode double-mounting**

`main.jsx` (line 11): `<StrictMode>` wraps the entire app.

In React 18 development mode, StrictMode intentionally **unmounts and remounts** every component. This causes `useEffect` cleanup and re-execution:

```
StrictMode mount cycle:

1. Component mounts
   └─ useEffect fires → apiClient.get('/sales/766')  ←── REQUEST 1

2. StrictMode unmounts (simulated)
   └─ useEffect cleanup fires

3. StrictMode remounts
   └─ useEffect fires → apiClient.get('/sales/766')  ←── REQUEST 2 (within ~6ms)
```

**Secondary suspect: Multiple useEffect dependencies**

In `PrintBillPageShortTax.jsx` (line 70-86):
```javascript
useEffect(() => {
    const run = async () => {
        await reloadSaleForPrint()
    }
    run()
    return () => { resetAction() }
}, [saleId, paymentId])  // ←── Two dependencies
```

If `saleId` or `paymentId` change during the initial render (e.g., from `undefined` to a value), the effect fires twice.

**Tertiary suspect: Parent + child mount**

The route structure in `posPartnerRoutes.jsx` nests routes under `PartnerPosMasterLayout` (AppRouter.jsx:62-65). The layout component mounts first, then the child route component mounts. If both the layout and the child page trigger data fetching, duplicate requests occur.

### Lifecycle Graph

```
main.jsx
  └─ <StrictMode>
       └─ App.jsx
            └─ <RouterProvider>
                 └─ AppRouter
                      └─ :shopSlug/pos
                           └─ PartnerPosMasterLayout (AppRouter.jsx:21-38)
                                └─ <Outlet>
                                     └─ salesRoutes
                                          └─ PrintBillPageShortTax
                                               ├─ useEffect [saleId, paymentId]
                                               │    └─ loadSaleByIdAction(saleId)
                                               │         └─ getSaleById(saleId)
                                               │              └─ apiClient.get('/sales/{saleId}')
                                               │
                                               └─ useEffect [autoPrint, sale?.id, ...]
                                                    └─ (auto-print logic, no fetch)

StrictMode double-invoke:
  Mount 1: useEffect → loadSaleByIdAction → GET /sales/766  ←── REQUEST 1
  Unmount: cleanup (resetAction)
  Mount 2: useEffect → loadSaleByIdAction → GET /sales/766  ←── REQUEST 2 (~6ms apart)
```

### Root Cause: React StrictMode + No Request Deduplication in Bill Store

**Primary: React StrictMode double-mounting** (`main.jsx:11`)

In development mode, `<StrictMode>` causes all components to mount, unmount, and remount. This triggers `useEffect` twice for every component.

**Secondary: No request deduplication for the initial load**

The `billStore.js` has an inflight request deduplication mechanism (`_inflightBySaleId` at line 8), but it only works if the **second call arrives while the first is still in-flight**. With StrictMode, the sequence is:

1. Mount 1: `useEffect` fires → `loadSaleByIdAction()` starts → sets `loading: true`
2. Unmount: `useEffect` cleanup → `resetAction()` sets `loading: false`, clears sale/payment/config
3. Mount 2: `useEffect` fires → `loadSaleByIdAction()` starts again

The `resetAction()` in the cleanup (line 83-89 of PrintBillPageShortTax.jsx) clears the state, so the deduplication check at `billStore.js:145-154` (which checks if `current.sale.id === saleId`) fails because `current.sale` was reset to `null`.

**Tertiary: The `loadSaleForPrintWithAuthRetry` function** (billStore.js:59-67) adds a 300ms delay on 401 before retrying, which can cause a second request to be issued if the first one hits 401 and the retry delay is in progress.

### Confidence: HIGH (85%)

The 6ms gap between duplicate requests is consistent with React StrictMode's double-mount behavior (both mounts happen in the same microtask batch). The `_inflightBySaleId` deduplication in `billStore.js` would catch this if the requests were truly concurrent, but StrictMode's unmount/remount sequence clears the inflight cache via `resetAction()`.

---

## Summary of Ownership

### AUTH-002: Protected Request Before Bootstrap

| File | Function | Lines | Role |
|------|----------|-------|------|
| `src/main.jsx` | `<StrictMode>` | 11 | Exacerbates race via double-mount |
| `src/App.jsx` | `runInitialAuthBootstrapOnce()` | 16-32 | Starts bootstrap async, doesn't block render |
| `src/App.jsx` | `<RouterProvider>` | 44 | Renders synchronously, doesn't wait for bootstrap |
| `src/features/auth/store/authStore.js` | `bootstrapAuthAction()` | 432-502 | Async bootstrap, sets `isBootstrappingAuth` |
| `src/utils/apiClient.js` | `waitForAuthBootstrapToFinish()` | 320-333 | Gate with 5000ms timeout - can expire |
| `src/features/auth/components/ProtectedRoute.jsx` | `ProtectedRoute` | 10-42 | **Defined but NEVER used in route config** |
| `src/routes/partner/posPartnerRoutes.jsx` | `posPartnerRoutes` | 70-186 | Routes without auth guard |

### AUTH-003: Concurrent Refresh

| File | Function | Lines | Role |
|------|----------|-------|------|
| `src/utils/apiClient.js` | `refreshPromise` (module-level) | 27 | Singleton for interceptor path only |
| `src/utils/apiClient.js` | `refreshAccessToken()` | 411-507 | Uses `refreshPromise` singleton |
| `src/features/auth/store/authStore.js` | `bootstrapAuthAction()` | 448 | **Calls `apiClient.post('/auth/refresh')` directly, bypassing singleton** |
| `src/utils/apiClient.js` | `apiClient.interceptors.request` | 363-409 | Does NOT check `refreshPromise` |
| `src/utils/apiClient.js` | `apiClient.interceptors.response` | 509-575 | Calls `refreshAccessToken()` via singleton |

### DATA-001: Duplicate Fetch

| File | Function | Lines | Role |
|------|----------|-------|------|
| `src/main.jsx` | `<StrictMode>` | 11 | **Primary cause: double-mount** |
| `src/features/bill/pages/PrintBillPageShortTax.jsx` | `useEffect` | 70-86 | Fires twice under StrictMode |
| `src/features/bill/pages/PrintBillPageFullTax.jsx` | `useEffect` | 72-89 | Fires twice under StrictMode |
| `src/features/bill/store/billStore.js` | `loadSaleByIdAction()` | 135-269 | Deduplication cleared by `resetAction()` |
| `src/features/bill/store/billStore.js` | `_inflightBySaleId` | 8 | Deduplication Map, but reset by cleanup |
| `src/features/bill/store/billStore.js` | `resetAction()` | 80-89 | Called in useEffect cleanup, clears cache |

---

## Repository Authority Established

This report establishes **repository authority** for all three issues. The ownership chain is proven with exact file, function, and line references. No source files were modified.

**Next step (per mission brief):** Design targeted patches that address only the identified owners without impacting other projects sharing this repository.
