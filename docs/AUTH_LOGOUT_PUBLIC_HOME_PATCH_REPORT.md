# AUTH LOGOUT PUBLIC HOME PATCH REPORT

## Root Cause / UX Rationale

After a user explicitly logs out, redirecting to `/login` creates a poor UX loop — the user just logged out, so showing them the login form again is redundant and confusing. The expected behavior is to return to the public Marketplace home (`/`), where the user can browse as an unauthenticated visitor and choose to log in again if they wish.

The `/login` destination was a legacy default that conflated two separate concerns:
1. **Explicit user logout** → should go to public home (`/`)
2. **Unauthenticated protected-route access** → should go to `/login` (handled by `ProtectedRoute`)

These are now properly separated.

## Files Modified

| File | Change |
|------|--------|
| `src/features/auth/store/authStore.js` (line 550) | `window.location.href = '/login'` → `window.location.href = '/'` |
| `src/components/LogoutButton.jsx` (line 12) | `navigate('/login')` → `navigate('/')` |

## Navigation Behavior

### Before Patch
- **Explicit logout** → `/login`
- **ProtectedRoute (unauthenticated)** → `/login`

### After Patch
- **Explicit logout** → `/` (public Marketplace home)
- **ProtectedRoute (unauthenticated)** → `/login` (unchanged)

## Protected-Route Behavior Preserved

`src/features/auth/components/ProtectedRoute.jsx` was **not modified**. It continues to redirect unauthenticated users to `/login`:

```jsx
if (!isAuthenticated) {
  if (location.pathname === '/login') {
    return null;
  }
  return <Navigate to="/login" replace />;
}
```

## Verification Results

| Check | Result |
|-------|--------|
| Typecheck (`npm run typecheck`) | PASS — no errors |
| Build (`npm run build`) | PASS — production build succeeds |
| Tests (`npm run test:run`) | PASS — 21/21 tests pass across 3 test files |
| `git diff --check` | PASS — no whitespace errors (pre-existing CRLF warnings only) |
| API contract changed | NO |
| Backend modified | NO |

## Runtime Retest Plan

### Test L1 — Explicit logout
1. Login.
2. Open a protected page.
3. Click Logout.
4. **Expected:** POST /api/auth/logout → 200, URL becomes `/`, Marketplace home renders, user remains unauthenticated, no redirect loop, no blank page.

### Test L2 — Protected route while logged out
1. While logged out, manually open a protected URL.
2. **Expected:** Redirect to `/login`, login page renders.

### Test L3 — Login again
1. Login from `/login`.
2. **Expected:** Protected page loads with Bearer=YES.

## Commit and Push Status

| Action | Status |
|--------|--------|
| Commit created | NO |
| Push performed | NO |

## Summary of All Logout Call Sites

| Location | Navigation | Status |
|----------|-----------|--------|
| `authStore.logoutAction()` | `window.location.href = '/'` | ✅ Patched |
| `LogoutButton.jsx` | `navigate('/')` | ✅ Patched |
| `UnifiedMainNav.jsx` handleLogout | `navigate('/')` | ✅ Already correct |
| `UnifiedMainNav.jsx` handleLogoutAllDevices | `navigate('/')` | ✅ Already correct |
| `HeaderPos.jsx` handleLogout | `navigate('/')` | ✅ Already correct |
| `SidebarSuperAdmin.jsx` | calls `logoutAction()` → inherits store fix | ✅ Fixed via store |
| `LoginPage.jsx` (error recovery) | `navigate('/partner-portal')` | ✅ Unchanged (not explicit logout) |
