# AUTHENTICATION RUNTIME BASELINE V1

## 1. Baseline Purpose

This document establishes the verified Authentication Runtime Baseline v1 for the alpha-tech frontend application. It captures the architecture, state model, runtime sequences, operational invariants, and verification evidence for the authentication subsystem as of the baseline commit.

The baseline ensures that:
- Authentication state transitions are deterministic and observable
- Refresh authority is centralized to a single execution path
- Protected routes are gated during bootstrap resolution
- Explicit logout returns to public home
- No login redirect loop exists
- No backend or API contract changes are required

## 2. Architecture Summary

```
App.jsx
  └─ Bootstrap Gate (rendering)
       └─ RouterProvider
            └─ AppRouter
                 ├─ / (public) → MarketplacePortalPage
                 ├─ /login (public) → LoginPage
                 ├─ /partner-portal (public) → PartnerWelcomePage
                 ├─ /:shopSlug/pos → PartnerPosMasterLayout
                 │    └─ ProtectedRoute → posPartnerRoutes
                 ├─ /:shopSlug/superadmin → LayoutSuperAdmin
                 └─ /:shopSlug/shop → onlinePartnerRoutes

apiClient.js
  ├─ refreshAccessToken() → refreshPromise [SINGLE REFRESH AUTHORITY]
  ├─ request interceptor → waitForAuthBootstrapToFinish() + attach Bearer
  └─ response interceptor → 401 → refreshAccessToken() → retry

authStore.js
  ├─ bootstrapAuthAction() → refreshAccessToken() [UNIFIED]
  ├─ verifySessionAction() → GET /auth/me
  └─ state: { authBootstrapState, token, accessToken, authChecked, ... }
```

### Key Synchronization Primitives

| Primitive | Type | Location | Purpose |
|---|---|---|---|
| `authBootstrapState` | Zustand string field | authStore.js | Bootstrap lifecycle: idle → loading → authenticated/unauthenticated/failed |
| `bootstrapReady` | React useState boolean | App.jsx | Gates RouterProvider rendering |
| `bootstrapAuthPromise` | Module-level Promise | authStore.js | Deduplicates concurrent bootstrapAuthAction() calls |
| `verifySessionPromise` | Module-level Promise | authStore.js | Deduplicates concurrent verifySessionAction() calls |
| `refreshPromise` | Module-level Promise | apiClient.js | Deduplicates concurrent refreshAccessToken() calls |
| `initialAuthBootstrapPromise` | Module-level Promise | App.jsx | Ensures bootstrap runs exactly once on initial mount |
| `AUTH_REFRESH_LOCK_KEY` | localStorage key | apiClient.js | Cross-tab refresh lock |

## 3. Authentication State Model

The authentication state machine uses `authBootstrapState` with five states:

```
idle ──→ loading ──→ authenticated
                ──→ unauthenticated
                ──→ failed
```

### State Definitions

| State | Terminal | Meaning |
|---|---|---|
| `idle` | No | Bootstrap has not started |
| `loading` | No | Bootstrap is actively resolving session |
| `authenticated` | Yes | Bootstrap completed, user has valid session |
| `unauthenticated` | Yes | Bootstrap completed, no valid session |
| `failed` | Yes | Bootstrap completed with unexpected error |

### State Transition Triggers

| Transition | Trigger | Code Location |
|---|---|---|
| `idle` → `loading` | `bootstrapAuthAction()` called | authStore.js:440 |
| `loading` → `authenticated` | `verifySessionAction()` succeeds | authStore.js:447, 476 |
| `loading` → `unauthenticated` | Refresh returns 401/403 | authStore.js:449, 478, 484-493 |
| `loading` → `failed` | Unexpected error during bootstrap | authStore.js:453, 498-505 |
| Any → `idle` | `resetAuthStateAction()` called | authStore.js:516-529 |

### Backward Compatibility

`authChecked` and `isBootstrappingAuth` remain in the store for existing consumers. New consumers use `authBootstrapState`.

## 4. Single Refresh Authority

### Design

All refresh operations flow through a single function: `refreshAccessToken()` in `apiClient.js`. This function uses a module-level `refreshPromise` singleton to ensure only one refresh request is active at any time.

### Lifecycle

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

### Entry Points

| Entry Point | Path | Uses refreshPromise? |
|---|---|---|
| Bootstrap refresh | `bootstrapAuthAction()` → `refreshAccessToken('bootstrap')` | Yes |
| 401 interceptor | Response interceptor → `refreshAccessToken('401')` | Yes |
| Silent refresh timer | `scheduleSilentRefreshForToken()` → `refreshAccessToken('timer')` | Yes |

### Key Invariants

1. `refreshPromise` is set before any async operation.
2. `refreshPromise` is reset to `null` in `finally` block.
3. All callers `await refreshPromise`.
4. No caller issues `POST /auth/refresh` directly.
5. Cross-tab lock via localStorage prevents duplicate refresh across tabs.

## 5. Bootstrap Gate

### Rendering Gate (App.jsx)

The rendering gate in `App.jsx` delays `RouterProvider` rendering until bootstrap reaches a terminal state:

```jsx
if (!bootstrapReady) {
  return <LoadingScreen />;  // Spinner while bootstrap resolves
}
return <RouterProvider router={router} />;
```

The gate uses:
- `initialAuthBootstrapPromise` — module-level Promise to run bootstrap exactly once
- `bootstrapReady` — React useState that transitions to `true` when bootstrap completes
- Fallback `useEffect` — checks terminal state if the primary effect missed it

### Request Interceptor Gate (apiClient.js)

The request interceptor has a secondary gate that waits for bootstrap to finish before allowing protected requests to proceed:

```jsx
if (!isAuthBypassEndpoint(config.url) && !isAuthMeEndpoint(config.url)) {
  await waitForAuthBootstrapToFinish();
}
```

This prevents protected API requests from leaving the browser with `Bearer=NO` while bootstrap is still resolving.

### Bypass Rules

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

## 6. Rendering Gate

The rendering gate is the primary mechanism that prevents protected routes from mounting before authentication is resolved.

### Implementation

```jsx
// App.jsx
const App = () => {
  const bootstrapAuthAction = useAuthStore((state) => state.bootstrapAuthAction);
  const authBootstrapState = useAuthStore((state) => state.authBootstrapState);
  const [bootstrapReady, setBootstrapReady] = useState(false);

  useEffect(() => {
    const promise = runInitialAuthBootstrapOnce(bootstrapAuthAction);
    if (promise) {
      promise.finally(() => setBootstrapReady(true));
    } else {
      const state = useAuthStore.getState();
      if (state.authBootstrapState !== 'idle' && state.authBootstrapState !== 'loading') {
        setBootstrapReady(true);
      }
    }
  }, [bootstrapAuthAction]);

  if (!bootstrapReady) {
    return <LoadingScreen />;
  }

  return <RouterProvider router={router} />;
};
```

### Behavior

- **Before bootstrap**: Shows loading spinner, no routes render
- **After bootstrap (authenticated)**: RouterProvider renders, protected routes accessible
- **After bootstrap (unauthenticated)**: RouterProvider renders, public routes accessible, protected routes redirect to `/login`
- **After bootstrap (failed)**: RouterProvider renders, public routes accessible, protected routes redirect to `/login`

## 7. ProtectedRoute Behavior

`ProtectedRoute` is a layout wrapper applied to all POS routes in `posPartnerRoutes.jsx`.

### Logic

```jsx
if (isBootstrappingAuth) return null;           // Loading state
if (token && !isAuthenticated) return null;      // Waiting for verification
if (!isAuthenticated) {
  if (location.pathname === '/login') return null;  // Already on login
  return <Navigate to="/login" replace />;       // Redirect to login
}
if (allowedRoles.length > 0 && !allowedRoles.includes(role))
  return <Navigate to="/unauthorized" replace />;
return children ? children : <Outlet />;
```

### Behavior

| State | Action |
|---|---|
| Bootstrap in progress | Return null (no render) |
| Token exists but not verified | Return null (wait) |
| Not authenticated, not on /login | Redirect to /login |
| Not authenticated, already on /login | Return null (prevent loop) |
| Authenticated, role allowed | Render children |
| Authenticated, role not allowed | Redirect to /unauthorized |

## 8. Public Route Behavior

The following routes are public and accessible without authentication:

| Path | Component |
|---|---|
| `/` | MarketplacePortalPage |
| `/login` | LoginPage |
| `/partner-portal` | PartnerWelcomePage |
| `/partner-portal/forgot-password` | ForgotPasswordPage |
| `/partner-portal/reset-password` | ResetPasswordPage |

These routes render immediately after bootstrap completes, regardless of authentication state.

## 9. Explicit Logout Behavior

### Flow

```
User clicks Logout
  → logoutAction() or LogoutButton.handleLogout()
    → POST /api/auth/logout
    → resetAuthStateAction() clears all auth state
    → navigate('/') or window.location.href = '/'
    → Public Marketplace home renders
```

### Logout Call Sites

| Location | Navigation | Status |
|---|---|---|
| `authStore.logoutAction()` | `window.location.href = '/'` | ✅ |
| `LogoutButton.jsx` | `navigate('/')` | ✅ |
| `UnifiedMainNav.jsx` handleLogout | `navigate('/')` | ✅ |
| `UnifiedMainNav.jsx` handleLogoutAllDevices | `navigate('/')` | ✅ |
| `HeaderPos.jsx` handleLogout | `navigate('/')` | ✅ |
| `SidebarSuperAdmin.jsx` | calls `logoutAction()` → inherits store fix | ✅ |

### Key Behavior

- Explicit logout returns to public home `/`, not `/login`
- `ProtectedRoute` redirects unauthenticated users to `/login` (separate concern)
- No blank page after logout
- No login redirect loop after logout

## 10. Runtime Sequences

### 10A. Authenticated Reload

```
1. Browser reload
2. App.jsx renders, starts bootstrapAuthAction()
3. bootstrapAuthAction() calls refreshAccessToken('bootstrap')
4. refreshAccessToken() → POST /api/auth/refresh → 200 {accessToken}
5. applyRefreshResultToStore() updates store with new token
6. verifySessionAction() → GET /api/auth/me → 200 {profile}
7. authBootstrapState → 'authenticated'
8. bootstrapReady → true
9. RouterProvider renders
10. Protected API requests proceed with Bearer=YES
```

**Expected Network Order:**
```
1. POST /api/auth/refresh → 200
2. GET  /api/auth/me      → 200
3. GET  /api/protected/*  → 200
```

### 10B. Unauthenticated Reload

```
1. Browser reload
2. App.jsx renders, starts bootstrapAuthAction()
3. bootstrapAuthAction() calls refreshAccessToken('bootstrap')
4. refreshAccessToken() → POST /api/auth/refresh → 401 NO_COOKIE
5. authBootstrapState → 'unauthenticated'
6. bootstrapReady → true
7. RouterProvider renders
8. Public routes accessible, protected routes redirect to /login
```

**Expected Network Order:**
```
1. POST /api/auth/refresh → 401
```

### 10C. Access-Token Expiration

```
1. User is authenticated, access token expires
2. Protected API request → 401 TOKEN_EXPIRED
3. Response interceptor: shouldTryRefresh = true
4. refreshAccessToken('401') → POST /api/auth/refresh → 200 {newToken}
5. applyRefreshResultToStore() updates store
6. Original request retried with new Bearer token → 200
```

**Expected Network Order:**
```
1. GET  /api/protected/* → 401
2. POST /api/auth/refresh → 200
3. GET  /api/protected/* → 200 (retry)
```

### 10D. Explicit Logout

```
1. User clicks Logout
2. logoutAction() → POST /api/auth/logout → 200
3. resetAuthStateAction() clears all auth state
4. window.location.href = '/'
5. Full page navigation to /
6. Bootstrap runs → unauthenticated → public home renders
```

**Expected Network Order:**
```
1. POST /api/auth/logout → 200
2. (Full page navigation to /)
```

### 10E. Protected-Route Access While Logged Out

```
1. User is logged out
2. User navigates to protected URL (e.g., /advancetech/pos/dashboard)
3. Bootstrap runs → unauthenticated
4. RouterProvider renders
5. Route matches /:shopSlug/pos → PartnerPosMasterLayout → ProtectedRoute
6. ProtectedRoute: isAuthenticated = false
7. ProtectedRoute: <Navigate to="/login" replace />
8. /login route matches → LoginPage renders
```

## 11. Operational Invariants

### AUTH-INV-001
**Only one refresh authority exists.**
- `refreshAccessToken()` in `apiClient.js` is the sole function that issues `POST /auth/refresh`
- `bootstrapAuthAction()` delegates to `refreshAccessToken()` instead of issuing a direct POST
- `refreshPromise` singleton ensures only one in-flight refresh at a time

### AUTH-INV-002
**Protected requests must not leave the browser with Bearer=NO while bootstrap is loading.**
- Request interceptor calls `waitForAuthBootstrapToFinish()` before attaching Bearer header
- `getToken()` is called AFTER the gate completes
- Auth bypass endpoints and `/auth/me` skip the gate to prevent deadlock

### AUTH-INV-003
**Refresh, login, logout, and auth-control endpoints must bypass the bootstrap request gate as required to prevent deadlock.**
- `isAuthBypassEndpoint()` returns `true` for all auth endpoints
- `isAuthMeEndpoint()` returns `true` for `/auth/me`
- These endpoints skip `waitForAuthBootstrapToFinish()` in the request interceptor

### AUTH-INV-004
**Bootstrap must terminate in authenticated, unauthenticated, or failed.**
- All code paths in `bootstrapAuthAction()` set a terminal state
- Success path (has token): sets `'authenticated'` or `'unauthenticated'`
- Success path (refresh): sets `'authenticated'` or `'unauthenticated'`
- 401/403 error: sets `'unauthenticated'`
- Unexpected error: sets `'failed'`
- `finally` block resets `bootstrapAuthPromise` to `null`

### AUTH-INV-005
**Authorization must be read and attached after bootstrap waiting completes.**
- In request interceptor: `await waitForAuthBootstrapToFinish()` THEN `getToken()` THEN `applyAuthorizationHeader()`
- Token is read from `useAuthStore.getState()` (latest state), not from closure

### AUTH-INV-006
**Explicit logout must clear auth state and navigate to /.**
- `logoutAction()` calls `logoutSession()` → `resetAuthStateAction()` → `window.location.href = '/'`
- `LogoutButton.jsx` calls `logout()` → `navigate('/')`
- All logout call sites navigate to `/`

### AUTH-INV-007
**Unauthenticated protected-route access must navigate to /login.**
- `ProtectedRoute` checks `isAuthenticated` → if false, `<Navigate to="/login" replace />`
- `/login` route exists in `AppRouter.jsx` as a public route
- Same-location guard prevents redirect loop if already on `/login`

### AUTH-INV-008
**/login and / must remain public routes.**
- `/` → `MarketplacePortalPage` (public, no auth check)
- `/login` → `LoginPage` (public, no auth check)
- Both routes are outside `ProtectedRoute` wrappers

### AUTH-INV-009
**Refresh lifecycle must not recurse or rotate concurrently inside one browser tab.**
- `refreshPromise` singleton prevents concurrent refresh calls
- `_retry` flag prevents infinite retry on the same request
- Refresh endpoint does not trigger refresh interception recursively
- Cross-tab lock via localStorage prevents duplicate refresh across tabs

### AUTH-INV-010
**Auth logs must never expose raw JWT, refresh cookie, Authorization header, response body, or credentials.**
- `authTrace.js` uses SHA-256 fingerprint (first 12 hex chars) for token correlation
- `traceRefreshStart()` logs `cookie=refreshToken (HttpOnly)` — presence only, no raw value
- `traceRefreshSuccess()` logs fingerprint only
- `traceStoreMutation()` logs fingerprint only
- `traceRequest()` logs `Bearer=YES/NO` — presence only
- No raw Authorization header value in logs
- No raw access JWT in logs
- No raw refresh token in logs
- No raw Cookie header value in logs
- No raw Set-Cookie value in logs
- No raw response token body in logs

## 12. Closed Issues

### AUTH-001 — Session Recovery After Reload
Browser reload with valid refresh cookie restores session: refresh → /auth/me → protected API. Verified working.

### AUTH-002 — Protected Request Before Bootstrap Completion
Root cause: RouterProvider rendered synchronously before bootstrap resolved. ProtectedRoute was not applied to POS routes. Fixed by:
- Adding bootstrap rendering gate in App.jsx
- Applying ProtectedRoute as layout wrapper in posPartnerRoutes.jsx
- Keeping request interceptor gate as secondary safety net

### AUTH-003 — Concurrent Refresh
Root cause: bootstrapAuthAction() called apiClient.post('/auth/refresh') directly, bypassing refreshPromise singleton. Fixed by:
- Making bootstrapAuthAction() delegate to refreshAccessToken()
- refreshPromise is now the sole refresh authority

### AUTH-ARCH-001 — Authentication Authority Split
Architecture decision to split auth concerns:
- App.jsx: Bootstrap gate (rendering)
- authStore.js: State machine, bootstrap orchestration
- apiClient.js: Refresh authority, request/response interceptors
- ProtectedRoute.jsx: Route-level auth guard

### AUTH-B-UI-001 — Post-Logout /login Redirect Loop
Root cause: /login route was not defined in AppRouter.jsx. ProtectedRoute redirect to /login was intercepted by catch-all `*` route, which redirected back to a protected route, creating an infinite loop. Fixed by:
- Adding `/login` route to AppRouter.jsx
- Adding same-location guard in ProtectedRoute

## 13. Runtime Evidence Summary

The following runtime behaviors have been verified:

| Scenario | Status | Evidence |
|---|---|---|
| Authenticated reload | ✅ PASS | refresh → /auth/me → protected API |
| Unauthenticated reload | ✅ PASS | refresh 401 → public routes render |
| Access-token expiration | ✅ PASS | 401 → refresh → retry → 200 |
| Explicit logout | ✅ PASS | POST /logout → clear state → navigate to / |
| Protected-route access while logged out | ✅ PASS | Redirect to /login |
| Post-logout login route loop | ✅ FIXED | /login route exists, no loop |
| Concurrent refresh | ✅ FIXED | Single refreshPromise authority |
| Bootstrap gate | ✅ VERIFIED | RouterProvider waits for bootstrap |
| ProtectedRoute applied to POS routes | ✅ VERIFIED | Layout wrapper in posPartnerRoutes.jsx |
| Public routes accessible | ✅ VERIFIED | /, /login, /partner-portal all public |
| No blank page after logout | ✅ VERIFIED | Navigates to /, public home renders |
| No backend/API contract changes | ✅ VERIFIED | Frontend-only changes |

## 14. Verification Pipeline Baseline

The following verification commands are established:

```bash
# Typecheck
npm run typecheck

# Build
npm run build

# All tests
npm run test:run

# Focused auth receipt tests
npm run test:auth-receipt

# Whitespace check
git diff --check
```

### Pipeline Configuration

- **Typecheck**: `tsc -p tsconfig.check.json --noEmit`
- **Build**: `vite build`
- **Test runner**: Vitest
- **Test pattern**: `src/**/*.{test,spec}.{js,jsx,ts,tsx}`
- **E2E**: Playwright (infrastructure incomplete — not part of baseline gate)

### Test Files

| File | Purpose |
|---|---|
| `src/features/customerReceipt/__tests__/customerReceiptAuthRegression.test.js` | Auth regression — 12 scenarios |
| `src/features/customerReceipt/__tests__/customerReceiptRealAuthRace.test.js` | Real module auth race test |
| `src/features/customerReceipt/__tests__/authInvariantHelper.js` | Auth snapshot and invariant assertions |
| `src/features/customerReceipt/__tests__/testFactories.js` | Test payload builders |

## 15. Remaining Non-Auth Observations

The following observations are noted but are **not Authentication Baseline blockers**:

### Duplicate Feature Data Fetches
- React StrictMode double-mounting in development causes duplicate API requests for some feature pages
- This is a development-only concern; production builds do not have StrictMode double-mount
- Not related to authentication

### Possible StrictMode or Component-Level Duplicate Loading
- Some components may fire data-fetching effects twice under StrictMode
- This is a pre-existing pattern, not introduced by auth changes
- Not related to authentication

### Bundle-Size Warning
- The production build may emit bundle-size warnings
- These are pre-existing and not related to authentication changes

### Browserslist Warning
- A Browserslist configuration warning may appear during build
- This is pre-existing and not related to authentication changes

### npm audit Vulnerabilities
- `npm audit` may report vulnerabilities in dependencies
- These are pre-existing and not related to authentication changes

## 16. Files Included in the Baseline

### Modified Files (Staged)

| File | Change Summary |
|---|---|
| `src/App.jsx` | Added bootstrap rendering gate, runInitialAuthBootstrapOnce() |
| `src/features/auth/store/authStore.js` | Added authBootstrapState, unified refresh via refreshAccessToken() |
| `src/features/auth/components/ProtectedRoute.jsx` | Added same-location guard for /login |
| `src/routes/AppRouter.jsx` | Added /login route |
| `src/routes/partner/posPartnerRoutes.jsx` | Wrapped POS routes in ProtectedRoute |
| `src/utils/apiClient.js` | Export refreshAccessToken, bootstrap gate in interceptor |
| `src/utils/authTrace.js` | Security logging cleanup — SHA-256 fingerprints |
| `src/components/LogoutButton.jsx` | Navigate to / instead of /login |
| `vite.config.js` | Test configuration, path aliases |
| `package.json` | Added test scripts (test:auth-receipt, test:e2e:auth-receipt) |
| `package-lock.json` | Dependency metadata update (typescript added) |
| `tsconfig.check.json` | TypeScript check configuration |

### New Files (Untracked, to be staged)

| File | Category |
|---|---|
| `AUTH_ARCHITECTURE_PATCH_DESIGN_REPORT.md` | Auth documentation |
| `AUTH_ROOT_CAUSE_INVESTIGATION_REPORT.md` | Auth documentation |
| `docs/AUTH_LOGOUT_PUBLIC_HOME_PATCH_REPORT.md` | Auth documentation |
| `docs/AUTH_SLICE_B_POST_LOGOUT_ROUTE_LOOP_PATCH_REPORT.md` | Auth documentation |
| `docs/AUTH_SLICE_B_RUNTIME_OBSERVATION_GUIDE.md` | Auth documentation |
| `docs/testing/customer-receipt-auth-regression.md` | Verification pipeline documentation |
| `src/features/customerReceipt/__tests__/customerReceiptAuthRegression.test.js` | Verification pipeline — auth regression tests |
| `src/features/customerReceipt/__tests__/customerReceiptRealAuthRace.test.js` | Verification pipeline — real module auth race test |
| `src/features/customerReceipt/__tests__/authInvariantHelper.js` | Verification pipeline — test helper |
| `src/features/customerReceipt/__tests__/testFactories.js` | Verification pipeline — test factories |
| `e2e/customer-receipt-auth-regression.spec.js` | Verification pipeline — E2E test source (deliberate regression asset) |

### Excluded Files

| File | Reason |
|---|---|
| `src/features/customerReceipt.zip` | Deletion requires human decision — pre-existing deletion |
| `customer-receipt-auth-tests-frontend.diff` | Redundant patch artifact — changes already applied |

## 17. Commit SHA Placeholder

```
BASELINE_COMMIT_SHA: PENDING_COMMIT
```

## 18. Commit and Verification Status

| Check | Status |
|---|---|
| Typecheck | PENDING |
| Build | PENDING |
| Tests | PENDING |
| Focused auth tests | PENDING |
| Staged diff check | PENDING |
| Commit created | PENDING |
| Push performed | NO |
