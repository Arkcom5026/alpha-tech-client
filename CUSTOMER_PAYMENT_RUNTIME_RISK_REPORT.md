# CUSTOMER PAYMENT RUNTIME RISK REPORT
## Gap Analysis & Failure Mode Catalog — Customer Receipt E2E Flow

**Status:** DISCOVERY COMPLETE (Repository Investigation Only)
**Date:** 2026-07-23
**Scope:** Frontend repository only (`d:/alpha-tech/client`)

---

## RISK-001: Auth Logout After Receipt Operations (CRITICAL)

**Severity:** CRITICAL
**Likelihood:** HIGH
**Detection:** Auth regression tests (Layer A, B, C)

### Description
The first Customer Receipt payment succeeds, but starting or completing the second payment may cause the authenticated user to be logged out. This is the documented bug pattern being investigated.

### Root Cause Hypothesis
Refresh token rotation race condition. When multiple protected requests are made in sequence (or concurrently), the refresh mechanism may:
1. Create multiple concurrent refresh calls (not singleton)
2. First refresh succeeds, rotating the refresh token
3. Second refresh uses the now-stale (rotated) refresh token
4. Second refresh fails with 401
5. authStore clears token → triggers logout → redirects to /login

### Evidence
- `customerReceiptAuthRegression.test.js` — Tests document this exact failure pattern
- `customerReceiptRealAuthRace.test.js` — Tests real production modules with concurrent requests
- `customer-receipt-auth-regression.spec.js` — E2E Playwright tests capture redirect to login

### Impact
- User loses work in progress
- Receipt may be created but user never sees confirmation
- User must re-authenticate and verify receipt was created
- Potential duplicate receipts if user retries after re-login

### Mitigation
- Ensure `refreshPromise` is a singleton (one refresh at a time)
- All concurrent 401s must await the same refresh promise
- Refresh failure must not immediately logout if other requests are in-flight
- Add idempotency key to receipt creation to prevent duplicates on retry

---

## RISK-002: Duplicate Receipt Creation (HIGH)

**Severity:** HIGH
**Likelihood:** MEDIUM
**Detection:** Manual testing, no automated test

### Description
POST `/customer-receipts` has no idempotency mechanism. Multiple submits of the same payload can create multiple receipts.

### Trigger Scenarios
1. **Double-click submit** — User clicks "บันทึก" twice rapidly
2. **Network timeout + retry** — apiClient retries after timeout, but first request succeeded
3. **Browser back + resubmit** — User navigates back and resubmits the form
4. **Concurrent tab submits** — Two tabs submit the same receipt form

### Impact
- Duplicate financial records
- Customer balance incorrectly increased
- Reconciliation issues
- Manual cleanup required

### Mitigation
- Frontend: Disable submit button immediately on click (already partially implemented)
- Backend: Implement idempotency key (Idempotency-Key header)
- Backend: Unique constraint on (code, branchId) or similar business key
- Backend: Deduplication check before insert

---

## RISK-003: Allocation Race Condition (HIGH)

**Severity:** HIGH
**Likelihood:** MEDIUM
**Detection:** Manual concurrent testing

### Description
Two employees could allocate the same receipt or the same sale invoice simultaneously, leading to double-allocation or over-payment.

### Scenarios
1. **Same receipt, two employees** — Both allocate simultaneously, both see remainingAmount > 0
2. **Same sale, two receipts** — Two receipts allocate to the same outstanding invoice
3. **Stale outstanding snapshot** — Outstanding invoices loaded at page mount differ from state at allocation time

### Impact
- Receipt allocated beyond totalAmount (negative remainingAmount)
- Sale over-paid (paidAmount > totalAmount)
- Customer balance incorrect
- Financial data integrity violation

### Mitigation
- Backend: Use `SELECT ... FOR UPDATE` within transaction (row-level locking)
- Backend: Validate outstanding balances at allocation time (not at load time)
- Backend: Check `remainingAmount` and `sale.outstandingBalance` inside transaction
- Backend: Return 409 Conflict if data changed since load

---

## RISK-004: Stale Outstanding Snapshot (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** HIGH
**Detection:** Manual testing

### Description
Outstanding invoices are loaded when the customer is selected. If the user takes time to fill the form, the outstanding balances may have changed (another receipt allocated, sale paid, etc.).

### Impact
- Allocation may fail with 409/422
- User sees stale data and must refresh
- Poor user experience

### Mitigation
- Add "refresh outstanding" button on allocate page
- Auto-refresh outstanding when page gains focus
- Backend validates at transaction time (not request time)
- Show "ข้อมูลอาจไม่เป็นปัจจุบัน" warning if data is older than N seconds

---

## RISK-005: Cross-Branch Receipt Creation (HIGH)

**Severity:** HIGH
**Likelihood:** LOW
**Detection:** Manual testing

### Description
Frontend sends `branchId` from `branchStore`. If backend does not verify that the authenticated employee belongs to the specified branch, an employee could create receipts for other branches.

### Impact
- Financial records attributed to wrong branch
- Branch-level reporting incorrect
- Audit trail compromised

### Mitigation
- Backend: Extract `branchId` from employee's JWT token, not from request body
- Backend: Validate `branchId` in request matches employee's branch
- Backend: Return 403 if branch mismatch

---

## RISK-006: Receipt Number Collision (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** LOW
**Detection:** Manual testing

### Description
If receipt code/number is generated in the application layer (not database sequence), concurrent receipt creation could generate duplicate codes.

### Impact
- Unique constraint violation (if enforced)
- Duplicate codes in system (if not enforced)
- Receipt lookup ambiguity

### Mitigation
- Use database sequence for receipt number generation
- Add unique constraint on `code` column
- If application-layer generation, use UUID or timestamp-based unique generation

---

## RISK-007: Concurrent Refresh Token Rotation (CRITICAL)

**Severity:** CRITICAL
**Likelihood:** MEDIUM
**Detection:** `customerReceiptRealAuthRace.test.js`

### Description
When multiple API requests expire simultaneously (e.g., two receipt POSTs), the apiClient response interceptor catches multiple 401s. If the refresh mechanism is not a singleton, multiple refresh calls are made concurrently.

### Detailed Failure Path
1. Request #1 → 401 → apiClient creates refreshPromise #1
2. Request #2 → 401 → apiClient creates refreshPromise #2 (NOT singleton)
3. Refresh #1 succeeds → new access token + rotated refresh token
4. Refresh #2 uses old refresh token → 401 (revoked)
5. Refresh #2 failure → authStore clears token → logout → redirect /login

### Impact
- User logged out during normal operation
- Receipt may be created but confirmation lost
- User must re-authenticate
- Potential duplicate receipts on retry

### Mitigation
- **CRITICAL FIX:** Ensure `refreshPromise` is a singleton stored outside the interceptor
- All concurrent 401s must check if a refresh is already in-flight and await the same promise
- Consider using a mutex/lock pattern for refresh coordination

---

## RISK-008: Network Timeout During POST (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** MEDIUM
**Detection:** Manual testing

### Description
If the POST `/customer-receipts` request times out, the frontend shows an error. However, the receipt may have been created on the server. The user may retry, creating a duplicate.

### Impact
- Duplicate receipts
- User confusion (error shown but receipt exists)
- Customer may be charged twice

### Mitigation
- Implement idempotency key on POST endpoint
- Add "check status" mechanism after timeout (GET to verify if receipt was created)
- Show "กำลังตรวจสอบ..." instead of immediate error on timeout

---

## RISK-009: Missing Frontend Validation (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** MEDIUM
**Detection:** Code review

### Description
Frontend validation may be incomplete or inconsistent with backend validation rules.

### Potential Gaps
1. **Amount validation** — No check that `totalAmount` doesn't exceed customer's total outstanding
2. **Date validation** — No check that `receivedAt` is not in the future
3. **Payment method validation** — May not validate against allowed methods for the branch
4. **Customer validation** — May not validate that customer is active (not deleted/suspended)

### Impact
- Backend returns 422 errors
- Poor user experience
- User must correct and resubmit

### Mitigation
- Mirror backend validation rules in frontend
- Add comprehensive field-level validation
- Show validation errors inline before submit

---

## RISK-010: No Optimistic Locking (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** LOW
**Detection:** Code review

### Description
Receipt and sale records have no version column for optimistic locking. If two requests update the same record concurrently, the last write wins without conflict detection.

### Impact
- Lost updates
- Data integrity violations
- Silent data corruption

### Mitigation
- Add `version` column to `customer_receipts` and `sales` tables
- Use optimistic locking in repository layer
- Return 409 Conflict on version mismatch

---

## RISK-011: Browser Navigation Hazards (LOW)

**Severity:** LOW
**Likelihood:** MEDIUM
**Detection:** Manual testing

### Description
Browser navigation during receipt creation can cause unexpected behavior.

### Scenarios
1. **Browser refresh during submit** — Receipt may be created but UI resets to empty form
2. **Browser back after create** — May show "Confirm Form Resubmission" dialog
3. **Browser close during submit** — Receipt created but user never sees result
4. **Tab switch during submit** — User may forget about pending submission

### Impact
- Duplicate receipts (on resubmission)
- Lost confirmation
- User confusion

### Mitigation
- Use `beforeunload` event to warn user about unsaved work
- Store form state in session storage for recovery
- Add "check pending receipt" on page load

---

## RISK-012: Permission/Access Control Gaps (HIGH)

**Severity:** HIGH
**Likelihood:** LOW
**Detection:** Manual testing

### Description
Frontend may not enforce granular permissions for receipt operations.

### Potential Gaps
1. **View receipts** — Any authenticated employee can view all receipts
2. **Create receipts** — Any employee with finance access can create
3. **Allocate receipts** — Any employee can allocate any receipt
4. **Cancel receipts** — Any employee can cancel any receipt
5. **Print receipts** — Any employee can print any receipt

### Impact
- Unauthorized access to financial records
- Unauthorized financial operations
- Audit trail compromised

### Mitigation
- Implement role-based access control (RBAC) for receipt operations
- Backend: Check permissions on every endpoint
- Frontend: Hide/show actions based on user role

---

## RISK-013: Data Projection Inconsistency (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** MEDIUM
**Detection:** Manual verification

### Description
After receipt creation or allocation, multiple projections must be updated atomically. If any projection update fails, data becomes inconsistent.

### Projections at Risk
1. Customer balance
2. Accounts receivable summary
3. Daily closing summary
4. Dashboard metrics
5. Branch-level financial summaries

### Impact
- Reports show incorrect data
- Customer credit limit wrong
- Daily closing totals incorrect

### Mitigation
- Use database transactions for all projection updates
- Implement eventual consistency with retry mechanism
- Add reconciliation job to detect and fix inconsistencies
- Log all projection updates for audit

---

## RISK-014: No Receipt Cancellation Flow (LOW)

**Severity:** LOW
**Likelihood:** LOW
**Detection:** Code review

### Description
The frontend shows a "CANCELLED" status and a red badge, but no cancellation UI/flow was detected in the codebase. It's unclear how receipts are cancelled.

### Impact
- Receipts stuck in ACTIVE state cannot be corrected
- No way to void incorrect receipts

### Mitigation
- Implement cancellation flow (if not already present in backend)
- Add "ยกเลิก" button for ACTIVE receipts
- Implement cancellation with reversal of allocations

---

## RISK-015: E2E Test Coverage Gaps (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** HIGH
**Detection:** Test suite review

### Description
Current test coverage focuses on auth regression. Full E2E flow tests are missing.

### Missing Tests
1. Full happy path: login → create receipt → verify list → detail → print
2. Allocation flow: create receipt → allocate → verify sale status
3. Filter + pagination: apply filters → verify results → paginate
4. Error handling: network error → retry → success
5. Concurrent operations: two receipts, two allocations
6. Permission tests: unauthorized user → 403
7. Branch isolation: cross-branch receipt → 403

### Impact
- Regressions may go undetected
- Auth fix may break other receipt functionality
- No confidence in E2E flow

### Mitigation
- Add comprehensive E2E tests covering all flows
- Add integration tests for store + API interactions
- Add visual regression tests for UI components

---

## RISK-016: Store State Management Gaps (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** MEDIUM
**Detection:** Code review

### Description
The `customerReceiptStore` may have gaps in state management that affect reliability.

### Potential Gaps
1. **No error state persistence** — Error state may be lost on re-render
2. **No loading state timeout** — Loading state may hang indefinitely on network failure
3. **No stale data detection** — Data may be stale but not refreshed
4. **No optimistic updates** — No immediate UI feedback on create/allocate
5. **No rollback on error** — If create succeeds but store update fails, UI is inconsistent

### Impact
- UI shows incorrect state
- User may act on stale data
- Poor error recovery

### Mitigation
- Add error state to store with clear/reset mechanism
- Add loading timeout (e.g., 30 seconds → show error)
- Add data freshness timestamp
- Implement optimistic updates with rollback

---

## RISK-017: apiClient Coupling (MEDIUM)

**Severity:** MEDIUM
**Likelihood:** LOW
**Detection:** Code review

### Description
`apiClient` is a global singleton with tight coupling to `authStore`. Any change to either affects the entire system.

### Coupling Points
1. `apiClient` reads `authStore.getState()` directly
2. `apiClient` updates `authStore` after refresh
3. `apiClient` interceptor logic depends on authStore shape
4. All feature APIs import `apiClient` directly

### Impact
- Changes to authStore require apiClient changes
- Changes to apiClient affect all features
- Testing requires mocking both apiClient and authStore

### Mitigation
- Consider dependency injection for apiClient
- Define clear interface between apiClient and authStore
- Add integration tests for apiClient + authStore interaction

---

## Risk Summary Matrix

```
ID    Risk Name                          Severity    Likelihood   Priority
───   ─────────                          ────────    ──────────   ────────
001   Auth logout after receipt ops      CRITICAL    HIGH         P0
007   Concurrent refresh token rotation  CRITICAL    MEDIUM       P0
002   Duplicate receipt creation         HIGH        MEDIUM       P1
003   Allocation race condition          HIGH        MEDIUM       P1
005   Cross-branch receipt creation      HIGH        LOW          P1
012   Permission/access control gaps     HIGH        LOW          P1
004   Stale outstanding snapshot         MEDIUM      HIGH         P2
008   Network timeout during POST        MEDIUM      MEDIUM       P2
009   Missing frontend validation        MEDIUM      MEDIUM       P2
010   No optimistic locking              MEDIUM      LOW          P2
013   Data projection inconsistency      MEDIUM      MEDIUM       P2
015   E2E test coverage gaps             MEDIUM      HIGH         P2
016   Store state management gaps        MEDIUM      MEDIUM       P2
017   apiClient coupling                 MEDIUM      LOW          P3
006   Receipt number collision           MEDIUM      LOW          P3
011   Browser navigation hazards         LOW         MEDIUM       P3
014   No receipt cancellation flow       LOW         LOW          P3
```

**Priority Definitions:**
- **P0:** Must fix before production — active bug pattern
- **P1:** Should fix before production — data integrity risk
- **P2:** Fix after P0/P1 — operational reliability
- **P3:** Nice to have — edge cases

---

## Recommended Fix Order

### Phase 1 (P0 — Auth Integrity)
1. Fix `refreshPromise` singleton pattern in apiClient
2. Add auth invariant tests to CI/CD pipeline
3. Verify concurrent refresh coordination

### Phase 2 (P1 — Data Integrity)
4. Implement idempotency key on POST /customer-receipts
5. Add row-level locking (SELECT FOR UPDATE) in allocation transaction
6. Implement branch authority check on backend
7. Add RBAC for receipt operations

### Phase 3 (P2 — Operational Reliability)
8. Add outstanding snapshot refresh mechanism
9. Add frontend validation improvements
10. Add optimistic locking with version column
11. Add comprehensive E2E tests
12. Improve store state management

### Phase 4 (P3 — Edge Cases)
13. Add receipt cancellation flow
14. Add browser navigation guards
15. Add receipt number collision prevention
16. Decouple apiClient from authStore

---

*End of Customer Payment Runtime Risk Report*
