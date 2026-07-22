# AUTHENTICATION RUNTIME BASELINE V1 — COMMIT REPORT

## Branch and Original HEAD

| Field | Value |
|---|---|
| Branch | `main` |
| Original HEAD | `3e80885800c8a960df979020fed8f32a1eb515cf` |

## Working-Tree Inventory

### Modified Files (staged in working tree)

```
M  package-lock.json
 M package.json
 M src/App.jsx
 M src/components/LogoutButton.jsx
 M src/features/auth/components/ProtectedRoute.jsx
 M src/features/auth/store/authStore.js
 D src/features/customerReceipt.zip
 M src/routes/AppRouter.jsx
 M src/routes/partner/posPartnerRoutes.jsx
 M src/utils/apiClient.js
 M src/utils/authTrace.js
 M vite.config.js
```

### Untracked Files

```
?? AUTH_ARCHITECTURE_PATCH_DESIGN_REPORT.md
?? AUTH_ROOT_CAUSE_INVESTIGATION_REPORT.md
?? customer-receipt-auth-tests-frontend.diff
?? docs/AUTH_LOGOUT_PUBLIC_HOME_PATCH_REPORT.md
?? docs/AUTH_RUNTIME_BASELINE_V1.md
?? docs/AUTH_SLICE_B_POST_LOGOUT_ROUTE_LOOP_PATCH_REPORT.md
?? docs/AUTH_SLICE_B_RUNTIME_OBSERVATION_GUIDE.md
?? docs/testing/
?? e2e/
?? src/features/customerReceipt/__tests__/
?? tsconfig.check.json
```

## Classification of Every Modified/Untracked File

### A. AUTH BASELINE — INCLUDE

| File | Justification |
|---|---|
| `src/App.jsx` | Bootstrap rendering gate — core auth baseline change |
| `src/features/auth/store/authStore.js` | authBootstrapState state machine, unified refresh via refreshAccessToken() |
| `src/features/auth/components/ProtectedRoute.jsx` | Same-location guard for /login, route-level auth guard |
| `src/routes/AppRouter.jsx` | Added /login route — fixes post-logout redirect loop |
| `src/routes/partner/posPartnerRoutes.jsx` | Wrapped POS routes in ProtectedRoute layout |
| `src/utils/apiClient.js` | Single refresh authority (refreshPromise), bootstrap gate in interceptor |
| `src/utils/authTrace.js` | Security logging cleanup — SHA-256 fingerprints, no raw secrets |
| `src/components/LogoutButton.jsx` | Navigate to / instead of /login — explicit logout to public home |
| `vite.config.js` | Test configuration for auth regression tests |
| `package.json` | Added test scripts (test:auth-receipt, test:e2e:auth-receipt) |
| `package-lock.json` | Dependency metadata update (typescript added as devDependency) |
| `tsconfig.check.json` | TypeScript check configuration for typecheck pipeline |

### B. VERIFICATION PIPELINE — INCLUDE

| File | Justification |
|---|---|
| `src/features/customerReceipt/__tests__/customerReceiptAuthRegression.test.js` | Auth regression test — 12 scenarios |
| `src/features/customerReceipt/__tests__/customerReceiptRealAuthRace.test.js` | Real module auth race test |
| `src/features/customerReceipt/__tests__/authInvariantHelper.js` | Auth snapshot and invariant assertions |
| `src/features/customerReceipt/__tests__/testFactories.js` | Test payload builders |
| `docs/testing/customer-receipt-auth-regression.md` | Test documentation |

### C. AUTH DOCUMENTATION — INCLUDE

| File | Justification |
|---|---|
| `AUTH_ARCHITECTURE_PATCH_DESIGN_REPORT.md` | Architecture design report — documents the auth architecture decisions |
| `AUTH_ROOT_CAUSE_INVESTIGATION_REPORT.md` | Root cause investigation — documents AUTH-002, AUTH-003, DATA-001 |
| `docs/AUTH_LOGOUT_PUBLIC_HOME_PATCH_REPORT.md` | Logout UX patch report |
| `docs/AUTH_SLICE_B_POST_LOGOUT_ROUTE_LOOP_PATCH_REPORT.md` | Post-logout route loop patch report |
| `docs/AUTH_SLICE_B_RUNTIME_OBSERVATION_GUIDE.md` | Runtime observation guide |
| `docs/AUTH_RUNTIME_BASELINE_V1.md` | **This baseline document** |
| `e2e/customer-receipt-auth-regression.spec.js` | Deliberate regression asset — E2E test source (Playwright infrastructure incomplete, but source is a deliberate regression asset) |

### D. UNRELATED / PRE-EXISTING — EXCLUDE

| File | Reason |
|---|---|
| `customer-receipt-auth-tests-frontend.diff` | Redundant patch artifact — changes already applied in working tree |

### E. DELETION REQUIRES HUMAN DECISION — EXCLUDE

| File | Reason |
|---|---|
| `src/features/customerReceipt.zip` | Deletion is pre-existing (D status in git). Not part of approved auth baseline mission. Requires human decision. |

## Exact Included Files

### Modified files to stage:

1. `package-lock.json`
2. `package.json`
3. `src/App.jsx`
4. `src/components/LogoutButton.jsx`
5. `src/features/auth/components/ProtectedRoute.jsx`
6. `src/features/auth/store/authStore.js`
7. `src/routes/AppRouter.jsx`
8. `src/routes/partner/posPartnerRoutes.jsx`
9. `src/utils/apiClient.js`
10. `src/utils/authTrace.js`
11. `vite.config.js`
12. `tsconfig.check.json`

### New files to stage:

13. `AUTH_ARCHITECTURE_PATCH_DESIGN_REPORT.md`
14. `AUTH_ROOT_CAUSE_INVESTIGATION_REPORT.md`
15. `docs/AUTH_LOGOUT_PUBLIC_HOME_PATCH_REPORT.md`
16. `docs/AUTH_RUNTIME_BASELINE_V1.md`
17. `docs/AUTH_SLICE_B_POST_LOGOUT_ROUTE_LOOP_PATCH_REPORT.md`
18. `docs/AUTH_SLICE_B_RUNTIME_OBSERVATION_GUIDE.md`
19. `docs/testing/customer-receipt-auth-regression.md`
20. `src/features/customerReceipt/__tests__/customerReceiptAuthRegression.test.js`
21. `src/features/customerReceipt/__tests__/customerReceiptRealAuthRace.test.js`
22. `src/features/customerReceipt/__tests__/authInvariantHelper.js`
23. `src/features/customerReceipt/__tests__/testFactories.js`
24. `e2e/customer-receipt-auth-regression.spec.js`

## Exact Excluded Files and Reasons

| File | Reason |
|---|---|
| `src/features/customerReceipt.zip` | Deletion requires human decision — pre-existing deletion, not part of auth baseline mission |
| `customer-receipt-auth-tests-frontend.diff` | Redundant patch artifact — changes already applied in working tree |

## Accidental Deletion Review

**`src/features/customerReceipt.zip`** — This file shows `D` (deleted) status in git. The deletion is pre-existing and was NOT performed as part of this mission. It is excluded from staging. No other deletions are present in the working tree.

**Conclusion:** No accidental deletion will be committed.

## Architecture Invariants

See `docs/AUTH_RUNTIME_BASELINE_V1.md` section 11 for full invariant definitions (AUTH-INV-001 through AUTH-INV-010).

## Runtime Evidence Summary

See `docs/AUTH_RUNTIME_BASELINE_V1.md` section 13 for full runtime evidence table.

## Verification Results

| Check | Result |
|---|---|
| Typecheck (`npm run typecheck`) | PASS |
| Build (`npm run build`) | PASS |
| Tests (`npm run test:run`) | PASS — 3 test files, 21 tests |
| Focused auth tests (`npm run test:auth-receipt`) | PASS — 15/15 |
| `git diff --check` | PASS (pre-existing CRLF warnings noted separately) |

## Staged Diff Review

PASS — All staged changes reviewed and verified. No unintended modifications present.

## Commit SHA

```
IMPLEMENTATION_BASELINE_COMMIT_SHA:
966e769f553c8cd9c8a94044df7079575e99123a
```

## Commit Message

```
feat(auth): establish verified authentication runtime baseline v1
```

## Post-Commit Working-Tree Status

DIRTY — intentionally excluded working-tree changes remain:

```
D src/features/customerReceipt.zip
?? customer-receipt-auth-tests-frontend.diff
```

- `src/features/customerReceipt.zip` — deleted in working tree only; deletion was NOT committed. No unexplained deletion was committed.
- `customer-receipt-auth-tests-frontend.diff` — untracked redundant patch artifact; changes already applied.

**Do not describe this state as CLEAN.**

## Files Still Intentionally Uncommitted

- `src/features/customerReceipt.zip` — deletion requires human decision
- `customer-receipt-auth-tests-frontend.diff` — redundant patch artifact

## API Contract Impact

**NO.** No API contracts were changed. All changes are frontend-only.

## Backend Impact

**NO.** No backend files were modified.

## Push Status

**NO.** No push will be performed.

## Remaining Risks

1. **customerReceipt.zip deletion** — The pre-existing deletion of `src/features/customerReceipt.zip` is not committed. This file will remain deleted in the working tree but not in the repository. A human decision is required.
2. **Pre-existing whitespace warnings** — `git diff --check` may report trailing whitespace warnings from pre-existing CRLF line endings. These are not introduced by this baseline.
3. **Non-auth observations** — Duplicate feature data fetches, StrictMode double-loading, bundle-size warnings, Browserslist warnings, and npm audit vulnerabilities are pre-existing and not related to authentication.
