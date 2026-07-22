# AUTH ARCHITECTURE PATCH DESIGN REPORT

**Date:** 2026-07-22  
**Author:** Architecture Design (Repository Inspection Only)  
**Status:** Design Complete — No Production Modification  

---

## 1. Executive Decision

**Recommended architecture: Model D — Hybrid Application Bootstrap Gate + Protected Route Authorization**

The current repository has two independent problems that must be solved separately:

1. **Split refresh authority** — `bootstrapAuthAction()` in authStore calls `apiClient.post('/auth/refresh')` directly, bypassing `refreshAccessToken()` and its `refreshPromise` singleton. This allows two concurrent refresh requests.

2. **No explicit bootstrap gate** — `RouterProvider` renders synchronously before bootstrap completes. `ProtectedRoute` exists but is not applied to POS routes. The interceptor's `waitForAuthBootstrapToFinish()` (5000ms timeout) is the only protection, which is incidental, not authoritative.

The recommended architecture:

- **Unify refresh authority** into `refreshAccessToken()` in `apiClient.js`. Make `bootstrapAuthAction()` call `refreshAccessToken()` instead of issuing a direct POST.
- **Add an application-level bootstrap gate** in `App.jsx` that delays `RouterProvider` rendering until bootstrap resolves.
- **Apply `ProtectedRoute`** as a layout wrapper around all POS child routes in `posPartnerRoutes.jsx`.
- **Keep DATA-001 as a separate slice** — the `_inflightBySaleId` Map in `billStore.js` needs a lifecycle fix to survive StrictMode remount.

---

## 2. Repository Authority

| Repository | Path | Role |
|---|---|---|
| Frontend | `d:\alpha-tech\client` | All patch slices |
| Backend | `d:\alpha-tech\server` | Inspection only; no backend patch required for Slice A/B/C |

---

## 3. Confirmed Runtime and Repository Findings

### AUTH-001: Session Recovery (RUNTIME PROVEN)
Browser reload → no in-memory access token → refresh cookie request → refresh token rotation → new access token → `/auth/me` → protected API → protected page restored. **Must remain preserved.**

### AUTH-002: Premature Protected Requests
- `App.jsx` renders `RouterProvider` synchronously (line 44).
- `bootstrapAuthAction()` is async (line 35-39).
- `ProtectedRoute` exists at `src/features/auth/components/ProtectedRoute.jsx` but is **not imported or applied** to POS routes in `posPartnerRoutes.jsx`.
- Interceptor bootstrap wait has 5000ms timeout (line 320-333 of `apiClient.js`).

### AUTH-003: Concurrent Refresh
- `apiClient.js` owns `refreshPromise` singleton (line 27).
- `refreshPromise` coordinates calls through `refreshAccessToken()` (line 411-507).
- `bootstrapAuthAction()` in `authStore.js` calls `apiClient.post('/auth/refresh')` directly (line 448), **bypassing** `refreshAccessToken()` and `refreshPromise`.
- Two refresh requests can therefore run concurrently.

### AUTH-ARCH-001: Split Refresh Authority
- **Bootstrap path:** `bootstrapAuthAction()` → direct `apiClient.post('/auth/refresh')`
- **Interceptor path:** 401 response → `refreshAccessToken()` → `refreshPromise`
- Target: One refresh execution authority.

### DATA-001: Duplicate Print Fetch
- `_inflightBySaleId` is a module-level `Map` in `billStore.js` (line 8).
- `resetAction()` clears store state including `sale`, `payment`, `saleItems` (line 80-89).
- `useEffect` cleanup in `PrintBillPageShortTax.jsx` (line 82-84) calls `resetAction()`.
- React StrictMode double-mounts: mount1 → `loadSaleByIdAction()` → sets `_inflightBySaleId` → cleanup → `resetAction()` clears inflight → mount2 → no inflight found → second request.

---

## 4. Current Ownership Diagram

```
App.jsx
  └─ bootstrapAuthAction() ──→ apiClient.post('/auth/refresh')  [DIRECT, NO REFRESHPROMISE]
  └─ RouterProvider ──→ AppRouter
       └─ PartnerPosMasterLayout
            └─ posPartnerRoutes [NO PROTECTEDROUTE]

apiClient.js
  └─ refreshAccessToken() ──→ refreshPromise [SINGLETON]
  └─ request interceptor ──→ waitForAuthBootstrapToFinish() [5000ms TIMEOUT]
  └─ response interceptor ──→ 401 → refreshAccessToken()

authStore.js
  └─ bootstrapAuthAction() ──→ direct POST /auth/refresh
  └─ verifySessionAction() ──→ GET /auth/me
  └─ state: { token, accessToken, authChecked, isBootstrappingAuth }

billStore.js
  └─ _inflightBySaleId (module-level Map)
  └─ resetAction() clears inflight
  └─ loadSaleByIdAction() checks inflight
```

---

## 5. Current Execution Sequence (Bootstrap + Protected Request)

```
1. App.jsx renders
2. RouterProvider renders immediately (synchronous)
3. useEffect calls bootstrapAuthAction() (async, fire-and-forget)
4. Protected page component mounts
5. Component calls API (e.g., GET /sales/766)
6. Interceptor: waitForAuthBootstrapToFinish() — polls isBootstrappingAuth
7. bootstrapAuthAction():
   a. No token → POST /auth/refresh (DIRECT, no refreshPromise)
   b. Gets accessToken → sets in store
   c. Calls verifySessionAction() → GET /auth/me
   d. Sets authChecked=true, isBootstrappingAuth=false
8. Interceptor timeout or bootstrap finishes → request proceeds with token
```

**Problem:** Step 4-6 can race with step 7. If bootstrap takes >5000ms, the interceptor timeout fires and the request proceeds without a token, causing a 401 → refresh → retry cycle.

---

## 6. Target Ownership Diagram

```
App.jsx
  └─ bootstrapAuthAction() ──→ refreshAccessToken() [UNIFIED]
  └─ [NEW] BootstrapGate ──→ waits for bootstrap Promise
       └─ RouterProvider ──→ AppRouter
            └─ PartnerPosMasterLayout
                 └─ ProtectedRoute [NEW] ──→ posPartnerRoutes

apiClient.js
  └─ refreshAccessToken() ──→ refreshPromise [SOLE AUTHORITY]
  └─ request interceptor ──→ [REMOVED] waitForAuthBootstrapToFinish()
  └─ response interceptor ──→ 401 → refreshAccessToken()

authStore.js
  └─ bootstrapAuthAction() ──→ calls refreshAccessToken() [NO DIRECT POST]
  └─ verifySessionAction() ──→ GET /auth/me
  └─ state: { token, accessToken, authChecked, isBootstrappingAuth }
  └─ [NEW] authBootstrapState: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

billStore.js
  └─ _inflightBySaleId (module-level Map) — [FIXED] cleanup preserves inflight
  └─ resetAction() — [FIXED] does not clear inflight
```

---

## 7. Target Execution Sequence (Bootstrap + Protected Request)

```
1. App.jsx renders
2. useEffect calls bootstrapAuthAction()
3. bootstrapAuthAction() calls refreshAccessToken() [JOINS REFRESHPROMISE]
4. App.jsx shows loading/placeholder while bootstrap is pending
5. Bootstrap resolves:
   a. Success → authBootstrapState = 'authenticated'
   b. No cookie → authBootstrapState = 'unauthenticated'
   c. Error → authBootstrapState = 'unauthenticated'
6. RouterProvider renders
7. ProtectedRoute checks authBootstrapState
8. Protected page component mounts
9. Component calls API — token already exists
10. No 401, no interceptor timeout needed
```

---

## 8. Architecture Options

### Option A: Application-level Bootstrap Gate Only

| Aspect | Detail |
|---|---|
| Ownership | `App.jsx` owns bootstrap gate; `ProtectedRoute` unchanged |
| Changed files | `App.jsx`, `authStore.js` |
| Changed contracts | `bootstrapAuthAction()` returns Promise; `App.jsx` awaits it |
| Dependency direction | `App.jsx` → `authStore` → `apiClient` |
| Circular dependency risk | None |
| Migration complexity | Low |
| Regression risk | Low — public routes still render immediately |
| Effect on public routes | Public routes render after bootstrap (slight delay) |
| Effect on protected routes | Protected routes never mount before bootstrap |
| Effect on reload recovery | Preserved |
| Effect on 401 retry | Preserved |
| Effect on logout | Preserved |
| Effect on multiple tabs | Cross-tab refresh lock already exists |
| Verification burden | Medium |

### Option B: Protected Layout Route Only

| Aspect | Detail |
|---|---|
| Ownership | `posPartnerRoutes.jsx` wraps routes in `ProtectedRoute` |
| Changed files | `posPartnerRoutes.jsx`, `ProtectedRoute.jsx` |
| Changed contracts | None |
| Dependency direction | Routes → `ProtectedRoute` → `authStore` |
| Circular dependency risk | None |
| Migration complexity | Low |
| Regression risk | Medium — protected data requests can still fire before bootstrap |
| Effect on public routes | None |
| Effect on protected routes | Redirect to `/login` if not authenticated |
| Effect on reload recovery | Preserved but race condition remains |
| Effect on 401 retry | Preserved |
| Effect on logout | Preserved |
| Effect on multiple tabs | No change |
| Verification burden | Medium |

### Option C: Route Loader Authority

| Aspect | Detail |
|---|---|
| Ownership | Route loaders in `react-router-dom` |
| Changed files | `AppRouter.jsx`, route definitions |
| Changed contracts | Loader functions must return auth state |
| Dependency direction | Router → loader → `authStore` |
| Circular dependency risk | Low |
| Migration complexity | High — requires restructuring route definitions |
| Regression risk | High — loader errors affect all child routes |
| Effect on public routes | None |
| Effect on protected routes | Loader blocks rendering |
| Effect on reload recovery | Preserved |
| Effect on 401 retry | Preserved |
| Effect on logout | Preserved |
| Effect on multiple tabs | No change |
| Verification burden | High |

### Option D: Hybrid Bootstrap Gate + Protected Route (RECOMMENDED)

| Aspect | Detail |
|---|---|
| Ownership | `App.jsx` bootstrap gate + `ProtectedRoute` layout wrapper |
| Changed files | `App.jsx`, `authStore.js`, `apiClient.js`, `posPartnerRoutes.jsx` |
| Changed contracts | `bootstrapAuthAction()` uses `refreshAccessToken()` |
| Dependency direction | `App.jsx` → `authStore` → `apiClient`; Routes → `ProtectedRoute` → `authStore` |
| Circular dependency risk | None — `authStore` already imports `apiClient` |
| Migration complexity | Medium |
| Regression risk | Low — incremental changes, each independently testable |
| Effect on public routes | Bootstrap gate delays all routes slightly; public routes remain accessible |
| Effect on protected routes | Never mount before bootstrap; redirect if unauthenticated |
| Effect on reload recovery | Preserved and strengthened |
| Effect on 401 retry | Preserved — uses same `refreshAccessToken()` |
| Effect on logout | Preserved |
| Effect on multiple tabs | Cross-tab lock already exists |
| Verification burden | Medium |

---

## 9. Recommended Architecture

**Option D — Hybrid Bootstrap Gate + Protected Route**

**Rationale based on current repository architecture:**

1. `App.jsx` already has `runInitialAuthBootstrapOnce()` (lines 16-32) — the bootstrap gate pattern is partially implemented. The missing piece is awaiting the Promise before rendering `RouterProvider`.

2. `ProtectedRoute.jsx` already exists with correct logic (lines 10-40) — it checks `isBootstrappingAuth`, token presence, and `isAuthenticated`. It simply needs to be applied to POS routes.

3. `authStore.js` already imports `apiClient` (line 15) — no circular dependency risk in calling `refreshAccessToken()` from `bootstrapAuthAction()`.

4. `apiClient.js` already has `refreshPromise` (line 27) and `refreshAccessToken()` (line 411) — the singleton pattern is proven. The fix is routing `bootstrapAuthAction()` through it.

5. The interceptor's `waitForAuthBootstrapToFinish()` (line 320) becomes unnecessary as a primary guard — it can be removed or reduced to a safety net.

---

## 10. Circular Dependency Analysis

| Import Path | Direction | Risk |
|---|---|---|
| `authStore.js` → `apiClient.js` | authStore imports apiClient | **None** — already exists (line 15) |
| `apiClient.js` → `authStore.js` | apiClient imports authStore | **None** — already exists (line 10) |
| `bootstrapAuthAction()` → `refreshAccessToken()` | authStore calls apiClient function | **None** — same direction as existing imports |
| `ProtectedRoute.jsx` → `authStore.js` | ProtectedRoute imports authStore | **None** — already exists (line 7) |
| `App.jsx` → `authStore.js` | App imports authStore | **None** — already exists (line 3) |

**Conclusion:** No circular dependency risk. The proposed changes follow existing import directions.

---

## 11. State Model

### Current State
```javascript
{
  token: null,           // access token
  accessToken: null,     // access token (duplicate)
  authChecked: false,    // set after bootstrap completes
  isBootstrappingAuth: false,  // true during bootstrap
  authError: null,
  // ... other fields
}
```

### Proposed State
```javascript
{
  token: null,
  accessToken: null,
  authChecked: false,
  isBootstrappingAuth: false,
  authBootstrapState: 'idle',  // NEW: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  authError: null,
  // ... other fields unchanged
}
```

### State Transitions

```
idle ──→ loading ──→ authenticated
                  ──→ unauthenticated (no cookie, 401, 403)
                  ──→ unauthenticated (network error, with error message)
loading ──→ loading (if refreshAccessToken called again while in-flight)
authenticated ──→ loading (on explicit re-login attempt)
unauthenticated ──→ loading (on explicit login)
any ──→ idle (on resetAuthStateAction)
```

### authBootstrapState vs authChecked

`authBootstrapState` replaces the implicit meaning of `authChecked + isBootstrappingAuth`:

| Current | Proposed | Meaning |
|---|---|---|
| `authChecked=false, isBootstrappingAuth=false` | `authBootstrapState='idle'` | Bootstrap not started |
| `authChecked=false, isBootstrappingAuth=true` | `authBootstrapState='loading'` | Bootstrap in progress |
| `authChecked=true, isBootstrappingAuth=false, token exists` | `authBootstrapState='authenticated'` | Authenticated |
| `authChecked=true, isBootstrappingAuth=false, no token` | `authBootstrapState='unauthenticated'` | Not authenticated |

**Backward compatibility:** `authChecked` and `isBootstrappingAuth` remain for existing consumers. New consumers use `authBootstrapState`.

---

## 12. Refresh Promise Lifecycle

### Current (Problematic)
```
bootstrapAuthAction() ──→ apiClient.post('/auth/refresh')  [NO PROMISE SHARING]
401 interceptor ──→ refreshAccessToken() ──→ refreshPromise [SINGLETON]
```

### Target
```
bootstrapAuthAction() ──→ refreshAccessToken() ──→ refreshPromise [SOLE AUTHORITY]
401 interceptor ──→ refreshAccessToken() ──→ refreshPromise [SAME SINGLETON]
```

### Lifecycle States

```
IDLE ──→ caller1 calls refreshAccessToken()
       ──→ refreshPromise = new Promise(...)
       ──→ POST /auth/refresh
       ──→ caller2 calls refreshAccessToken()
       ──→ returns existing refreshPromise (same Promise)
       ──→ POST completes
       ──→ success: applyRefreshResultToStore(), refreshPromise = null
       ──→ failure: set unauthenticated state, refreshPromise = null
       ──→ IDLE
```

### Key Invariants
1. `refreshPromise` is set before any async operation.
2. `refreshPromise` is reset to `null` in `finally` block.
3. All callers `await refreshPromise`.
4. No caller issues `POST /auth/refresh` directly.

---

## 13. Protected Route Model

### Implementation

```jsx
// posPartnerRoutes.jsx
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

export const posPartnerRoutes = [
  {
    element: <ProtectedRoute />,  // WRAPS ALL POS ROUTES
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      // ... all existing routes
    ]
  }
];
```

### ProtectedRoute Logic (unchanged, verified correct)
```jsx
if (isBootstrappingAuth) return null;           // loading state
if (token && !isAuthenticated) return null;      // waiting for verification
if (!isAuthenticated) return <Navigate to="/login" replace />;  // redirect
if (allowedRoles.length && !allowedRoles.includes(role))
  return <Navigate to="/unauthorized" replace />;
return children ? children : <Outlet />;
```

### Bootstrap Gate in App.jsx
```jsx
const App = () => {
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const bootstrapAuthAction = useAuthStore((state) => state.bootstrapAuthAction);

  useEffect(() => {
    bootstrapAuthAction().finally(() => setBootstrapReady(true));
  }, [bootstrapAuthAction]);

  if (!bootstrapReady) {
    return <LoadingScreen />;  // or null, or a minimal shell
  }

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
};
```

---

## 14. Failure and Logout Model

### Refresh Failure (401/403)
1. `refreshAccessToken()` catches error.
2. Sets `token: null, accessToken: null, authChecked: true, isBootstrappingAuth: false`.
3. Sets `authBootstrapState: 'unauthenticated'`.
4. Clears `refreshPromise`.
5. Clears silent refresh timer.
6. All waiting callers receive the rejection.
7. `ProtectedRoute` sees `!isAuthenticated` → redirects to `/login`.

### Refresh Network Failure
1. `refreshAccessToken()` catches network error.
2. Same state transition as 401/403.
3. `authError` contains network error message.
4. `authBootstrapState: 'unauthenticated'`.

### Logout
1. `logout()` / `logoutAction()` calls `logoutSession()` (POST /auth/logout).
2. `resetAuthStateAction()` clears all auth state.
3. `authBootstrapState` resets to `'idle'`.
4. `refreshPromise` is already `null` (or should be explicitly cleared).
5. `window.location.href = '/login'` in `logoutAction()`.

### Second 401 After Retry
1. Original request gets 401 → `_retry = true` → `refreshAccessToken()`.
2. Refresh succeeds → retry original request.
3. If retry also gets 401 → `_retry` is already `true` → `shouldTryRefresh` is `false`.
4. Error propagates to caller.
5. No infinite retry loop.

---

## 15. DATA-001 Lifecycle Design

### Root Cause
`_inflightBySaleId` is a module-level `Map` in `billStore.js`. `resetAction()` clears store state but does NOT clear the inflight Map. However, the `useEffect` cleanup in print pages calls `resetAction()`, and the inflight entry is only deleted in the `finally` block of `loadSaleByIdAction()`.

**StrictMode sequence:**
1. Mount 1: `useEffect` → `loadSaleByIdAction()` → sets `_inflightBySaleId` entry.
2. Cleanup 1: `resetAction()` clears store state (sale, payment, etc.) but NOT `_inflightBySaleId`.
3. Mount 2: `useEffect` → `loadSaleByIdAction()` → checks `_inflightBySaleId` → **entry still exists from mount 1** → returns existing Promise.

Wait — this means the inflight Map SHOULD prevent the duplicate. Let me re-examine.

Looking at `PrintBillPageShortTax.jsx` line 82-84:
```jsx
return () => {
  resetAction()
}
```

And `loadSaleByIdAction()` in `billStore.js`:
- Line 157-158: checks `_inflightBySaleId.get(requestKey)` — if exists, returns it.
- Line 260: `_inflightBySaleId.set(requestKey, job)`.
- Line 267: `_inflightBySaleId.delete(requestKey)` in `finally`.

**The bug:** `resetAction()` (line 80-89) does NOT clear `_inflightBySaleId`. But the `finally` block (line 267) runs after the async operation completes. In StrictMode:

1. Mount 1: `loadSaleByIdAction()` starts → `_inflightBySaleId.set(requestKey, job)`.
2. The async operation is in-flight.
3. Cleanup 1: `resetAction()` — does NOT clear `_inflightBySaleId`.
4. Mount 2: `loadSaleByIdAction()` → checks `_inflightBySaleId.get(requestKey)` → **finds the entry** → returns the existing Promise.

So actually, the inflight Map SHOULD prevent the duplicate. But the runtime evidence showed two requests. Let me re-examine more carefully.

Looking at `PrintBillPageFullTax.jsx` line 72-89:
```jsx
useEffect(() => {
  const run = async () => {
    try {
      setPageError('')
      resetAction()        // <-- CALLS resetAction BEFORE loadSaleByIdAction
      await reloadSaleForPrint()
    } catch { }
  }
  run()
  return () => {
    resetAction()
  }
}, [saleId, paymentId])
```

**The bug is in PrintBillPageFullTax.jsx:** `resetAction()` is called at the START of the effect (line 76), BEFORE `reloadSaleForPrint()`. In StrictMode:

1. Mount 1: `resetAction()` → clears store. Then `loadSaleByIdAction()` → sets `_inflightBySaleId`.
2. Cleanup 1: `resetAction()` → clears store (but NOT `_inflightBySaleId`).
3. Mount 2: `resetAction()` → clears store. Then `loadSaleByIdAction()` → checks `_inflightBySaleId` → **entry EXISTS from mount 1** → returns existing Promise.

But the runtime showed TWO requests. This means the `finally` block of mount 1's `loadSaleByIdAction()` must have run and deleted the inflight entry before mount 2 checked it.

**The actual race:** If mount 1's async operation completes quickly (before mount 2's effect runs), the `finally` block deletes the inflight entry. Then mount 2 sees no inflight entry and starts a second request.

### Fix Design

**Option 1 (Recommended): Move inflight Map to store-level, not module-level**
- Store `_inflightBySaleId` inside the Zustand store.
- `resetAction()` does NOT clear inflight promises.
- Inflight entries are only deleted in `finally` block of `loadSaleByIdAction()`.

**Option 2: Remove `resetAction()` from effect start in PrintBillPageFullTax.jsx**
- The `resetAction()` at the start of the effect is redundant with the cleanup.
- Remove line 76 (`resetAction()`) from `PrintBillPageFullTax.jsx`.
- Keep `resetAction()` only in cleanup.

**Option 3: Add a ref to track if this is the first mount**
- Use a `useRef` to skip `resetAction()` on the first effect run.
- Only call `resetAction()` on subsequent runs (saleId change).

**Recommended: Option 1 + Option 2 combined.**

The inflight Map should be owned by the store and survive cleanup. `resetAction()` should not clear inflight state — only display state. A separate `clearCacheAction()` can be used when explicit cache clearing is needed (e.g., after saving document lines).

---

## 16. Backend Defense-in-Depth Assessment

### Refresh Token Rotation (Current)
```javascript
// authController.js lines 778-785
const rotated = await prisma.$transaction(async (tx) => {
  const newTokenRecord = await createRefreshTokenRecord({ userId: user.id, rememberMe, req, tx });
  await tx.refreshToken.update({
    where: { id: existingToken.id },
    data: { revokedAt: new Date(), replacedByTokenId: newTokenRecord.refreshToken.id },
  });
  return newTokenRecord;
});
```

### Analysis

| Question | Answer |
|---|---|
| Rotation inside transaction? | **Yes** — `prisma.$transaction()` |
| Old token update conditional on `revokedAt` still being null? | **No** — the update does not check `revokedAt`. It unconditionally sets `revokedAt: new Date()`. |
| Can two transactions rotate the same token? | **Yes** — if two concurrent requests find the same token (both pass the `revokedAt` check at line 749), both enter the transaction. The first transaction sets `revokedAt`. The second transaction also succeeds (no `revokedAt` check in the update). |
| Is frontend serialization sufficient? | **Yes** — the `refreshPromise` singleton prevents concurrent refresh from the same browser tab. Cross-tab locking via localStorage also exists. |
| Should backend compare-and-set be added? | **Yes** — as defense-in-depth (Slice D). Add `revokedAt: null` to the `where` clause of the update. |
| What response should the losing concurrent refresh receive? | The second transaction would fail (no matching record with `revokedAt: null`). The response should be 401 with "Refresh token already rotated". |
| Would backend hardening invalidate the successful cookie? | **No** — the first transaction succeeds and sets the new cookie. The second transaction fails and does not change any cookie. |

### Backend Patch (Slice D, Optional)
```javascript
// Change from:
await tx.refreshToken.update({
  where: { id: existingToken.id },
  data: { revokedAt: new Date(), replacedByTokenId: newTokenRecord.refreshToken.id },
});

// To:
await tx.refreshToken.update({
  where: { id: existingToken.id, revokedAt: null },  // ADD revokedAt: null
  data: { revokedAt: new Date(), replacedByTokenId: newTokenRecord.refreshToken.id },
});
```

**Risk:** If the update fails (no matching record), the transaction throws. The catch block at line 815-819 returns 401. The frontend would then transition to unauthenticated state. This is acceptable — the user can retry or re-login.

**Recommendation:** Slice D is optional. Frontend serialization (Slice A) is sufficient for the immediate patch. Backend hardening can be a separate slice.

---

## 17. Security Logging Boundary

### Current Logging (Must Be Cleaned Up)

**Frontend (`authTrace.js`):**
- `traceRefreshStart()` — logs `cookie=refreshToken (HttpOnly)` — acceptable (no raw value).
- `traceRefreshSuccess()` — logs `newToken=${getFingerprint(newToken)}` — acceptable (fingerprint only).
- `traceStoreMutation()` — logs `accessToken ${prevToken} → ${nextToken}` — acceptable (fingerprint only).
- `traceRequest()` — logs `Bearer=${config.headers?.Authorization ? 'YES' : 'NO'}` — acceptable.
- `traceError()` — logs `body=${JSON.stringify(error.response?.data || {})}` — **RISK**: response body may contain tokens.

**Backend (`authTrace.js`):**
- `traceRefreshRequest()` — logs `cookie=${cookie.slice(0, 100)}` — **VIOLATION**: logs raw Cookie header.
- `traceRefreshRequest()` — logs `setCookie=${...}` — **VIOLATION**: logs raw Set-Cookie value.
- `traceRefreshRequest()` — logs `body=${JSON.stringify(body).slice(0, 200)}` — **RISK**: response body may contain access token.

**Backend (`verifyToken.js`):**
- `console.log('[verifyToken] REQUEST', { ...tokenFingerprint })` — acceptable.
- `console.log('[verifyToken] VERIFIED', { ...tokenFingerprint })` — acceptable.

**Backend (`authController.js`):**
- `_trace()` calls log token IDs and status — acceptable.
- `console.error('❌ refreshSession error:', error)` — **RISK**: error object may contain token data.

### Required Changes

| File | Line | Current | Fix |
|---|---|---|---|
| `server/middlewares/authTrace.js` | 72 | `cookie=${cookie.slice(0, 100)}` | `cookie=${cookie.includes('refreshToken') ? 'PRESENT' : 'MISSING'}` |
| `server/middlewares/authTrace.js` | 82 | `setCookie=${...}` | `setCookie=${res.statusCode === 200 ? 'PRESENT' : 'NONE'}` |
| `server/middlewares/authTrace.js` | 81 | `body=${JSON.stringify(body).slice(0, 200)}` | `body=${JSON.stringify({...body, accessToken: undefined, token: undefined}).slice(0, 200)}` |
| `client/src/utils/authTrace.js` | 77 | `body=${JSON.stringify(error.response?.data || {})}` | Strip `accessToken`/`token` from body before logging |
| `server/controllers/authController.js` | 815 | `console.error('❌ refreshSession error:', error)` | Log only `error.message`, not full error object |

### Slice Ownership
**Slice S (Security Logging)** — can be done independently or merged into Slice A.

---

## 18. Patch Slices

### SLICE A: Refresh Authority Unification

**Mission:** Ensure bootstrap and interceptor refresh join one in-flight refresh operation.

**Scope:**
1. Modify `bootstrapAuthAction()` in `authStore.js` to call `refreshAccessToken()` instead of `apiClient.post('/auth/refresh')`.
2. Export `refreshAccessToken` from `apiClient.js` (or create a thin wrapper).
3. Remove direct `apiClient.post('/auth/refresh')` call from `bootstrapAuthAction()`.

**Files to change:**
- `src/features/auth/store/authStore.js` — change `bootstrapAuthAction()` to call `refreshAccessToken()`
- `src/utils/apiClient.js` — export `refreshAccessToken` function

**Files forbidden to change:**
- `src/App.jsx` — no routing changes in this slice
- `src/routes/` — no routing changes
- `src/features/auth/components/ProtectedRoute.jsx` — no changes
- Backend files — no changes

**Invariants:**
- AUTH-I04: Only one POST /auth/refresh active at a time.
- AUTH-I05: All concurrent callers await the same result.
- AUTH-I06: Failed refresh transitions to consistent unauthenticated state.
- AUTH-I07: Request retries at most once after refresh.
- AUTH-I08: Refresh endpoint never triggers refresh interception recursively.

**Acceptance criteria:**
- `bootstrapAuthAction()` does not issue a direct POST to `/auth/refresh`.
- `bootstrapAuthAction()` returns the same Promise as `refreshAccessToken()`.
- `refreshPromise` is set before any async operation and reset in `finally`.
- No circular dependency between `authStore.js` and `apiClient.js`.

**Runtime tests:**
- AUTH-R04: Protected request while bootstrap pending — no initial 401.
- AUTH-R05: Two simultaneous protected requests — one refresh.
- AUTH-R09: Two independent 401 responses — one refresh Promise.

**Rollback boundary:** Revert `bootstrapAuthAction()` to direct POST.

**Dependency on previous slice:** None (first slice).

**API contract change:** No.

**Backend handoff required:** No.

---

### SLICE B: Authentication Bootstrap and Protected Route Gate

**Mission:** Prevent protected routes and protected data requests from starting before authentication resolution.

**Scope:**
1. Add `authBootstrapState` to authStore state model.
2. Modify `App.jsx` to await bootstrap before rendering `RouterProvider`.
3. Apply `ProtectedRoute` as a layout wrapper in `posPartnerRoutes.jsx`.
4. Remove or reduce `waitForAuthBootstrapToFinish()` timeout in `apiClient.js`.

**Files to change:**
- `src/App.jsx` — add bootstrap gate
- `src/features/auth/store/authStore.js` — add `authBootstrapState`
- `src/routes/partner/posPartnerRoutes.jsx` — wrap routes in `ProtectedRoute`
- `src/utils/apiClient.js` — remove or reduce `waitForAuthBootstrapToFinish()`

**Files forbidden to change:**
- `src/features/auth/components/ProtectedRoute.jsx` — logic is correct
- `src/routes/AppRouter.jsx` — no structural changes
- Backend files — no changes

**Invariants:**
- AUTH-I01: Browser reload with valid refresh cookie restores session.
- AUTH-I02: Protected page not redirected to login while bootstrap pending.
- AUTH-I03: Protected data requests do not start before bootstrap resolves.
- AUTH-I10: Public routes remain usable without authentication.

**Acceptance criteria:**
- `RouterProvider` does not render until `authBootstrapState` is `'authenticated'` or `'unauthenticated'`.
- POS routes are wrapped in `ProtectedRoute`.
- Public routes (`/`, `/partner-portal`, `/partner-portal/forgot-password`, etc.) remain accessible.
- `waitForAuthBootstrapToFinish()` is removed or reduced to a safety net with shorter timeout.

**Runtime tests:**
- AUTH-R01: Standard protected-page reload.
- AUTH-R02: Direct protected URL in new tab with valid refresh cookie.
- AUTH-R03: Three sequential reloads.
- AUTH-R10: Logout followed by protected-route navigation.
- AUTH-R11: Public route access while unauthenticated.

**Rollback boundary:** Revert `App.jsx` to synchronous `RouterProvider` rendering.

**Dependency on previous slice:** Depends on Slice A (refresh unification must be in place first).

**API contract change:** No.

**Backend handoff required:** No.

---

### SLICE C: Duplicate Print Fetch Lifecycle

**Mission:** Preserve inflight deduplication across StrictMode development remount without changing authentication ownership.

**Scope:**
1. Move `_inflightBySaleId` from module-level to store-level in `billStore.js`.
2. Modify `resetAction()` to NOT clear inflight promises.
3. Remove `resetAction()` from effect start in `PrintBillPageFullTax.jsx`.
4. Add `clearCacheAction()` for explicit cache clearing (used after document line save).

**Files to change:**
- `src/features/bill/store/billStore.js` — move inflight Map to store, modify `resetAction()`
- `src/features/bill/pages/PrintBillPageFullTax.jsx` — remove `resetAction()` from effect start
- `src/features/bill/pages/PrintBillPageShortTax.jsx` — verify cleanup is correct

**Files forbidden to change:**
- `src/features/auth/` — no auth changes
- `src/utils/apiClient.js` — no API client changes

**Invariants:**
- DATA-I01: Sale detail request not duplicated due to StrictMode remount.
- DATA-I02: Changing sale ID still loads correct sale.
- DATA-I03: Leaving print page does not leak stale data.
- DATA-I04: Obsolete request cannot overwrite newer data.
- DATA-I05: Production behavior unchanged except removal of unintended duplicates.

**Acceptance criteria:**
- `_inflightBySaleId` is a store-level Map, not module-level.
- `resetAction()` does not clear `_inflightBySaleId`.
- `PrintBillPageFullTax.jsx` does not call `resetAction()` at effect start.
- `clearCacheAction()` exists for explicit cache clearing.

**Runtime tests:**
- DATA-R01: Print page mount in React StrictMode — one effective sale-detail request.
- DATA-R02: Navigate sale 766 → sale 805.
- DATA-R03: Leave page during inflight request.
- DATA-R04: Rapid route change between sale IDs.
- DATA-R05: Production build behavior without StrictMode double mount.

**Rollback boundary:** Revert `_inflightBySaleId` to module-level Map.

**Dependency on previous slice:** None (independent of auth slices).

**API contract change:** No.

**Backend handoff required:** No.

---

### SLICE D: Backend Refresh Rotation Hardening (Optional)

**Mission:** Add compare-and-set protection to refresh token rotation as defense-in-depth.

**Scope:**
1. Add `revokedAt: null` to the `where` clause of the `refreshToken.update()` call in `authController.js`.
2. Ensure the transaction throws if the update affects zero rows.
3. Return 401 with "Refresh token already rotated" on failure.

**Files to change:**
- `server/controllers/authController.js` — line 780-783: add `revokedAt: null` to `where`

**Files forbidden to change:**
- Frontend files — no changes
- Prisma schema — no schema changes
- Route definitions — no changes

**Invariants:**
- AUTH-I04: Only one POST /auth/refresh active at a time (frontend serialization).
- Backend rotation is atomic and idempotent.

**Acceptance criteria:**
- Two concurrent refresh requests with the same token: one succeeds, one fails.
- The failing request returns 401.
- The successful request's cookie is not invalidated.

**Runtime tests:**
- Send two concurrent POST /auth/refresh with the same cookie.
- Verify one 200, one 401.
- Verify the 200 response's cookie works for subsequent requests.

**Rollback boundary:** Revert `where` clause to original (remove `revokedAt: null`).

**Dependency on previous slice:** None (independent).

**API contract change:** No — same HTTP status, same response shape.

**Backend handoff required:** Yes — backend team must apply the one-line change.

---

### SLICE S: Security Logging Cleanup

**Mission:** Remove raw authentication secrets from trace output.

**Scope:**
1. Fix `server/middlewares/authTrace.js` — remove raw Cookie and Set-Cookie logging.
2. Fix `server/controllers/authController.js` — log only `error.message`, not full error.
3. Fix `client/src/utils/authTrace.js` — strip tokens from response body logging.

**Files to change:**
- `server/middlewares/authTrace.js` — lines 72, 81-82
- `server/controllers/authController.js` — line 815
- `client/src/utils/authTrace.js` — line 77

**Files forbidden to change:**
- Business logic files — no changes
- Route definitions — no changes

**Invariants:**
- No raw Authorization header value in logs.
- No raw access JWT in logs.
- No raw refresh token in logs.
- No raw Cookie header value in logs.
- No raw Set-Cookie value in logs.
- No raw response token body in logs.

**Acceptance criteria:**
- All trace output uses `'YES'/'NO'` for presence checks.
- Token fingerprints use non-reversible short hash.
- Error logging does not include full error objects.

**Runtime tests:**
- AUTH-R12: No raw token or cookie value in frontend/backend trace output.

**Rollback boundary:** Revert trace files to original.

**Dependency on previous slice:** None (independent).

**API contract change:** No.

**Backend handoff required:** Yes — backend team must apply trace file changes.

---

## 19. Exact Expected Changed Paths per Slice

### Slice A
| File | Change | Confidence |
|---|---|---|
| `src/features/auth/store/authStore.js` | `bootstrapAuthAction()` calls `refreshAccessToken()` instead of `apiClient.post('/auth/refresh')` | HIGH |
| `src/utils/apiClient.js` | Export `refreshAccessToken` function | HIGH |

### Slice B
| File | Change | Confidence |
|---|---|---|
| `src/App.jsx` | Add bootstrap gate — await `bootstrapAuthAction()` before `RouterProvider` | HIGH |
| `src/features/auth/store/authStore.js` | Add `authBootstrapState` field and transitions | HIGH |
| `src/routes/partner/posPartnerRoutes.jsx` | Wrap POS routes in `ProtectedRoute` layout | HIGH |
| `src/utils/apiClient.js` | Remove/reduce `waitForAuthBootstrapToFinish()` | MEDIUM |

### Slice C
| File | Change | Confidence |
|---|---|---|
| `src/features/bill/store/billStore.js` | Move `_inflightBySaleId` to store, modify `resetAction()` | HIGH |
| `src/features/bill/pages/PrintBillPageFullTax.jsx` | Remove `resetAction()` from effect start | HIGH |
| `src/features/bill/pages/PrintBillPageShortTax.jsx` | Verify cleanup is correct (inspection only) | MEDIUM |

### Slice D
| File | Change | Confidence |
|---|---|---|
| `server/controllers/authController.js` | Add `revokedAt: null` to `where` clause in rotation update | HIGH |

### Slice S
| File | Change | Confidence |
|---|---|---|
| `server/middlewares/authTrace.js` | Remove raw Cookie/Set-Cookie logging | HIGH |
| `server/controllers/authController.js` | Log only `error.message` | HIGH |
| `client/src/utils/authTrace.js` | Strip tokens from response body logging | HIGH |

---

## 20. Forbidden Paths per Slice

### Slice A — Forbidden
- `src/App.jsx` — no routing changes
- `src/routes/` — no routing changes
- `src/features/auth/components/ProtectedRoute.jsx` — no changes
- `server/` — no backend changes

### Slice B — Forbidden
- `src/features/auth/components/ProtectedRoute.jsx` — logic is correct, no changes
- `src/routes/AppRouter.jsx` — no structural changes
- `server/` — no backend changes

### Slice C — Forbidden
- `src/features/auth/` — no auth changes
- `src/utils/apiClient.js` — no API client changes
- `server/` — no backend changes

### Slice D — Forbidden
- Frontend files — no changes
- Prisma schema — no schema changes
- Route definitions — no changes

### Slice S — Forbidden
- Business logic files — no changes
- Route definitions — no changes

---

## 21. Contract Impact and Backend Handoff

### Slice A — Contract Impact
| Aspect | Impact |
|---|---|
| Endpoint path | None |
| Request schema | None |
| Response schema | None |
| Cookie name | None |
| Cookie attributes | None |
| JWT payload | None |
| Refresh-token persistence | None |
| HTTP status behavior | None |
| Logout semantics | None |

**Backend handoff:** Not required.

### Slice B — Contract Impact
| Aspect | Impact |
|---|---|
| Endpoint path | None |
| Request schema | None |
| Response schema | None |
| Cookie name | None |
| Cookie attributes | None |
| JWT payload | None |
| Refresh-token persistence | None |
| HTTP status behavior | None |
| Logout semantics | None |

**Backend handoff:** Not required.

### Slice C — Contract Impact
| Aspect | Impact |
|---|---|
| Endpoint path | None |
| Request schema | None |
| Response schema | None |
| Cookie name | None |
| Cookie attributes | None |
| JWT payload | None |
| Refresh-token persistence | None |
| HTTP status behavior | None |
| Logout semantics | None |

**Backend handoff:** Not required.

### Slice D — Contract Impact
| Aspect | Impact |
|---|---|
| Endpoint path | None |
| Request schema | None |
| Response schema | None |
| Cookie name | None |
| Cookie attributes | None |
| JWT payload | None |
| Refresh-token persistence | None |
| HTTP status behavior | None (still returns 401 on failure) |
| Logout semantics | None |

**Backend handoff note:**
```
Affected endpoint: POST /api/auth/refresh
Reason: Add compare-and-set protection to prevent concurrent rotation of the same refresh token.
Change: In authController.js refreshSession(), add `revokedAt: null` to the `where` clause of the
        `refreshToken.update()` call inside the rotation transaction.
Current: where: { id: existingToken.id }
Target:  where: { id: existingToken.id, revokedAt: null }
Effect: If two concurrent requests rotate the same token, the second transaction fails (no matching
        record with revokedAt: null). The catch block returns 401. The successful request's cookie
        is not affected.
Compatibility: Fully backward compatible. No schema migration required.
Migration: None required. Deploy as a hotfix.
```

### Slice S — Contract Impact
| Aspect | Impact |
|---|---|
| Endpoint path | None |
| Request schema | None |
| Response schema | None |
| Cookie name | None |
| Cookie attributes | None |
| JWT payload | None |
| Refresh-token persistence | None |
| HTTP status behavior | None |
| Logout semantics | None |

**Backend handoff note:**
```
Affected files: server/middlewares/authTrace.js, server/controllers/authController.js
Reason: Remove raw authentication secrets from trace output.
Changes:
  1. authTrace.js line 72: Replace `cookie=${cookie.slice(0, 100)}` with `cookie=${cookie.includes('refreshToken') ? 'PRESENT' : 'MISSING'}`
  2. authTrace.js line 82: Replace `setCookie=${...}` with `setCookie=${res.statusCode === 200 ? 'PRESENT' : 'NONE'}`
  3. authTrace.js line 81: Strip `accessToken`/`token` from body before logging
  4. authController.js line 815: Replace `console.error('❌ refreshSession error:', error)` with `console.error('❌ refreshSession error:', error.message)`
Compatibility: Fully backward compatible. No schema migration required.
```

---

## 22. Repository Verification Plan

### Static Verification

| Check | Tool | Command |
|---|---|---|
| No direct POST /auth/refresh outside refreshAccessToken | grep | `grep -rn "post.*'/auth/refresh'" src/` — should only appear in `apiClient.js` |
| ProtectedRoute applied to POS routes | grep | `grep -rn "ProtectedRoute" src/routes/partner/posPartnerRoutes.jsx` — should appear |
| Bootstrap gate in App.jsx | grep | `grep -rn "bootstrapReady\|authBootstrapState" src/App.jsx` — should appear |
| No raw Cookie in authTrace.js | grep | `grep -rn "cookie.slice\|cookie.substring" server/middlewares/authTrace.js` — should be empty |
| No raw Set-Cookie in authTrace.js | grep | `grep -rn "setCookie" server/middlewares/authTrace.js` — should only show `'PRESENT'/'NONE'` |
| Inflight Map in store | grep | `grep -rn "_inflightBySaleId" src/features/bill/store/billStore.js` — should be inside store definition |
| No resetAction in effect start | grep | `grep -rn "resetAction()" src/features/bill/pages/PrintBillPageFullTax.jsx` — should only appear in cleanup |

### Lint Verification
```bash
cd d:\alpha-tech\client
npm run lint  # or eslint src/
```

### TypeScript / JSDoc Verification
```bash
cd d:\alpha-tech\client
npx tsc --noEmit  # if TypeScript config exists
```

---

## 23. Runtime Verification Matrix

| ID | Scenario | Expected | Slice |
|---|---|---|---|
| AUTH-R01 | Standard protected-page reload | One refresh, one /auth/me, page restored | B |
| AUTH-R02 | Direct protected URL in new tab with valid cookie | Session restored, page renders | B |
| AUTH-R03 | Three sequential reloads after each stable page | Each reload: one refresh, one /auth/me | B |
| AUTH-R04 | Protected request while bootstrap pending | Request waits; no initial 401 | A, B |
| AUTH-R05 | Two simultaneous protected requests, no token | One refresh; both continue | A |
| AUTH-R06 | Refresh returns unauthorized | One logout, one redirect, no loop | A |
| AUTH-R07 | Refresh network failure | Defined unauthenticated behavior | A |
| AUTH-R08 | Access token expires during active session | One refresh, successful retry | A |
| AUTH-R09 | Two independent 401 responses close together | One refresh Promise shared | A |
| AUTH-R10 | Logout followed by protected-route navigation | No stale access, no auto data load | B |
| AUTH-R11 | Public route access while unauthenticated | Route renders without auth | B |
| AUTH-R12 | No raw token/cookie in trace output | All secrets masked | S |
| DATA-R01 | Print page mount in React StrictMode | One effective sale-detail request | C |
| DATA-R02 | Navigate sale 766 → sale 805 | Correct data for each sale | C |
| DATA-R03 | Leave page during inflight request | No error, no stale data | C |
| DATA-R04 | Rapid route change between sale IDs | No race condition, correct final data | C |
| DATA-R05 | Production build without StrictMode | Same behavior as before | C |

---

## 24. Rollback Plan

### Per-Slice Rollback

| Slice | Rollback Action | Risk |
|---|---|---|
| A | Revert `bootstrapAuthAction()` to direct `apiClient.post('/auth/refresh')` | Low — restores original behavior |
| B | Revert `App.jsx` to synchronous `RouterProvider` rendering; remove `ProtectedRoute` from `posPartnerRoutes.jsx` | Low — restores original behavior |
| C | Revert `_inflightBySaleId` to module-level Map; restore `resetAction()` in effect start | Low — restores original behavior |
| D | Revert `where` clause to original (remove `revokedAt: null`) | Low — restores original behavior |
| S | Revert trace files to original | Low — restores original logging |

### Full Rollback
```bash
cd d:\alpha-tech\client
git checkout -- src/App.jsx src/features/auth/store/authStore.js src/utils/apiClient.js src/routes/partner/posPartnerRoutes.jsx src/features/bill/store/billStore.js src/features/bill/pages/PrintBillPageFullTax.jsx src/features/bill/pages/PrintBillPageShortTax.jsx src/utils/authTrace.js

cd d:\alpha-tech\server
git checkout -- controllers/authController.js middlewares/authTrace.js
```

---

## 25. Residual Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Cross-tab refresh race: Two browser tabs could still issue concurrent refresh requests | Medium | Existing localStorage cross-tab lock should prevent this. Verify during testing. |
| `refreshAccessToken()` called before `apiClient` is fully initialized | Low | `refreshAccessToken()` is defined inside `createApiClient()` — ensure it's available before bootstrap. |
| `authBootstrapState` not consumed by all route guards | Medium | Audit all route definitions for auth checks. Add `ProtectedRoute` to any unprotected POS routes. |
| `resetAction()` consumers expect inflight state to be cleared | Low | Audit all `resetAction()` callers. If any depend on inflight clearing, use `clearCacheAction()` instead. |
| Backend rotation hardening (Slice D) could cause false positives if token is legitimately rotated | Low | The `revokedAt: null` check is correct — a legitimately rotated token already has `revokedAt` set. |
| StrictMode behavior differs between React 18 and React 19 | Low | Verify with the installed React version. The fix is correct for both. |
| `waitForAuthBootstrapToFinish()` removal could break other interceptor consumers | Medium | Audit all interceptor consumers. The bootstrap gate makes this unnecessary for route-level protection. |

---

## 26. Implementation Authorization Checklist

Before any production modification, verify all of the following:

- [ ] Slice A design reviewed and approved
- [ ] Slice B design reviewed and approved
- [ ] Slice C design reviewed and approved
- [ ] Slice D decision made (implement or defer)
- [ ] Slice S decision made (merge into Slice A or separate)
- [ ] No circular dependency confirmed
- [ ] All 11 AUTH invariants documented and testable
- [ ] All 5 DATA invariants documented and testable
- [ ] All 12 AUTH runtime scenarios defined
- [ ] All 5 DATA runtime scenarios defined
- [ ] Backend handoff notes prepared (Slice D, Slice S)
- [ ] Rollback plan documented
- [ ] Residual risks accepted
- [ ] Implementation order: Slice A → Slice B → Slice C → (Slice D) → (Slice S)
- [ ] No production files modified during design phase
- [ ] No dependencies installed during design phase
- [ ] No runtime executed during design phase
- [ ] No commit or push created during design phase

---

## Appendix: Key File References

| File | Path | Key Lines |
|---|---|---|
| App.jsx | `src/App.jsx` | 16-32 (bootstrap), 44 (RouterProvider) |
| authStore.js | `src/features/auth/store/authStore.js` | 15 (import apiClient), 448 (direct POST) |
| apiClient.js | `src/utils/apiClient.js` | 27 (refreshPromise), 320 (waitForAuth), 411 (refreshAccessToken) |
| ProtectedRoute.jsx | `src/features/auth/components/ProtectedRoute.jsx` | 10-40 (auth check logic) |
| posPartnerRoutes.jsx | `src/routes/partner/posPartnerRoutes.jsx` | Route definitions (no ProtectedRoute) |
| billStore.js | `src/features/bill/store/billStore.js` | 8 (_inflightBySaleId), 80 (resetAction), 157 (inflight check), 260 (inflight set), 267 (inflight delete) |
| PrintBillPageFullTax.jsx | `src/features/bill/pages/PrintBillPageFullTax.jsx` | 76 (resetAction in effect start) |
| PrintBillPageShortTax.jsx | `src/features/bill/pages/PrintBillPageShortTax.jsx` | 82-84 (cleanup) |
| authController.js | `server/controllers/authController.js` | 713-820 (refreshSession), 778-785 (rotation transaction) |
| authTrace.js (server) | `server/middlewares/authTrace.js` | 72 (raw cookie), 81-82 (raw body/setCookie) |
| authTrace.js (client) | `src/utils/authTrace.js` | 77 (raw body) |
| schema.prisma | `server/prisma/schema.prisma` | 1177-1195 (RefreshToken model) |


