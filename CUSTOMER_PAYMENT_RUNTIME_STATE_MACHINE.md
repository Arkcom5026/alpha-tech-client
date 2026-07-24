# CUSTOMER PAYMENT RUNTIME STATE MACHINE
## Business Lifecycle — Customer Receipt E2E Flow

**Status:** DISCOVERY COMPLETE (Repository Investigation Only)
**Date:** 2026-07-23
**Scope:** Frontend repository only (`d:/alpha-tech/client`)

---

## 1. Frontend Page State Machine

### 1.1 Customer Receipt List Page

```
                    ┌─────────────────────────────────────────────────────┐
                    │                    IDLE                             │
                    │  (Page mounted, no data loaded)                     │
                    └──────────┬──────────────────────────────────────────┘
                               │
                               │ mount / filter change / pagination
                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │                   LOADING                           │
                    │  • Skeleton rows shown (TableLoadingRows)           │
                    │  • Summary cards show pulse animation               │
                    │  • Search button shows "กำลังค้นหา..."              │
                    │  • Pagination buttons disabled                      │
                    └──────────┬──────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │       SUCCESS        │  │        ERROR          │
        │  • Items rendered    │  │  • Error toast shown  │
        │  • Summary displayed │  │  • Empty state        │
        │  • Pagination shown  │  │  • Retry button       │
        └──────────────────────┘  └──────────┬───────────┘
                    │                         │
                    │                         │ retry
                    │ filter/paginate          ▼
                    └──────────► LOADING ◄────┘
```

### 1.2 Customer Receipt Create Page

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  FORM_IDLE                          │
                    │  • Customer search input empty                      │
                    │  • Amount/method/date fields empty                  │
                    │  • Submit button disabled                           │
                    └──────────┬──────────────────────────────────────────┘
                               │
                               │ user types customer search
                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │              CUSTOMER_SEARCHING                     │
                    │  • API call: GET /customers/by-phone/:phone        │
                    │  • Loading spinner in search field                  │
                    └──────────┬──────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  CUSTOMER_FOUND      │  │  CUSTOMER_NOT_FOUND  │
        │  • Customer shown    │  │  • "ไม่พบลูกค้า" msg │
        │  • Can select        │  │  • Can create new     │
        └──────────┬───────────┘  └──────────────────────┘
                   │
                   │ user selects customer
                   ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │                  CUSTOMER_SELECTED                              │
        │  • customerReceiptStore.selectedCustomer set                    │
        │  • Outstanding invoices loading starts                         │
        └──────────┬──────────────────────────────────────────────────────┘
                   │
                   ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │              OUTSTANDING_LOADING                                │
        │  • API call: GET /sales?customerId=&status=outstanding         │
        └──────────┬──────────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  HAS_OUTSTANDING │  │  NO_OUTSTANDING  │
│  • Invoices list │  │  • "ไม่มีบิลค้าง"│
│  • Can allocate  │  │  • Can still     │
│    from here     │  │    create receipt │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │                  PAYMENT_ENTRY                                  │
        │  • User enters totalAmount, paymentMethod, receivedAt, note    │
        │  • Frontend validation active                                   │
        └──────────┬──────────────────────────────────────────────────────┘
                   │
                   │ user clicks "บันทึก"
                   ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │                  SUBMITTING                                     │
        │  • Submit button disabled + spinner                             │
        │  • API call: POST /customer-receipts                           │
        │  • Double-submit guard active                                   │
        └──────────┬──────────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────────────┐
        │                             │
        ▼                             ▼
┌──────────────────────┐  ┌──────────────────────┐
│    SUBMIT_SUCCESS    │  │    SUBMIT_ERROR       │
│  • Success toast     │  │  • Error toast        │
│  • Navigate to       │  │  • Re-enable form     │
│    receipt detail    │  │  • User can retry     │
│    or list           │  │                       │
└──────────────────────┘  └──────────────────────┘
```

### 1.3 Customer Receipt Allocate Page

```
                    ┌─────────────────────────────────────────────────────┐
                    │              ALLOCATE_IDLE                          │
                    │  • Page mounted, loading receipt + outstanding      │
                    └──────────┬──────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │            ALLOCATE_LOADING                         │
                    │  • GET /customer-receipts/:id                      │
                    │  • GET /sales?customerId=&status=outstanding       │
                    └──────────┬──────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  ALLOCATE_READY      │  │  ALLOCATE_ERROR      │
        │  • Receipt loaded    │  │  • Error toast       │
        │  • Outstanding shown │  │  • Retry button      │
        │  • Allocation form   │  │                      │
        └──────────┬───────────┘  └──────────────────────┘
                   │
                   │ user enters allocations + clicks "บันทึก"
                   ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │              ALLOCATION_SUBMITTING                              │
        │  • Submit button disabled                                       │
        │  • API call: POST /customer-receipts/:id/allocate              │
        └──────────┬──────────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────────────┐
        │                             │
        ▼                             ▼
┌──────────────────────┐  ┌──────────────────────┐
│ ALLOCATE_SUCCESS     │  │ ALLOCATE_ERROR        │
│  • Success toast     │  │  • Error toast        │
│  • Navigate to       │  │  • Re-enable form     │
│    receipt detail    │  │  • User can retry     │
│  • Receipt status    │  │                       │
│    may change to     │  │                       │
│    FULLY_ALLOCATED   │  │                       │
└──────────────────────┘  └──────────────────────┘
```

---

## 2. Business State Machine (Receipt Lifecycle)

### 2.1 Receipt Status Transitions

```
                    ┌─────────────────────────────────────────────────────┐
                    │                     DRAFT                           │
                    │  (Browser-only, not persisted)                      │
                    │  State: form fields filled, not submitted           │
                    └──────────────────────┬──────────────────────────────┘
                                           │
                                           │ POST /customer-receipts
                                           ▼
                    ┌─────────────────────────────────────────────────────┐
                    │                   ACTIVE                            │
                    │  • Receipt created, not yet fully allocated        │
                    │  • remainingAmount > 0                              │
                    │  • Can be allocated or cancelled                    │
                    │  • Displayed in list with blue badge "ใช้งานอยู่"   │
                    └──────────┬──────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────────────┐
                    │                             │
                    │ allocation completes        │ manual cancellation
                    ▼                             ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │   FULLY_ALLOCATED    │  │      CANCELLED        │
        │  • remainingAmount=0 │  │  • All amounts zeroed │
        │  • Green badge       │  │  • Red badge          │
        │    "ตัดครบแล้ว"      │  │    "ยกเลิกแล้ว"       │
        │  • No further        │  │  • No further actions │
        │    allocation allowed│  │    allowed            │
        │  • Still printable   │  │                       │
        └──────────────────────┘  └──────────────────────┘
```

### 2.2 Allocation Lifecycle (per receipt)

```
                    ┌─────────────────────────────────────────────────────┐
                    │           ALLOCATION_PENDING                        │
                    │  • Receipt is ACTIVE                                │
                    │  • remainingAmount > 0                              │
                    │  • "ตัดชำระ" button visible in table               │
                    └──────────┬──────────────────────────────────────────┘
                               │
                               │ user clicks "ตัดชำระ"
                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │         ALLOCATION_IN_PROGRESS                      │
                    │  • Allocate page loaded                             │
                    │  • Outstanding invoices fetched                     │
                    │  • User enters allocation amounts                   │
                    └──────────┬──────────────────────────────────────────┘
                               │
                               │ POST /customer-receipts/:id/allocate
                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │         ALLOCATION_COMPLETED                        │
                    │  • receipt.allocatedAmount += sum(allocations)      │
                    │  • receipt.remainingAmount -= sum(allocations)      │
                    │  • sale(s).paidAmount updated                       │
                    │  • customer.balance updated                         │
                    │  • If remainingAmount = 0 → status =               │
                    │    FULLY_ALLOCATED                                  │
                    └─────────────────────────────────────────────────────┘
```

### 2.3 Auth Token Lifecycle (Cross-Cutting)

```
                    ┌─────────────────────────────────────────────────────┐
                    │              TOKEN_VALID                            │
                    │  • accessToken present and not expired              │
                    │  • All API calls succeed with 200                   │
                    └──────────┬──────────────────────────────────────────┘
                               │
                               │ token expires (401 response)
                               ▼
                    ┌─────────────────────────────────────────────────────┐
                    │           TOKEN_EXPIRED                             │
                    │  • apiClient catches 401                            │
                    │  • Checks refreshPromise singleton                  │
                    └──────────┬──────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────────────┐
                    │                             │
                    │ refresh succeeds            │ refresh fails
                    ▼                             ▼
        ┌──────────────────────┐  ┌──────────────────────────────┐
        │   TOKEN_REFRESHED    │  │   TOKEN_REFRESH_FAILED       │
        │  • New accessToken   │  │  • authStore clears token    │
        │  • Original request  │  │  • Logout triggered          │
        │    retried with new  │  │  • Redirect to /login        │
        │    token             │  │  • User must re-authenticate │
        │  • Auth state        │  │                               │
        │    preserved         │  │                               │
        └──────────────────────┘  └──────────────────────────────┘
```

---

## 3. State Transition Table

### 3.1 Receipt Status Transitions

| From | To | Trigger | Validation |
|------|----|---------|------------|
| DRAFT | ACTIVE | POST /customer-receipts success | customerId, amount, method, branch valid |
| ACTIVE | FULLY_ALLOCATED | POST /allocate success (remainingAmount=0) | All allocations valid, sum = remainingAmount |
| ACTIVE | CANCELLED | Manual cancel | Receipt not already cancelled |
| ACTIVE | ACTIVE | POST /allocate success (remainingAmount>0) | Partial allocation valid |
| FULLY_ALLOCATED | (none) | Terminal state | No further transitions |
| CANCELLED | (none) | Terminal state | No further transitions |

### 3.2 Auth State Transitions

| From | To | Trigger | Side Effect |
|------|----|---------|-------------|
| AUTHENTICATED | AUTHENTICATED | Successful API call | None |
| AUTHENTICATED | REFRESHING | 401 response | Refresh queued |
| REFRESHING | AUTHENTICATED | Refresh success | Token updated, request retried |
| REFRESHING | UNAUTHENTICATED | Refresh failure | Token cleared, logout, redirect |
| UNAUTHENTICATED | AUTHENTICATED | Login success | Token stored, session created |

### 3.3 UI State Transitions

| Page | From | To | Trigger |
|------|------|----|---------|
| List | IDLE | LOADING | Page mount |
| List | LOADING | SUCCESS | API response 200 |
| List | LOADING | ERROR | API response 4xx/5xx |
| List | SUCCESS | LOADING | Filter change, pagination |
| List | ERROR | LOADING | Retry |
| Create | FORM_IDLE | CUSTOMER_SEARCHING | User types in search |
| Create | CUSTOMER_SEARCHING | CUSTOMER_FOUND | API returns customer |
| Create | CUSTOMER_SEARCHING | CUSTOMER_NOT_FOUND | API returns empty |
| Create | CUSTOMER_SELECTED | OUTSTANDING_LOADING | Customer selected |
| Create | OUTSTANDING_LOADING | HAS_OUTSTANDING | API returns invoices |
| Create | OUTSTANDING_LOADING | NO_OUTSTANDING | API returns empty |
| Create | PAYMENT_ENTRY | SUBMITTING | User clicks submit |
| Create | SUBMITTING | SUBMIT_SUCCESS | API 201 |
| Create | SUBMITTING | SUBMIT_ERROR | API error |
| Allocate | ALLOCATE_IDLE | ALLOCATE_LOADING | Page mount |
| Allocate | ALLOCATE_LOADING | ALLOCATE_READY | Both APIs succeed |
| Allocate | ALLOCATE_LOADING | ALLOCATE_ERROR | API error |
| Allocate | ALLOCATE_READY | ALLOCATION_SUBMITTING | User clicks submit |
| Allocate | ALLOCATION_SUBMITTING | ALLOCATE_SUCCESS | API 200 |
| Allocate | ALLOCATION_SUBMITTING | ALLOCATE_ERROR | API error |

---

## 4. Guard Conditions

### 4.1 Frontend Guards

| Guard | Location | Condition | Action |
|-------|----------|-----------|--------|
| Auth guard | ProtectedRoute | `authStore.isAuthenticated` | Redirect to /login if false |
| Submit guard | Create page | `!submitting && formValid` | Disable submit button |
| Allocation guard | Allocate page | `!submitting && allocationsValid` | Disable submit button |
| Pagination guard | Table | `!loading && page > 1` | Enable "ก่อนหน้า" button |
| Pagination guard | Table | `!loading && page < totalPages` | Enable "ถัดไป" button |
| Allocate button guard | Table | `status !== 'CANCELLED' && remainingAmount > 0` | Show/hide "ตัดชำระ" button |

### 4.2 Backend Guards (Inferred)

| Guard | Endpoint | Condition | Response |
|-------|----------|-----------|----------|
| Customer exists | POST /customer-receipts | `customerId` references valid customer | 404 if not found |
| Branch authority | POST /customer-receipts | Employee belongs to branch | 403 if mismatch |
| Receipt exists | POST /allocate | `receiptId` references valid receipt | 404 if not found |
| Receipt is ACTIVE | POST /allocate | `receipt.status === 'ACTIVE'` | 409 if not ACTIVE |
| Sale is outstanding | POST /allocate | `sale.status === 'outstanding'` | 409 if already paid |
| Allocation ≤ remaining | POST /allocate | `sum(allocations) <= receipt.remainingAmount` | 422 if exceeded |
| Allocation ≤ sale balance | POST /allocate | `allocation.amount <= sale.outstandingBalance` | 422 if exceeded |

---

## 5. Error Recovery Paths

### 5.1 API Error Recovery

```
ERROR
  │
  ├── 401 (Unauthorized)
  │     └── apiClient refresh → retry
  │           ├── Refresh success → retry original request
  │           └── Refresh fail → logout → redirect /login
  │
  ├── 403 (Forbidden)
  │     └── Show "ไม่มีสิทธิ์" error toast
  │
  ├── 404 (Not Found)
  │     └── Show "ไม่พบข้อมูล" error toast
  │
  ├── 409 (Conflict)
  │     └── Show "ข้อมูลถูกแก้ไขแล้ว" error toast → refresh data
  │
  ├── 422 (Validation Error)
  │     └── Show field-level validation errors
  │
  ├── 5xx (Server Error)
  │     └── Show "เกิดข้อผิดพลาด" error toast → retry button
  │
  └── Network Error
        └── Show "ไม่สามารถเชื่อมต่อ" error toast → retry button
```

### 5.2 State Recovery After Error

| Error Location | Recovery Action | State After Recovery |
|----------------|----------------|---------------------|
| List page load | Retry button → fetchReceipts() | LOADING → SUCCESS/ERROR |
| Create submit | Re-enable form → user retries | SUBMIT_ERROR → SUBMITTING |
| Allocate submit | Re-enable form → user retries | ALLOCATE_ERROR → ALLOCATION_SUBMITTING |
| Auth refresh fail | Redirect to /login → user logs in | UNAUTHENTICATED → AUTHENTICATED |
| Network timeout | Retry button → repeat last action | Same as original action |

---

## 6. Concurrent State Considerations

### 6.1 Multiple Tabs / Windows

| Scenario | Risk | Handling |
|----------|------|----------|
| Two tabs open same receipt list | Stale data | No real-time sync; manual refresh needed |
| Two tabs create receipts simultaneously | Duplicate receipts | No idempotency key; backend must handle |
| One tab allocates, another views same receipt | Stale remainingAmount | No real-time push; refresh needed |
| Token refresh in one tab | Other tab's token becomes stale | Both tabs share authStore (if Zustand persisted) |

### 6.2 Browser Navigation

| Action | Risk | Handling |
|--------|------|----------|
| Browser back after create | Form resubmission | Browser may show "Confirm Form Resubmission" |
| Browser refresh during submit | Receipt may be created but UI shows form | No recovery mechanism detected |
| Browser close during submit | Receipt may be created but user never sees result | No recovery mechanism detected |

---

*End of Customer Payment Runtime State Machine*
