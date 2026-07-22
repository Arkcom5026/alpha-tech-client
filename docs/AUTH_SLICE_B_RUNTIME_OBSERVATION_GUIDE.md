# AUTH Slice B — Runtime Observation Guide

## Baseline

| Field | Value |
|---|---|
| Branch | `main` |
| HEAD | `3e80885800c8a960df979020fed8f32a1eb515cf` |
| Date | 2026-07-22 |
| Mode | READ-ONLY verification |

---

## 1. Architecture Overview

### Dual Gate Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.jsx                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Rendering Gate (Primary)                               │    │
│  │  bootstrapReady ? <RouterProvider /> : <LoadingSpinner> │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    apiClient.js                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Request Interceptor Gate (Secondary)                   │    │
│  │  waitForAuthBootstrapToFinish() before protected reqs   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Role |
|---|---|
| `App.jsx` | Starts bootstrap, gates RouterProvider rendering |
| `authStore.js` | Single source of truth for auth state, `authBootstrapState` lifecycle |
| `apiClient.js` | Request/response interceptors, refresh queue, bootstrap gate |
| `authTrace.js` | Temporary runtime tracing (console.log with fingerprints) |
| `ProtectedRoute.jsx` | Route-level auth guard (defense-in-depth) |

### Key Synchronization Primitives

| Primitive | Type | Location | Purpose |
|---|---|---|---|
| `authBootstrapState` | Zustand string field | `authStore.js` | Tracks bootstrap lifecycle: `idle` → `loading` → `authenticated`/`unauthenticated`/`failed` |
| `bootstrapReady` | React `useState` boolean | `App.jsx` | Gates `RouterProvider` rendering |
| `bootstrapAuthPromise` | Module-level Promise | `authStore.js` | Deduplicates concurrent `bootstrapAuthAction()` calls |
| `verifySessionPromise` | Module-level Promise | `authStore.js` | Deduplicates concurrent `verifySessionAction()` calls |
| `refreshPromise` | Module-level Promise | `apiClient.js` | Deduplicates concurrent `refreshAccessToken()` calls |
| `initialAuthBootstrapPromise` | Module-level Promise | `App.jsx` | Ensures bootstrap runs exactly once on initial mount |
| `AUTH_REFRESH_LOCK_KEY` | localStorage key | `apiClient.js` | Cross-tab refresh lock (prevents duplicate refresh across tabs) |

---

## 2. Runtime Sequence Diagrams

### 2A. Authenticated Reload (Valid Refresh Cookie)

```
Browser                          App.jsx              authStore              apiClient              Backend
  │                                │                     │                      │                      │
  │  Reload                        │                     │                      │                      │
  │ ──────────────────────────────►│                     │                      │                      │
  │                                │                     │                      │                      │
  │                                │ bootstrapAuthAction()                     │                      │
  │                                │ ───────────────────►│                      │                      │
  │                                │                     │                      │                      │
  │                                │                     │ authBootstrapState:   │                      │
  │                                │                     │ 'idle' → 'loading'   │                      │
  │                                │                     │ isBootstrappingAuth:  │                      │
  │                                │                     │ false → true         │                      │
  │                                │                     │                      │                      │
  │                                │                     │ refreshAccessToken('bootstrap')              │
  │                                │                     │ ───────────────────►│                      │
  │                                │                     │                      │                      │
  │                                │                     │                      │ POST /auth/refresh   │
  │                                │                     │                      │ ───────────────────►│
  │                                │                     │                      │                      │
  │                                │                     │                      │   200 {accessToken}  │
  │                                │                     │ ◄─────────────────── │ ◄────────────────────│
  │                                │                     │                      │                      │
  │                                │                     │ applyRefreshResultToStore()                  │
  │                                │                     │ ◄─────────────────── │                      │
  │                                │                     │                      │                      │
  │                                │                     │ verifySessionAction()                       │
  │                                │                     │ ───────────────────►│                      │
  │                                │                     │                      │                      │
  │                                │                     │                      │ GET /auth/me         │
  │                                │                     │                      │ ───────────────────►│
  │                                │                     │                      │                      │
  │                                │                     │                      │   200 {profile}     │
  │                                │                     │ ◄─────────────────── │ ◄────────────────────│
  │                                │                     │                      │                      │
  │                                │                     │ authBootstrapState:  │                      │
  │                                │                     │ 'loading' → 'authenticated'                 │
  │                                │                     │                      │                      │
  │                                │ bootstrapReady=true │                      │                      │
  │                                │ ◄───────────────────│                      │                      │
  │                                │                     │                      │                      │
  │  RouterProvider renders        │                     │                      │                      │
  │ ◄──────────────────────────────│                     │                      │                      │
  │                                │                     │                      │                      │
  │  Protected API request         │                     │                      │                      │
  │ ───────────────────────────────────────────────────────────────────────────►│                      │
  │                                │                     │                      │                      │
  │                                │                     │                      │   200 {data}         │
  │ ◄───────────────────────────────────────────────────────────────────────────│ ◄────────────────────│
```

**Expected Network Order (Browser DevTools):**
```
1. POST /api/auth/refresh          → 200
2. GET  /api/auth/me               → 200 (or 304)
3. GET  /api/protected/endpoint    → 200 (or 304)
```

**Expected Backend Log Order:**
```
1. POST /auth/refresh              → 200  (refreshAccessToken)
2. GET  /auth/me                   → 200  (verifySessionAction)
3. GET  /protected/endpoint        → 200  (protected API)
```

---

### 2B. Unauthenticated Reload (No Refresh Cookie / Expired)

```
Browser                          App.jsx              authStore              apiClient              Backend
  │                                │                     │                      │                      │
  │  Reload                        │                     │                      │                      │
  │ ──────────────────────────────►│                     │                      │                      │
  │                                │                     │                      │                      │
  │                                │ bootstrapAuthAction()                     │                      │
  │                                │ ───────────────────►│                      │                      │
  │                                │                     │                      │                      │
  │                                │                     │ authBootstrapState:  │                      │
  │                                │                     │ 'idle' → 'loading'  │                      │
  │                                │                     │                      │                      │
  │                                │                     │ refreshAccessToken('bootstrap')              │
  │                                │                     │ ───────────────────►│                      │
  │                                │                     │                      │                      │
  │                                │                     │                      │ POST /auth/refresh   │
  │                                │                     │                      │ ───────────────────►│
  │                                │                     │                      │                      │
  │                                │                     │                      │   401 NO_COOKIE      │
  │                                │                     │ ◄─────────────────── │ ◄────────────────────│
  │                                │                     │                      │                      │
  │                                │                     │ authBootstrapState:  │                      │
  │                                │                     │ 'loading' → 'unauthenticated'               │
  │                                │                     │ token → null        │                      │
  │                                │                     │ accessToken → null  │                      │
  │                                │                     │                      │                      │
  │                                │ bootstrapReady=true │                      │                      │
  │                                │ ◄───────────────────│                      │                      │
  │                                │                     │                      │                      │
  │  RouterProvider renders        │                     │                      │                      │
  │ ◄──────────────────────────────│                     │                      │                      │
  │                                │                     │                      │                      │
  │  Login screen displayed        │                     │                      │                      │
```

**Expected Network Order (Browser DevTools):**
```
1. POST /api/auth/refresh          → 401
```

**Expected Backend Log Order:**
```
1. POST /auth/refresh              → 401  (refresh token not found or expired)
```

---

### 2C. Access-Token Expiration While Already Authenticated

```
Browser                          App.jsx              authStore              apiClient              Backend
  │                                │                     │                      │                      │
  │  (Already authenticated)       │                     │                      │                      │
  │                                │                     │                      │                      │
  │  Protected API request         │                     │                      │                      │
  │ ───────────────────────────────────────────────────────────────────────────►│                      │
  │                                │                     │                      │                      │
  │                                │                     │                      │   401 TOKEN_EXPIRED  │
  │                                │                     │ ◄─────────────────── │ ◄────────────────────│
  │                                │                     │                      │                      │
  │                                │                     │                      │ refreshAccessToken('401')│
  │                                │                     │                      │ ────────┐            │
  │                                │                     │                      │         │            │
  │                                │                     │                      │  refreshPromise      │
  │                                │                     │                      │  created             │
  │                                │                     │                      │ ◄───────┘            │
  │                                │                     │                      │                      │
  │                                │                     │                      │ POST /auth/refresh   │
  │                                │                     │                      │ ───────────────────►│
  │                                │                     │                      │                      │
  │                                │                     │                      │   200 {accessToken}  │
  │                                │                     │ ◄─────────────────── │ ◄────────────────────│
  │                                │                     │                      │                      │
  │                                │                     │ applyRefreshResultToStore()                  │
  │                                │                     │ ◄─────────────────── │                      │
  │                                │                     │                      │                      │
  │                                │                     │                      │ Retry original req   │
  │                                │                     │                      │ with new Bearer      │
  │                                │                     │                      │ ───────────────────►│
  │                                │                     │                      │                      │
  │                                │                     │                      │   200 {data}         │
  │ ◄───────────────────────────────────────────────────────────────────────────│ ◄────────────────────│
```

**Expected Network Order (Browser DevTools):**
```
1. GET  /api/protected/endpoint    → 401
2. POST /api/auth/refresh          → 200
3. GET  /api/protected/endpoint    → 200  (retry with new token)
```

**Expected Backend Log Order:**
```
1. GET  /protected/endpoint        → 401  (expired access token)
2. POST /auth/refresh              → 200  (refreshAccessToken)
3. GET  /protected/endpoint        → 200  (retry with new token)
```

---

### 2D. Logout

```
Browser                          App.jsx              authStore              apiClient              Backend
  │                                │                     │                      │                      │
  │  User clicks Logout            │                     │                      │                      │
  │ ──────────────────────────────►│                     │                      │                      │
  │                                │                     │                      │                      │
  │                                │                     │ logoutAction()       │                      │
  │                                │                     │ ────────┐            │                      │
  │                                │                     │         │            │                      │
  │                                │                     │  POST /auth/logout   │                      │
  │                                │                     │ ───────────────────►│ ───────────────────►│
  │                                │                     │                      │                      │
  │                                │                     │   200 OK             │                      │
  │                                │                     │ ◄───────────────────│ ◄────────────────────│
  │                                │                     │         │            │                      │
  │                                │                     │  resetAuthStateAction()                     │
  │                                │                     │         │            │                      │
  │                                │                     │  authBootstrapState: │                      │
  │                                │                     │  → 'idle'           │                      │
  │                                │                     │  token → null       │                      │
  │                                │                     │  accessToken → null │                      │
  │                                │                     │  authChecked → false│                      │
  │                                │                     │  employee → null    │                      │
  │                                │                     │  customer → null    │                      │
  │                                │                     │         │            │                      │
  │                                │                     │  window.location    │                      │
  │                                │                     │  .href = '/login'   │                      │
  │                                │                     │ ◄───────┘            │                      │
  │                                │                     │                      │                      │
  │  Full page navigation to       │                     │                      │                      │
  │  /login                        │                     │                      │                      │
  │ ◄──────────────────────────────│                     │                      │                      │
```

**Expected Network Order (Browser DevTools):**
```
1. POST /api/auth/logout           → 200
2. (Full page navigation to /login)
```

**Expected Backend Log Order:**
```
1. POST /auth/logout               → 200  (session cleared)
```

---

## 3. State Transition Diagram

### authBootstrapState Lifecycle

```
                    ┌─────────┐
                    │  idle   │ ◄────────────────────┐
                    └────┬────┘                      │
                         │                           │
                    bootstrapAuthAction()             │
                         │                           │
                         ▼                           │
                    ┌─────────┐                      │
                    │ loading │                      │
                    └────┬────┘                      │
                         │                           │
              ┌──────────┼──────────┐                │
              │          │          │                │
              ▼          ▼          ▼                │
        ┌─────────┐ ┌─────────┐ ┌─────────┐         │
        │authenti-│ │unauthen-│ │ failed  │         │
        │ cated   │ │ticated  │ │         │         │
        └─────────┘ └─────────┘ └─────────┘         │
              │          │          │                │
              └──────────┴──────────┘                │
                         │                           │
                    resetAuthStateAction()            │
                         │                           │
                         └───────────────────────────┘
```

### Terminal States

| State | Terminal | Meaning |
|---|---|---|
| `idle` | No | Bootstrap has not started |
| `loading` | No | Bootstrap is actively resolving session |
| `authenticated` | **Yes** | Bootstrap completed, user has valid session |
| `unauthenticated` | **Yes** | Bootstrap completed, no valid session (401/403 from refresh) |
| `failed` | **Yes** | Bootstrap completed with unexpected error |

### State Transition Triggers

| Transition | Trigger | Code Location |
|---|---|---|
| `idle` → `loading` | `bootstrapAuthAction()` called | `authStore.js:440` |
| `loading` → `authenticated` | `verifySessionAction()` succeeds | `authStore.js:447, 476` |
| `loading` → `unauthenticated` | Refresh returns 401/403 | `authStore.js:449, 478, 484-493` |
| `loading` → `failed` | Unexpected error during bootstrap | `authStore.js:453, 498-505` |
| Any → `idle` | `resetAuthStateAction()` called | `authStore.js:516-529` |

---

## 4. Expected Browser Network Order

### Scenario A: Authenticated Reload

```
#  Time  Method  URL                          Status  Description
#  ────  ──────  ───────────────────────────  ──────  ─────────────────────
  1. T+0  POST   /api/auth/refresh            200     refreshAccessToken('bootstrap')
  2. T+1  GET    /api/auth/me                 200     verifySessionAction()
  3. T+2  GET    /api/protected/endpoint      200     Protected API (after bootstrap)
```

### Scenario B: Unauthenticated Reload

```
#  Time  Method  URL                          Status  Description
#  ────  ──────  ───────────────────────────  ──────  ─────────────────────
  1. T+0  POST   /api/auth/refresh            401     No refresh cookie
```

### Scenario C: Access-Token Expiration

```
#  Time  Method  URL                          Status  Description
#  ────  ──────  ───────────────────────────  ──────  ─────────────────────
  1. T+0  GET    /api/protected/endpoint      401     Expired access token
  2. T+1  POST   /api/auth/refresh            200     refreshAccessToken('401')
  3. T+2  GET    /api/protected/endpoint      200     Retry with new token
```

### Scenario D: Logout

```
#  Time  Method  URL                          Status  Description
#  ────  ──────  ───────────────────────────  ──────  ─────────────────────
  1. T+0  POST   /api/auth/logout             200     logoutAction()
  2. T+1  (Full page navigation to /login)
```

---

## 5. Expected Backend Log Order

### Scenario A: Authenticated Reload

```
[T+0] POST /auth/refresh              ← 200  - refreshAccessToken('bootstrap')
[T+1] GET  /auth/me                   ← 200  - verifySessionAction()
[T+2] GET  /protected/endpoint        ← 200  - Protected API
```

### Scenario B: Unauthenticated Reload

```
[T+0] POST /auth/refresh              ← 401  - No refresh cookie
```

### Scenario C: Access-Token Expiration

```
[T+0] GET  /protected/endpoint        ← 401  - Expired access token
[T+1] POST /auth/refresh              ← 200  - refreshAccessToken('401')
[T+2] GET  /protected/endpoint        ← 200  - Retry with new token
```

### Scenario D: Logout

```
[T+0] POST /auth/logout               ← 200  - logoutAction()
```

---

## 6. Observable Failure Signatures

### 6A. Duplicate Refresh

**Symptom:** Multiple `POST /api/auth/refresh` requests in Network tab within a short window.

**Root Cause:** `refreshPromise` deduplication failed, or cross-tab lock race condition.

**How to detect:**
```
[AUTH-TRACE] [REFRESH] START reason=401 original=/api/protected/endpoint
[AUTH-TRACE] [REFRESH] START reason=401 original=/api/other/endpoint
```

**Expected (healthy):** Only one `REFRESH START` for a given refresh cycle.

**Checklist:**
- [ ] `refreshPromise` is `null` before starting new refresh
- [ ] `refreshPromise` is set before async operation
- [ ] `refreshPromise` is reset to `null` in `finally` block
- [ ] Cross-tab lock `acquireRefreshLock()` returns `false` for non-owner tabs

---

### 6B. Deadlock

**Symptom:** Application hangs indefinitely on loading spinner. No network activity.

**Root Cause:** Circular dependency between bootstrap and refresh.

**How to detect:**
```
authBootstrapState = 'loading' (never transitions to terminal state)
```

**Expected (healthy):** Bootstrap reaches terminal state within 15 seconds.

**Checklist:**
- [ ] Refresh endpoint bypasses bootstrap gate (`isRefreshEndpoint()` → `true`)
- [ ] `/auth/me` endpoint bypasses bootstrap gate (`isAuthMeEndpoint()` → `true`)
- [ ] Login endpoint bypasses bootstrap gate (`isAuthBypassEndpoint()` → `true`)
- [ ] `bootstrapAuthAction()` calls `refreshAccessToken()` directly, not through `apiClient` interceptor
- [ ] `refreshPromise` does not wait on `bootstrapAuthPromise`
- [ ] `bootstrapAuthPromise` does not wait on `refreshPromise`

---

### 6C. Stale Authorization

**Symptom:** Protected API requests fail with 401 even though user is authenticated.

**How to detect:**
```
[AUTH-TRACE] REQUEST id=xxx GET /api/protected/endpoint Bearer=NO token=ABC123
```

**Expected (healthy):** `Bearer=YES` for all protected requests after bootstrap completes.

**Checklist:**
- [ ] `getToken()` is called **after** `waitForAuthBootstrapToFinish()` in request interceptor
- [ ] Token is read from store, not from closure
- [ ] `applyAuthorizationHeader()` is called with the token
- [ ] `applyRefreshResultToStore()` updates the store before retry

---

### 6D. Bearer=NO Escape

**Symptom:** Protected API request fires with `Bearer=NO` even though a valid token exists.

**How to detect:**
```
[AUTH-TRACE] REQUEST id=xxx GET /api/protected/endpoint Bearer=NO token=ABC123
```

**Root Cause:** Race condition where token is read before `applyRefreshResultToStore()` completes.

**Checklist:**
- [ ] Request interceptor waits for bootstrap gate before reading token
- [ ] `getToken()` reads from `useAuthStore.getState()` (latest state)
- [ ] No cached/stale token reference in closures

---

### 6E. Infinite Bootstrap

**Symptom:** `authBootstrapState` stays `'loading'` indefinitely. Loading spinner never resolves.

**How to detect:**
```
authBootstrapState = 'loading' (persists > 30 seconds)
```

**Root Cause:** Bootstrap promise never resolves, or terminal state never set.

**Checklist:**
- [ ] All code paths in `bootstrapAuthAction()` set a terminal state
- [ ] Success path (has token): sets `'authenticated'` or `'unauthenticated'`
- [ ] Success path (refresh): sets `'authenticated'` or `'unauthenticated'`
- [ ] 401/403 error: sets `'unauthenticated'`
- [ ] Unexpected error: sets `'failed'`
- [ ] `finally` block resets `bootstrapAuthPromise` to `null`
- [ ] `waitForAuthBootstrapToFinish()` has 15000ms timeout safety net

---

### 6F. Recursive Retry

**Symptom:** Infinite loop of 401 → refresh → retry → 401 → refresh → retry.

**How to detect:**
```
Network tab shows repeating pattern:
  GET /api/protected/endpoint → 401
  POST /api/auth/refresh → 200
  GET /api/protected/endpoint → 401
  POST /api/auth/refresh → 200
  ...
```

**Root Cause:** New token is also expired, or backend returns same expired token.

**Checklist:**
- [ ] `_retry` flag prevents infinite retry on same request
- [ ] Auth bypass endpoints do not retry (`isAuthBypassEndpoint()` check)
- [ ] Refresh endpoint does not retry (`isRefreshEndpoint()` check)
- [ ] Logout endpoint does not retry (`isLogoutEndpoint()` check)
- [ ] `refreshAccessToken()` clears token on failure to break the loop

---

## 7. Human Runtime Checklist

### 7A. Bootstrap State Transitions

- [ ] `authBootstrapState` starts as `'idle'` on app load
- [ ] `bootstrapAuthAction()` transitions to `'loading'`
- [ ] With valid refresh cookie: transitions to `'authenticated'`
- [ ] Without refresh cookie: transitions to `'unauthenticated'`
- [ ] On unexpected error: transitions to `'failed'`
- [ ] `resetAuthStateAction()` resets to `'idle'`

### 7B. Request Interceptor Flow

- [ ] Protected requests wait for bootstrap gate (`waitForAuthBootstrapToFinish()`)
- [ ] Auth bypass endpoints skip the gate (`isAuthBypassEndpoint()`)
- [ ] `/auth/me` skips the gate (`isAuthMeEndpoint()`)
- [ ] Token is read **after** gate completes (`getToken()` after `await`)
- [ ] `Authorization` header is attached with `Bearer` prefix
- [ ] `baseURL` is refreshed on each request (`getRuntimeBaseURL()`)

### 7C. Response Interceptor Flow

- [ ] 401 on non-bypass endpoint triggers `refreshAccessToken('401')`
- [ ] `_retry` flag prevents infinite retry
- [ ] Refresh endpoint 401 does NOT trigger retry
- [ ] Logout endpoint 401 does NOT trigger retry
- [ ] Auth bypass endpoint 401 does NOT trigger retry
- [ ] Network error returns friendly Thai error message

### 7D. refreshPromise Lifecycle

- [ ] `refreshPromise` is `null` before first refresh
- [ ] `refreshPromise` is set before async operation
- [ ] Concurrent callers share the same `refreshPromise`
- [ ] `refreshPromise` is reset to `null` in `finally` block
- [ ] Cross-tab lock prevents duplicate refresh across tabs
- [ ] Cross-tab result sharing works (wait up to 12 seconds)

### 7E. bootstrapPromise / Bootstrap Gate Lifecycle

- [ ] `bootstrapAuthPromise` deduplicates concurrent calls
- [ ] `bootstrapAuthPromise` is reset to `null` in `finally` block
- [ ] `initialAuthBootstrapPromise` ensures bootstrap runs exactly once
- [ ] `initialAuthBootstrapStarted` flag prevents re-entry
- [ ] `bootstrapReady` state gates `RouterProvider` rendering
- [ ] Fallback effect checks terminal state if effect missed it

### 7F. Authorization Attachment Point

- [ ] `getToken()` reads `accessToken` or `token` from store
- [ ] Returns `Bearer ${token}` or `null`
- [ ] `applyAuthorizationHeader()` sets header on config
- [ ] Header is set **after** bootstrap gate completes
- [ ] Header is set **after** refresh completes (in retry path)

### 7G. Request Classification Rules

| Endpoint | Bypass Gate? | Bypass Auth Header? | Retry on 401? |
|---|---|---|---|
| `/auth/login` | Yes | Yes | No |
| `/auth/register` | Yes | Yes | No |
| `/auth/forgot-password` | Yes | Yes | No |
| `/auth/reset-password` | Yes | Yes | No |
| `/auth/refresh` | Yes | Yes | No |
| `/auth/logout` | Yes | Yes | No |
| `/auth/logout-all` | Yes | Yes | No |
| `/auth/me` | Yes | No | Yes |
| All other endpoints | No | No | Yes |

### 7H. Public Endpoint Bypass Rules

- [ ] `isAuthBypassEndpoint()` matches both `/auth/xxx` and `auth/xxx` (with and without leading slash)
- [ ] `isRefreshEndpoint()` matches `/auth/refresh` and `auth/refresh`
- [ ] `isLogoutEndpoint()` matches `/auth/logout` and `auth/logout`
- [ ] `isAuthMeEndpoint()` matches `/auth/me` and `auth/me`

### 7I. Static Verification Checklist

- [ ] Refresh endpoint bypasses bootstrap gate
- [ ] Login endpoint bypasses bootstrap gate
- [ ] Protected requests wait only while bootstrap is RUNNING
- [ ] Authorization header is attached AFTER waiting
- [ ] Waiters are always released (terminal states + timeout safety net)
- [ ] `refreshPromise` cannot wait on `bootstrapPromise`
- [ ] `bootstrapPromise` cannot wait on `refreshPromise`
- [ ] No direct `apiClient.post('/auth/refresh')` outside `refreshAccessToken()`
- [ ] `bootstrapAuthAction()` delegates refresh to `refreshAccessToken()`
- [ ] `verifySessionAction()` uses `apiClient.get('/auth/me')` (bypasses gate)

---

## 8. Auth Trace Log Interpretation

### Log Format

```
[AUTH-TRACE] [HH:MM:SS.mmm] [CATEGORY] message
```

### Categories

| Category | Meaning |
|---|---|
| `INIT` | Auth trace initialized |
| `REQUEST` | Outgoing API request |
| `RESPONSE` | Incoming API response |
| `REFRESH` | Refresh token operation |
| `STORE` | Auth store mutation |
| `FLOW` | Bootstrap flow marker |
| `ROUTE_GUARD` | ProtectedRoute evaluation |
| `LOGOUT` | Logout operation |

### Key Patterns to Watch

**Healthy authenticated reload:**
```
[AUTH-TRACE] [FLOW] bootstrapAuthAction:start hasToken=true
[AUTH-TRACE] [FLOW] bootstrapAuthAction:hasToken-calling-verifySession
[AUTH-TRACE] [STORE] accessToken NULL → ABC123 authChecked false → true isBootstrappingAuth false → true trigger=setUser
[AUTH-TRACE] [REQUEST] id=xxx GET /auth/me Bearer=YES token=ABC123
[AUTH-TRACE] [RESPONSE] id=xxx 200 /auth/me
[AUTH-TRACE] [STORE] authBootstrapState loading → authenticated trigger=bootstrapAuthAction
```

**Healthy unauthenticated reload:**
```
[AUTH-TRACE] [FLOW] bootstrapAuthAction:start hasToken=false
[AUTH-TRACE] [FLOW] bootstrapAuthAction:noToken-calling-refreshAccessToken
[AUTH-TRACE] [REFRESH] START reason=bootstrap original=/api/auth/refresh
[AUTH-TRACE] [RESPONSE] id=xxx 401 /auth/refresh
[AUTH-TRACE] [STORE] accessToken ABC123 → NULL authChecked false → true isBootstrappingAuth true → false trigger=refreshAccessToken
[AUTH-TRACE] [STORE] authBootstrapState loading → unauthenticated trigger=bootstrapAuthAction
```

**Healthy 401 retry:**
```
[AUTH-TRACE] [REQUEST] id=xxx GET /api/protected/endpoint Bearer=YES token=ABC123
[AUTH-TRACE] [RESPONSE] id=xxx 401 /api/protected/endpoint
[AUTH-TRACE] [REFRESH] START reason=401 original=/api/protected/endpoint
[AUTH-TRACE] [REFRESH] SUCCESS newToken=DEF456
[AUTH-TRACE] [STORE] accessToken ABC123 → DEF456 trigger=refreshAccessToken
[AUTH-TRACE] [REQUEST] id=xxx GET /api/protected/endpoint Bearer=YES token=DEF456
[AUTH-TRACE] [RESPONSE] id=xxx 200 /api/protected/endpoint
```

---

## 9. Cross-Tab Refresh Mechanism

### Lock Protocol

```
Tab A acquires lock (localStorage)
  └── Tab B sees lock, waits for result
      └── Tab A completes refresh, publishes result
          └── Tab B reads result, applies to store
              └── Tab B skips its own refresh
```

### Key Parameters

| Parameter | Value | Description |
|---|---|---|
| `REFRESH_LOCK_TTL_MS` | 10000ms | Lock expiration |
| `REFRESH_WAIT_TIMEOUT_MS` | 12000ms | Max wait for cross-tab result |
| `SILENT_REFRESH_SKEW_MS` | 5 min | Refresh before token expiry |
| `SILENT_REFRESH_MIN_DELAY_MS` | 30s | Minimum delay before silent refresh |

### Failure Modes

| Scenario | Behavior |
|---|---|
| Lock owner crashes | Lock expires after 10s, other tabs proceed |
| Cross-tab result never published | Other tabs timeout after 12s, fall back to own refresh |
| Multiple tabs acquire lock simultaneously | First to write wins (last-write-wins localStorage) |

---

## 10. Silent Refresh Timer

### Mechanism

1. On token change, decode JWT payload to get `exp` claim
2. Schedule refresh at `exp - 5 minutes` (minimum 30s delay)
3. If token changes before timer fires, reschedule
4. If token is expired, skip scheduling

### Trace Pattern

```
[AUTH-TRACE] [STORE] accessToken NULL → ABC123 trigger=setUser
  → scheduleSilentRefreshForToken(ABC123, 'auth-store-token-change')
  → Timer set for (exp - 5min) from now
```

---

## Appendix: Key Code References

| Component | File | Key Lines |
|---|---|---|
| Bootstrap gate (rendering) | `src/App.jsx` | 16-32, 39-60, 63-75 |
| Bootstrap state machine | `src/features/auth/store/authStore.js` | 433-514 |
| Verify session | `src/features/auth/store/authStore.js` | 305-431 |
| Request interceptor | `src/utils/apiClient.js` | 381-427 |
| Response interceptor | `src/utils/apiClient.js` | 527-593 |
| Refresh access token | `src/utils/apiClient.js` | 429-525 |
| Bootstrap gate (interceptor) | `src/utils/apiClient.js` | 320-351 |
| Auth bypass classification | `src/utils/apiClient.js` | 295-318 |
| Cross-tab lock | `src/utils/apiClient.js` | 164-226 |
| Silent refresh timer | `src/utils/apiClient.js` | 88-145 |
| Protected route guard | `src/features/auth/components/ProtectedRoute.jsx` | 10-40 |
| Auth trace | `src/utils/authTrace.js` | 1-175 |
| Empty auth state | `src/features/auth/store/authStore.js` | 70-95 |
| Reset auth state | `src/features/auth/store/authStore.js` | 516-529 |
| Logout | `src/features/auth/store/authStore.js` | 531-563 |
