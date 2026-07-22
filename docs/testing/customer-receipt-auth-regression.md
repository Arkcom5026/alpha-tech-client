# Customer Receipt Auth Regression Test Suite

## Bug Being Tested

The first Customer Receipt payment succeeds, but starting or completing the second payment may cause the authenticated user to be logged out.

**Hypothesis:** The root cause involves refresh-token rotation race conditions. When multiple protected requests are made in sequence (or concurrently), the refresh mechanism may:
- Clear the frontend authenticated user state
- Clear the frontend access token
- Redirect to login
- Invalidate the refresh token unexpectedly
- Produce an unrecoverable 401 response
- Trigger logout

## Test Architecture

Three layers of testing are implemented:

### Layer A — Frontend API/Auth Integration Test
- **Location:** `src/features/customerReceipt/__tests__/`
- **Framework:** Vitest
- **Files:**
  - `customerReceiptAuthRegression.test.js` — Main test scenarios
  - `authInvariantHelper.js` — Auth snapshot capture and invariant assertion
  - `testFactories.js` — Reusable payload builders

### Layer B — Backend Auth/Receipt Integration Test
- **Location:** `tests/`
- **Framework:** Standalone Node.js (can also run with Vitest)
- **Files:**
  - `customer-receipt-auth-regression.test.js` — Backend test scenarios

### Layer C — Browser Runtime E2E Test
- **Location:** `e2e/`
- **Framework:** Playwright (if available)
- **Files:**
  - `customer-receipt-auth-regression.spec.js` — E2E browser scenarios

## Files Created

| File | Layer | Purpose |
|------|-------|---------|
| `src/features/customerReceipt/__tests__/authInvariantHelper.js` | A | Auth snapshot capture, invariant assertion, mock stores |
| `src/features/customerReceipt/__tests__/testFactories.js` | A | Reusable test payloads and response factories |
| `src/features/customerReceipt/__tests__/customerReceiptAuthRegression.test.js` | A | Frontend integration test scenarios |
| `tests/customer-receipt-auth-regression.test.js` | B | Backend integration test scenarios |
| `docs/testing/customer-receipt-auth-regression.md` | Docs | This documentation |

## How to Run Each Layer

### Layer A — Frontend

```bash
# Run all frontend tests
cd d:\alpha-tech\client
npm test -- --run

# Run only auth receipt regression tests
npm run test:auth-receipt

# Watch mode
npm run test:auth-receipt:watch
```

### Layer B — Backend

```bash
# Run backend tests (standalone Node.js)
cd d:\alpha-tech\server
node tests/customer-receipt-auth-regression.test.js

# Or with vitest (if installed)
npx vitest run tests/customer-receipt-auth-regression.test.js
```

### Layer C — E2E

```bash
# Run E2E tests (requires Playwright)
cd d:\alpha-tech\client
npm run test:e2e:auth-receipt
```

## Required Environment Variables

### Frontend Tests
No environment variables required (uses mocks).

### Backend Tests
No environment variables required (uses mocks).

### E2E Tests

| Variable | Description |
|----------|-------------|
| `E2E_BASE_URL` | Base URL of the application (e.g., `http://localhost:5173`) |
| `E2E_TEST_USERNAME` | Test account username |
| `E2E_TEST_PASSWORD` | Test account password |

## Expected PASS Behavior

All tests in Layer A and Layer B should PASS when the auth system is working correctly:

1. Login returns a valid session with access token and refresh token
2. Customer Receipt #1 succeeds without clearing auth state
3. Customer Receipt #2 succeeds without clearing auth state
4. Subsequent GET requests succeed
5. Refresh token remains valid across operations
6. Sequential requests do not revoke the refresh token
7. Concurrent requests do not invalidate the session
8. Refresh token rotation is deterministic

## Expected Failure Signatures

When the bug is present, the following failures are expected:

### Layer A Failures
```
FAIL  Auth invariant failed at receipt #2
  isAuthenticated changed: true → false
  accessToken was cleared after operation
  logout was called: 0 → 1
```

### Layer B Failures
```
❌ Same session can immediately create Customer Receipt #2
  Auth invariant failed: isAuthenticated changed: true → false
```

### Layer C Failures
```
FAIL  Second receipt preserves auth state
  - redirected to login
  - login screen is visible
  - authenticated UI is not visible
```

## How to Collect Runtime Evidence

When a test fails, evidence is captured in the test output:

1. **Request sequence** — Each test logs the operation being performed
2. **Response status sequence** — HTTP status codes are logged
3. **Refresh attempt count** — `refreshAttemptCount` shows how many times refresh was called
4. **Logout invocation count** — `logoutInvocationCount` shows if logout was triggered
5. **Auth state before/after** — `captureAuthSnapshot()` captures safe auth metadata
6. **First exact event** — The test assertion that fails identifies the exact point of failure

### Evidence Output Example
```
[BUG EVIDENCE] Auth state not recovered after concurrent refresh scenario
[EVIDENCE] Refresh attempts: 2
[EXPECTED] Auth invariant failure after failed refresh:
  - isAuthenticated changed: true → false
  - accessToken was cleared after operation
  - logout was called: 0 → 1
```

## Known Limitations

1. **Layer A uses mocks** — Tests verify the auth invariant logic but do not exercise real API endpoints
2. **Layer B uses simulated JWT** — Tests verify token lifecycle but do not use the real Express app
3. **Layer C requires Playwright** — E2E tests depend on Playwright being installed and configured
4. **No real database** — All tests use in-memory mocks to avoid production data exposure
5. **Concurrent tests are sequential** — JavaScript single-threaded nature means true concurrency is simulated

## Why These Tests Must Remain After the Bug is Fixed

1. **Regression prevention** — Ensures the auth invariant is never broken by future changes
2. **Documentation** — Captures the exact failure mode for future reference
3. **Contract enforcement** — Proves that Customer Receipt operations must not affect auth state
4. **Safety net** — Protects against similar bugs in other payment/transaction workflows
5. **CI/CD integration** — Can be added to the pipeline to catch regressions automatically

## Test Scenarios Implemented

### Layer A (Frontend) — 12 scenarios
1. Auth invariant helper returns safe values
2. assertAuthInvariant passes when auth is preserved
3. assertAuthInvariant fails when isAuthenticated changes
4. assertAuthInvariant fails when logout is called
5. Successful receipt creation must not call logout
6. Successful receipt response must not clear access token
7. Two consecutive receipt creations preserve auth state
8. Normal receipt GET after POST must not clear auth state
9. Multiple receipt creations (5x) preserve auth state
10. Recoverable 401 + successful refresh retries the request
11. Failed refresh clears auth once with traceable evidence
12. Concurrent protected requests do not create destructive refresh flows

### Layer B (Backend) — 10 scenarios
1. Login returns a working authenticated session
2. Customer Receipt #1 succeeds
3. Same session creates Customer Receipt #2
4. Authenticated GET succeeds after both creations
5. Refresh token remains valid across operations
6. Sequential requests do not revoke refresh token
7. Concurrent requests do not invalidate session
8. Refresh token rotation is deterministic
9. Multiple receipt creations (5x) preserve auth state
10. Expired access token triggers refresh and preserves auth state

### Layer C (E2E) — Planned scenarios
1. Login and navigate to Customer Receipt workflow
2. Complete Customer Receipt #1 and assert auth state
3. Complete Customer Receipt #2 and assert auth state
4. Repeat for 5 receipts
5. Capture console errors and failed network requests
6. Fail immediately if redirected to login
