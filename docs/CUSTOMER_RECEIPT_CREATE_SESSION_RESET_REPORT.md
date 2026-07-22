# CUSTOMER RECEIPT CREATE SESSION RESET REPORT

**Issue ID:** CUSTOMER-RECEIPT-SESSION-001  
**Date:** 2026-07-23  
**Status:** RESOLVED

---

## Confirmed Root Cause

The Customer Receipt create flow persisted Zustand state across receipt sessions. After the first receipt was created and the user later opened the Create page again:

1. `selectedCustomer` still contained the first customer
2. `customerSearch` state/results still remained
3. `CustomerReceiptForm` copied stale `selectedCustomer.id` into local `form.customerId`
4. Clearing `selectedCustomer` did not clear `form.customerId` because the effect returned early when `selectedCustomer` was null

This caused the second receipt session to inherit state from the first customer.

---

## Previous Lifecycle

```
Open Create Page (1st time)
  → selectedCustomer = null (initial)
  → Search & Select Customer A
  → selectedCustomer = Customer A
  → form.customerId = Customer A.id
  → Submit → Success → Navigate to Detail

Return to Create Page (2nd time)
  → selectedCustomer = Customer A (STALE — never cleared)
  → customerSearchResults = [Customer A] (STALE)
  → form.customerId = Customer A.id (STALE — copied from stale selectedCustomer)
  → User sees Customer A pre-selected
  → User changes to Customer B
  → BUT form.customerId may still be Customer A.id if effect returns early
  → Submit → Payload contains Customer A.id (BUG)
```

---

## Corrected Lifecycle

```
Open Create Page (1st time)
  → resetCustomerReceiptCreateSessionAction()
  → selectedCustomer = null
  → customerSearch = DEFAULT
  → customerSearchResults = []
  → selectedItem = null
  → error = ''
  → successMessage = ''
  → Search & Select Customer A
  → selectedCustomer = Customer A
  → form.customerId = Customer A.id (via effect)
  → Submit → Success → Navigate to Detail

Return to Create Page (2nd time)
  → resetCustomerReceiptCreateSessionAction()
  → selectedCustomer = null (CLEARED)
  → customerSearchResults = [] (CLEARED)
  → selectedItem = null (CLEARED)
  → error = '' (CLEARED)
  → successMessage = '' (CLEARED)
  → form.customerId = '' (via effect — no early return)
  → Search & Select Customer B
  → selectedCustomer = Customer B
  → form.customerId = Customer B.id
  → Submit → Payload contains Customer B.id (CORRECT)
```

---

## Exact State Reset Boundary

The `resetCustomerReceiptCreateSessionAction` resets **only** create-session state:

| Field | Reset Value | Rationale |
|---|---|---|
| `selectedCustomer` | `null` | Belongs to create session |
| `customerSearch` | `{ mode: 'NAME', keyword: '' }` | Belongs to create session |
| `customerSearchResults` | `[]` | Belongs to create session |
| `customerSearchLoading` | `false` | Belongs to create session |
| `customerSearchError` | `''` | Belongs to create session |
| `selectedItem` | `null` | Belongs to create session (last created receipt) |
| `error` | `''` | Belongs to create session |
| `successMessage` | `''` | Belongs to create session |

**Preserved (not reset):**

| Field | Reason |
|---|---|
| `items` | Receipt list — belongs to list page |
| `pagination` | List pagination — belongs to list page |
| `filters` | List filters — belongs to list page |
| `loading` | List loading state |
| `printLoading` | Print functionality |
| `detailLoading` | Detail page loading |
| `candidatesLoading` | Allocation candidates |
| `allocationCandidates*` | Allocation state |
| `submitting` | Not forced — active requests not interrupted |

---

## Files Changed

| File | Change |
|---|---|
| `src/features/customerReceipt/store/customerReceiptStore.js` | Added `resetCustomerReceiptCreateSessionAction` |
| `src/features/customerReceipt/pages/CreateCustomerReceiptPage.jsx` | Uses `resetCustomerReceiptCreateSessionAction` on mount instead of partial cleanup |
| `src/features/customerReceipt/components/CustomerReceiptForm.jsx` | Fixed `useEffect` to clear `form.customerId` when `selectedCustomer` becomes null |
| `src/features/customerReceipt/__tests__/customerReceiptCreateSessionReset.test.js` | Added 8 regression tests |

---

## Tests Added

| Test ID | Description |
|---|---|
| TEST-001 | Create page begins with no stale selected customer |
| TEST-002 | After Customer A is selected, reset clears selectedCustomer and search results |
| TEST-003 | When selectedCustomer becomes null, form.customerId is cleared (store precondition) |
| TEST-004 | Changing from Customer A to Customer B produces Customer B ID in submit payload |
| TEST-005 | After first receipt success and new Create session, second receipt can be submitted |
| TEST-006 | The second payload never inherits Customer A ID |
| TEST-007 | Resetting Create session does not clear receipt list, filters, or pagination |
| TEST-008 | The patch does not modify or call Authentication state |

---

## Verification Results

```
npm run typecheck:  PASS (0 errors)
npm run build:      PASS (0 errors)
npm run test:run:   PASS (29/29 tests across 4 files)
npm run test:auth-receipt: PASS (15/15 tests)
git diff --check:   PASS (pre-existing CRLF whitespace only, no new issues)
```

---

## API Impact

**None.** No API contracts were changed. The `createCustomerReceiptAction` still sends the same payload structure. No new API endpoints were added.

---

## Backend Impact

**None.** No backend files were modified. No backend dependency was introduced.

---

## Auth Impact

**None.** The patch does not:
- Import or call any auth store
- Modify token state
- Call logout
- Clear authentication
- Reference `apiClient` or `authStore`

---

## Static Review Checklist

- [x] No feature-local reload workaround
- [x] No `window.location.reload()`
- [x] No auth logout
- [x] No token manipulation
- [x] No API contract change
- [x] No backend dependency
- [x] No broad Zustand store reset
- [x] No list-state regression

---

## Human Runtime Checklist

### R1: Create receipt for Customer A successfully
- [ ] Open Create page
- [ ] Search and select Customer A
- [ ] Enter valid payment data
- [ ] Submit successfully
- [ ] Verify navigation to detail page

### R2: From Detail/List, open Create again
- [ ] Navigate back to Create page
- [ ] **Expected:** No customer preselected
- [ ] **Expected:** No old search results
- [ ] **Expected:** Amount/reference/note are empty
- [ ] **Expected:** Date uses current default
- [ ] **Expected:** Submit cannot proceed without selecting a customer

### R3: Search and select Customer B
- [ ] Search Customer B
- [ ] Select Customer B
- [ ] **Expected:** UI shows Customer B
- [ ] **Expected:** Submit payload uses Customer B ID

### R4: Create Customer B receipt
- [ ] Submit
- [ ] **Expected:** POST /api/customer-receipts succeeds
- [ ] **Expected:** Detail page displays Customer B receipt
- [ ] **Expected:** No logout
- [ ] **Expected:** No blank page
- [ ] **Expected:** No Customer A data appears

### R5: Repeat once more with Customer C
- [ ] Navigate back to Create page
- [ ] Search and select Customer C
- [ ] Submit successfully
- [ ] **Expected:** Three independent receipt sessions
