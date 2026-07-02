# Runtime Sequence Catalog

Status: DRAFT / CERTIFICATION IN PROGRESS

## Purpose
Document end-to-end frontend runtime sequences before implementation.

## Certified Runtime Sequences (planned)

1. Application Startup Runtime
2. Auth Bootstrap Runtime
3. Session Refresh Runtime
4. Verify Session Runtime
5. POS Login Runtime
6. Online Login Runtime
7. Branch Handoff Runtime
8. POS Navigation Runtime
9. Checkout Runtime
10. Logout Runtime
11. Cart Synchronization Runtime
12. Error Recovery Runtime

---

## RS-001 Application Startup Runtime

```txt
Browser
  ↓
main.jsx
  ↓
App.jsx
  ↓
bootstrapAuthAction()
  ↓
RouterProvider
  ↓
AppRouter
  ↓
Partner Layout / Online Layout
```

Primary Owners:
- App
- authStore
- AppRouter

Risk:
- Router may render while auth bootstrap is still running.

---

## RS-002 Auth Bootstrap Runtime

```txt
authStore.bootstrapAuthAction
        ↓
/auth/refresh
        ↓
verifySessionAction
        ↓
/auth/me
        ↓
employee/customer
        ↓
branchStore.loadAndSetBranchById
```

Primary Owners:
- authStore
- apiClient
- branchStore

Risk:
- Refresh success but branch loading failure.

---

## RS-003 POS Login Runtime

```txt
LoginPage
    ↓
loginAction
    ↓
set session
    ↓
verify
    ↓
load branch
    ↓
navigate /:shopSlug/pos
```

Current Policy:
- LoginPage owns post-login routing.

---

## RS-004 Logout Runtime

```txt
Header / UnifiedMainNav / LogoutButton
          ↓
logoutAction
          ↓
clear auth
          ↓
clear branch
          ↓
navigation
```

Known Issue:
- Redirect ownership is split.

---

## Working Rule

Every runtime sequence must identify:

- Runtime owner
- State mutations
- API calls
- Navigation
- Error path
- Recovery path
- Related ADR
- Related Risk
