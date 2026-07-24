# CUSTOMER PAYMENT RUNTIME DISCOVERY
## Customer Receipt E2E Flow — Architecture Blueprint

**Status:** DISCOVERY COMPLETE (Repository Investigation Only)
**Date:** 2026-07-23
**Scope:** Frontend repository only (`d:/alpha-tech/client`)
**Route:** `/pos/finance/customer-receipts/create`

---

## PART A — Frontend Runtime

### A1. Component Tree

```
App.jsx
 └── AppRouter (src/routes/)
      └── ProtectedRoute (auth guard)
           └── POSLayout (src/layouts/)
                └── CustomerReceiptCreatePage (src/features/customerReceipt/pages/)
                     ├── CustomerReceiptSearchFilters
                     ├── CustomerReceiptSummaryCards
                     ├── CustomerReceiptTable
                     │    ├── TableLoadingRows
                     │    ├── EmptyState
                     │    └── PaginationControls
                     └── [Create Receipt Form] (inline in page)
```

### A2. Route Configuration

| Route | Component | Auth | Layout |
|-------|-----------|------|--------|
| `/pos/finance/customer-receipts` | CustomerReceiptListPage | ProtectedRoute | POSLayout |
| `/pos/finance/customer-receipts/create` | CustomerReceiptCreatePage | ProtectedRoute | POSLayout |
| `/pos/finance/customer-receipts/:id` | CustomerReceiptDetailPage | ProtectedRoute | POSLayout |
| `/pos/finance/customer-receipts/:id/allocate` | CustomerReceiptAllocatePage | ProtectedRoute | POSLayout |
| `/pos/finance/customer-receipts/:id/print` | CustomerReceiptPrintPage | ProtectedRoute | POSLayout |

### A3. Store Architecture

**Primary Store:** `customerReceiptStore` (Zustand)
- State: `items`, `pagination`, `filters`, `summary`, `loading`, `error`, `currentReceipt`
- Actions: `fetchReceipts`, `fetchReceiptById`, `createReceipt`, `updateFilters`, `resetFilters`

**Dependent Stores:**
- `authStore` — Token, session, authentication state
- `branchStore` — Branch context for receipt creation
- `gateStore` — Simple boolean gate (`isGatePassed`)

### A4. Hooks

| Hook | Purpose | Used By |
|------|---------|---------|
| `useCustomerReceipts` | Fetch paginated receipt list | List page |
| `useCustomerReceiptCreate` | Create receipt mutation | Create page |
| `useCustomerReceiptDetail` | Fetch single receipt | Detail page |
| `useCustomerReceiptAllocate` | Allocate payment | Allocate page |
| `useCustomerReceiptPrint` | Print receipt | Print page |

### A5. API Calls (Frontend)

| Call | Method | Endpoint | Trigger |
|------|--------|----------|---------|
| Fetch receipts | GET | `/customer-receipts?page=&limit=&filters...` | Page load, filter change, pagination |
| Fetch receipt by ID | GET | `/customer-receipts/:id` | Detail page mount |
| Create receipt | POST | `/customer-receipts` | Form submit |
| Allocate receipt | POST | `/customer-receipts/:id/allocate` | Allocate submit |
| Print receipt | GET | `/customer-receipts/:id/print` | Print action |
| Fetch customers | GET | `/customers/by-phone/:phone` | Customer search |
| Fetch customers by name | GET | `/customers/by-name?q=keyword` | Customer search |
| Fetch outstanding invoices | GET | `/sales?customerId=&status=outstanding` | After customer selection |

### A6. Loading States

| Stage | Loading Indicator | Source |
|-------|-------------------|--------|
| Page bootstrap | Skeleton/Spinner | `customerReceiptStore.loading` |
| Receipt list | `TableLoadingRows` (5 skeleton rows) | `CustomerReceiptTable.loading` |
| Summary cards | Pulse animation on cards | `CustomerReceiptSummaryCards.loading` |
| Search | Button text "กำลังค้นหา..." | `CustomerReceiptSearchFilters.loading` |
| Create receipt | Button disabled + spinner | Inline form state |
| Pagination | Button disabled | `PaginationControls.loading` |

### A7. Error States

| Error | UI Handling | Recovery |
|-------|-------------|----------|
| API 401 | apiClient interceptor → refresh → retry | Automatic (if refresh succeeds) |
| API 401 (refresh fails) | authStore → logout → redirect /login | Manual re-login |
| API 4xx/5xx | Error toast/notification | User retry |
| Network failure | Error toast | User retry |
| Validation error | Inline field errors | User correction |

### A8. Auth Integration

- **apiClient** (`src/utils/apiClient.js`) is the transport layer
- Reads token from `authStore.getState()` on every request
- Attaches `Authorization: Bearer <token>` header
- Response interceptor catches 401 → queues refresh → retries original request
- Refresh uses direct axios call (bypasses interceptor to avoid loops)
- On refresh failure: clears auth state → triggers logout → redirects to `/login`

---

## PART B — API Contract

### B1. Customer Receipt Endpoints

#### `GET /customer-receipts`
- **HTTP:** GET
- **Purpose:** List/search paginated customer receipts
- **Request Query:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `keyword` (string, optional)
  - `status` (enum: ACTIVE|FULLY_ALLOCATED|CANCELLED, optional)
  - `customerId` (number, optional)
  - `paymentMethod` (enum: CASH|BANK_TRANSFER|QR_CODE|CREDIT_CARD|DEBIT_CARD|OTHER, optional)
  - `fromDate` (ISO date, optional)
  - `toDate` (ISO date, optional)
- **Response:**
  ```json
  {
    "data": [{
      "id": 1,
      "code": "CR-2026-0001",
      "referenceNo": "REF-001",
      "receivedAt": "2026-07-23T00:00:00.000Z",
      "totalAmount": 1000.00,
      "allocatedAmount": 500.00,
      "remainingAmount": 500.00,
      "paymentMethod": "CASH",
      "status": "ACTIVE",
      "customer": {
        "id": 1,
        "companyName": "บริษัท ABC",
        "name": "John Doe",
        "firstName": "John",
        "lastName": "Doe",
        "taxId": "1234567890123",
        "phone": "0812345678"
      },
      "branchId": 1,
      "createdByEmployeeProfileId": 1
    }],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "summary": {
      "totalReceipts": 50,
      "totalAmount": 50000.00,
      "totalAllocated": 30000.00,
      "totalRemaining": 20000.00,
      "activeCount": 30,
      "fullyAllocatedCount": 15,
      "cancelledCount": 5
    }
  }
  ```
- **Ordering Dependency:** None (standalone list)
- **Retry Behaviour:** Standard apiClient 401 → refresh → retry

#### `GET /customer-receipts/:id`
- **HTTP:** GET
- **Purpose:** Fetch single receipt detail
- **Response:** Single receipt object (same shape as list item)
- **Ordering Dependency:** Receipt must exist (created first)
- **Retry Behaviour:** Standard

#### `POST /customer-receipts`
- **HTTP:** POST
- **Purpose:** Create a new customer receipt
- **Request Body:**
  ```json
  {
    "customerId": 1,
    "totalAmount": 1000.00,
    "paymentMethod": "CASH",
    "receivedAt": "2026-07-23T00:00:00.000Z",
    "note": "Optional note",
    "branchId": 1
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "สร้างรายการรับชำระเรียบร้อยแล้ว",
    "data": {
      "id": 1,
      "code": "CR-2026-0001",
      "totalAmount": 1000.00,
      "allocatedAmount": 0,
      "remainingAmount": 1000.00,
      "paymentMethod": "CASH",
      "status": "ACTIVE",
      "customerId": 1,
      "branchId": 1,
      "createdByEmployeeProfileId": 1
    }
  }
  ```
- **Ordering Dependency:** Customer must exist; branch context required
- **Retry Behaviour:** Standard; **RISK:** Duplicate submit could create duplicate receipts

#### `POST /customer-receipts/:id/allocate`
- **HTTP:** POST
- **Purpose:** Allocate receipt amount to outstanding invoices
- **Request Body:**
  ```json
  {
    "allocations": [
      { "saleId": 1, "amount": 500.00 },
      { "saleId": 2, "amount": 500.00 }
    ]
  }
  ```
- **Response:** Updated receipt with allocation details
- **Ordering Dependency:** Receipt must exist and be ACTIVE; sales must be outstanding
- **Retry Behaviour:** Standard; **RISK:** Duplicate allocation could double-allocate

#### `GET /customer-receipts/:id/print`
- **HTTP:** GET
- **Purpose:** Get printable receipt format
- **Response:** HTML or PDF content
- **Ordering Dependency:** Receipt must exist
- **Retry Behaviour:** Standard

### B2. Supporting Endpoints

#### `GET /customers/by-phone/:phone`
- **HTTP:** GET
- **Purpose:** Lookup customer by phone number
- **Response:** Customer object

#### `GET /customers/by-name?q=keyword`
- **HTTP:** GET
- **Purpose:** Search customers by name
- **Response:** Array of customer objects

#### `GET /sales?customerId=&status=outstanding`
- **HTTP:** GET
- **Purpose:** Fetch outstanding invoices for a customer
- **Response:** Array of sale objects with outstanding balances

---

## PART C — Backend Runtime (Inferred from Frontend)

### C1. Controller Layer (Inferred)

```
CustomerReceiptController
├── index()       → GET /customer-receipts
├── show()        → GET /customer-receipts/:id
├── store()       → POST /customer-receipts
├── allocate()    → POST /customer-receipts/:id/allocate
└── print()       → GET /customer-receipts/:id/print
```

### C2. Service Layer (Inferred)

```
CustomerReceiptService
├── list(filters, pagination)
├── findById(id)
├── create(payload)
│   ├── validateCustomer(customerId)
│   ├── validateBranch(branchId)
│   ├── generateReceiptNumber()
│   ├── calculateAllocation()
│   └── persist()
├── allocate(receiptId, allocations)
│   ├── validateReceipt(receiptId)
│   ├── validateAllocations(allocations)
│   ├── validateOutstandingInvoices(saleIds)
│   ├── transactionBoundary()
│   │   ├── updateReceiptAllocation()
│   │   ├── updateSalePaymentStatus()
│   │   └── updateCustomerBalance()
│   └── commit()
└── generatePrint(receiptId)
```

### C3. Domain Model (Inferred)

```
CustomerReceipt
├── id: number
├── code: string (generated, unique)
├── referenceNo: string (optional)
├── receivedAt: datetime
├── totalAmount: decimal
├── allocatedAmount: decimal
├── remainingAmount: decimal
├── paymentMethod: enum
├── status: enum (ACTIVE|FULLY_ALLOCATED|CANCELLED)
├── customerId: number (FK → customers)
├── branchId: number (FK → branches)
├── createdByEmployeeProfileId: number (FK → employee_profiles)
├── allocations: CustomerReceiptAllocation[]
└── timestamps: created_at, updated_at

CustomerReceiptAllocation
├── id: number
├── receiptId: number (FK → customer_receipts)
├── saleId: number (FK → sales)
├── amount: decimal
└── timestamps
```

### C4. Validation Rules (Inferred)

| Field | Rule |
|-------|------|
| customerId | Must reference existing customer |
| branchId | Must reference existing branch |
| totalAmount | Must be > 0 |
| paymentMethod | Must be valid enum value |
| receivedAt | Must be valid datetime |
| allocations sum | Must equal totalAmount (for full allocation) |
| saleId in allocation | Must reference existing, outstanding sale |
| allocation amount | Must not exceed sale outstanding balance |

### C5. Transaction Boundary (Inferred)

The `allocate` operation requires a database transaction:
1. Lock receipt row
2. Lock sale rows (prevent concurrent allocation)
3. Update receipt.allocatedAmount and receipt.remainingAmount
4. Update sale.paidAmount and sale.status
5. Update customer.balance
6. Insert allocation records
7. Commit

### C6. Projection Updates (Inferred)

After receipt creation/allocation:
- Customer balance projection updated
- Accounts receivable projection updated
- Daily closing summary updated
- Dashboard metrics updated

---

## PART D — Business State Machine

### D1. Receipt Lifecycle

```
DRAFT (form state, not persisted)
  │
  ▼
CUSTOMER_SELECTED (customer identified)
  │
  ▼
OUTSTANDING_LOADED (invoices fetched)
  │
  ▼
PAYMENT_READY (amount + method entered)
  │
  ▼
PAYMENT_SUBMITTED (POST /customer-receipts)
  │
  ▼
RECEIPT_CREATED (response received, status=ACTIVE)
  │
  ├──► ALLOCATION_PENDING (remainingAmount > 0)
  │       │
  │       ▼
  │    ALLOCATION_SUBMITTED (POST /allocate)
  │       │
  │       ▼
  │    ALLOCATION_COMPLETED (remainingAmount = 0, status=FULLY_ALLOCATED)
  │
  ├──► FULLY_ALLOCATED (if allocated immediately)
  │
  └──► CANCELLED (manual cancellation)
```

### D2. Frontend State Machine

```
IDLE (page loaded, no data)
  │
  ▼
LOADING (fetching receipts)
  │
  ├──► SUCCESS (data loaded)
  │       │
  │       ├──► FILTERING (user changes filters)
  │       │       │
  │       │       ▼
  │       │    LOADING → SUCCESS
  │       │
  │       ├──► PAGINATING (page change)
  │       │       │
  │       │       ▼
  │       │    LOADING → SUCCESS
  │       │
  │       └──► CREATING (form submit)
  │               │
  │               ▼
  │            SUBMITTING → SUCCESS/ERROR
  │
  └──► ERROR (API failure)
        │
        └──► RETRY → LOADING
```

---

## PART E — Authority Mapping

| Stage | Frontend Authority | Backend Authority | Database Authority |
|-------|-------------------|-------------------|-------------------|
| Customer selection | `customerReceiptStore.selectedCustomer` | Customer exists check | `customers` table |
| Outstanding invoices | `customerReceiptStore.outstandingInvoices` | Sales query by customerId + status | `sales` table |
| Payment amount | Form state (local) | Validation | N/A |
| Receipt creation | `customerReceiptStore.createReceipt` | `CustomerReceiptService.create()` | `customer_receipts` INSERT |
| Receipt number | N/A (generated by backend) | `generateReceiptNumber()` | Sequence/auto-increment |
| Allocation | `customerReceiptStore.allocateReceipt` | `CustomerReceiptService.allocate()` | `customer_receipt_allocations` INSERT |
| Customer balance | Display only | `updateCustomerBalance()` | `customers.balance` UPDATE |
| Auth state | `authStore` | JWT verification | `sessions` / `refresh_tokens` |
| Branch context | `branchStore` | Branch validation | `branches` table |

---

## PART F — Runtime Invariants

### F1. Auth Invariants

1. **Token must not be cleared** by any Customer Receipt API operation
2. **Logout must not be called** as a side effect of receipt creation
3. **Refresh token rotation** must be deterministic (one refresh per 401 batch)
4. **Concurrent requests** must coordinate refresh (singleton pattern)
5. **Auth state** must survive page navigation within the POS

### F2. Business Invariants

6. **Only one active submit** — Form must prevent double-submit
7. **Allocation total equals payment amount** — Sum of allocations must not exceed receipt totalAmount
8. **Customer must exist** — customerId must reference valid customer
9. **Outstanding snapshot consistency** — Outstanding invoices loaded at selection time must match at allocation time
10. **Receipt number generated once** — Receipt code must be unique and generated exactly once
11. **Session identity preserved** — createdByEmployeeProfileId must match authenticated employee
12. **Branch authority preserved** — receipt branchId must match employee's branch

### F3. Data Invariants

13. **remainingAmount = totalAmount - allocatedAmount** — Must hold at all times
14. **status transitions** — ACTIVE → FULLY_ALLOCATED or CANCELLED (no reverse)
15. **Allocation amount per sale** — Must not exceed sale's outstanding balance
16. **Receipt cannot be allocated beyond totalAmount** — remainingAmount must never be negative

---

## PART G — Failure Modes

### G1. Validation Failures

| Failure | Trigger | Impact |
|---------|---------|--------|
| Missing customerId | Form submit without customer | 422 error |
| Invalid paymentMethod | Unknown enum value | 422 error |
| Negative amount | totalAmount < 0 | 422 error |
| Missing branchId | No branch context | 422 error |
| Invalid date format | receivedAt malformed | 422 error |

### G2. Business Failures

| Failure | Trigger | Impact |
|---------|---------|--------|
| Customer not found | Deleted customer referenced | 404 error |
| Branch mismatch | Employee branch ≠ receipt branch | 403 error |
| Receipt not found | Invalid ID in detail/allocate | 404 error |
| Receipt already allocated | Double allocation attempt | 409 error |
| Sale already paid | Allocation to paid invoice | 409 error |
| Insufficient sale balance | Allocation > outstanding | 422 error |

### G3. Concurrency Failures

| Failure | Trigger | Impact |
|---------|---------|--------|
| Race condition on allocation | Two users allocate same receipt | Double allocation |
| Race condition on sale payment | Two receipts allocate same sale | Over-payment |
| Stale outstanding snapshot | Outstanding changed between load and allocate | Allocation mismatch |
| Concurrent receipt creation | Double submit | Duplicate receipts |

### G4. Duplicate Submit

| Failure | Trigger | Impact |
|---------|---------|--------|
| Double-click submit | User clicks submit twice rapidly | Two receipts created |
| Network retry | apiClient retries after timeout | Duplicate POST |
| Browser back + resubmit | User navigates back and resubmits | Duplicate receipt |
| No idempotency key | Backend has no deduplication | Duplicate records |

### G5. Refresh Timing Failures

| Failure | Trigger | Impact |
|---------|---------|--------|
| Multiple concurrent 401s | Two requests expire simultaneously | Multiple refresh calls |
| Refresh race condition | Second refresh uses stale refresh token | Token revoked |
| Refresh during receipt POST | 401 on create triggers refresh mid-write | Lost receipt |
| Refresh failure after receipt | 401 on response, refresh fails, logout | User logged out after success |

### G6. Allocation Mismatch

| Failure | Trigger | Impact |
|---------|---------|--------|
| Partial allocation inconsistency | Allocations sum ≠ totalAmount | Data integrity violation |
| Sale status not updated | Allocation succeeds but sale not marked paid | Accounts receivable mismatch |
| Customer balance not updated | Allocation succeeds but balance stale | Customer credit wrong |

### G7. Receipt Duplication

| Failure | Trigger | Impact |
|---------|---------|--------|
| No unique constraint on (code) | Receipt code collision | Duplicate codes |
| No idempotency on POST | Same payload submitted twice | Two receipts |
| Receipt number sequence reset | Database sequence reset | Code collision |

### G8. Permission Failures

| Failure | Trigger | Impact |
|---------|---------|--------|
| Unauthorized employee | Employee without finance permission | 403 error |
| Cross-branch access | Employee creates receipt for other branch | 403 error |
| Expired session | Token expired during form fill | 401 → refresh → possible logout |

---

## PART H — Gap Analysis

### H1. Missing Verification

1. **No idempotency key** — POST `/customer-receipts` has no idempotency mechanism. Duplicate submits are not prevented at the API level.
2. **No optimistic locking** — Allocation has no version check on receipt or sale rows. Stale data can overwrite.
3. **No outstanding snapshot validation** — Outstanding invoices loaded at customer selection may differ from state at allocation time.
4. **No allocation total enforcement at API level** — Frontend may validate, but backend must enforce sum(allocations) ≤ totalAmount.
5. **No receipt number uniqueness guarantee** — If code is generated in application layer (not DB sequence), collision is possible.

### H2. Potential Race Conditions

1. **Concurrent allocation of same receipt** — Two employees could allocate the same receipt simultaneously.
2. **Concurrent allocation to same sale** — Two receipts could allocate to the same sale invoice simultaneously.
3. **Refresh token rotation race** — Multiple concurrent 401s could trigger multiple refresh calls, potentially revoking the first refresh token.
4. **Receipt creation + allocation race** — User creates receipt, then immediately allocates. If allocation arrives before creation commits, 404 error.

### H3. Potential Duplicate Loading

1. **Receipt list loaded twice on mount** — If `useEffect` dependencies include both `filters` and `page`, initial load may fire twice.
2. **Customer search fires on every keystroke** — No debounce on customer search input.
3. **Summary cards reload on every filter change** — Summary endpoint called on every filter/pagination change, not just initial load.

### H4. Potential Authority Split

1. **customerId authority** — Frontend selects customer, backend validates existence. No authority check that employee has access to this customer.
2. **branchId authority** — Frontend sends branchId from branchStore. Backend must verify employee belongs to this branch.
3. **createdByEmployeeProfileId** — Must come from authenticated token, not from request body. Risk if frontend sends it in payload.

### H5. Potential Hidden Coupling

1. **apiClient ↔ authStore** — Tight coupling via `getState()`. Any change to authStore shape breaks apiClient.
2. **customerReceiptStore ↔ authStore** — Receipt operations depend on auth state for token. Auth logout during receipt flow breaks the page.
3. **customerReceiptStore ↔ branchStore** — Receipt creation depends on branchStore for branchId. If branchStore is stale, wrong branch is used.
4. **Receipt list ↔ customer API** — Receipt list embeds customer data. Customer API changes affect receipt display.

### H6. Potential E2E Risks

1. **Auth logout after second receipt** — Documented bug pattern. Refresh token rotation may invalidate after first receipt POST.
2. **Stale branch context** — If employee switches branch mid-session, receipt may be created under wrong branch.
3. **Browser back after receipt creation** — User may navigate back and resubmit, creating duplicate.
4. **Network timeout during receipt creation** — Receipt may be created on server but frontend shows error, leading to retry and duplicate.
5. **Allocation without receipt refresh** — After allocation, receipt list may show stale remainingAmount until manual refresh.

---

## Architecture Completeness

| Component | Completeness | Notes |
|-----------|-------------|-------|
| Frontend Pages | 90% | Create, List, Detail, Allocate, Print pages exist |
| Frontend Components | 85% | Search filters, table, summary cards, status badge |
| Frontend Store | 70% | customerReceiptStore exists but may lack full error handling |
| API Integration | 80% | apiClient handles auth, refresh, retry |
| Backend Controller | Unknown | Not in this repository |
| Backend Service | Unknown | Not in this repository |
| Backend Validation | Unknown | Not in this repository |
| Backend Transaction | Unknown | Not in this repository |
| E2E Tests | 60% | Auth regression tests exist, but no full E2E flow tests |
| Auth Integration | 75% | Auth invariant tests exist, real race condition tests exist |

**Overall Architecture Completeness (Frontend):** ~78%
**Overall Architecture Completeness (Full Stack):** ~45% (backend not in scope)

---

## Estimated Implementation Complexity

| Area | Complexity | Rationale |
|------|-----------|-----------|
| Frontend UI | Medium | Multiple pages, forms, filters, pagination |
| Frontend Store | Medium | Zustand store with async actions |
| API Integration | Medium | Standard CRUD with auth |
| Auth Integration | High | Refresh token rotation, race conditions, concurrent requests |
| Backend Receipt Creation | Medium | CRUD with validation |
| Backend Allocation | High | Transaction boundary, locking, balance updates |
| Backend Projections | High | Multiple projections must be updated atomically |
| E2E Testing | High | Requires real backend, database, auth setup |

**Overall Implementation Complexity:** HIGH

---

## Major Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Auth logout after receipt operations | CRITICAL | HIGH | Auth invariant tests, refresh coordination |
| Duplicate receipt creation | HIGH | MEDIUM | Idempotency key, frontend submit guard |
| Allocation race condition | HIGH | MEDIUM | Optimistic locking, transaction isolation |
| Stale outstanding snapshot | MEDIUM | HIGH | Re-verify outstanding at allocation time |
| Cross-branch receipt creation | HIGH | LOW | Backend branch authority check |
| Receipt number collision | MEDIUM | LOW | Database sequence for code generation |
| Concurrent refresh token rotation | CRITICAL | MEDIUM | Singleton refresh promise pattern |
| Network timeout during POST | MEDIUM | MEDIUM | Idempotency key + retry with dedup |

---

## Suggested Investigation Order for E2E Verification

1. **Auth invariant baseline** — Run Layer A (frontend mock) tests to verify auth invariant logic
2. **Real module auth race** — Run `customerReceiptRealAuthRace.test.js` with real production modules
3. **Backend auth integration** — Run Layer B tests against real backend (if available)
4. **E2E browser flow** — Run Layer C Playwright tests with real backend
5. **Receipt creation E2E** — Manual E2E: login → navigate → create receipt → verify list
6. **Allocation E2E** — Manual E2E: create receipt → allocate → verify sale status
7. **Concurrent allocation** — Manual test: two windows, same receipt, simultaneous allocate
8. **Duplicate submit test** — Rapid double-click on create, verify only one receipt created
9. **Refresh token rotation test** — Create receipts until token expires, verify refresh works
10. **Cross-branch test** — Attempt receipt creation for different branch, verify 403

---

*End of Customer Payment Runtime Discovery*
