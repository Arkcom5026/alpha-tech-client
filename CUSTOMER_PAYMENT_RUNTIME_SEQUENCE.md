# CUSTOMER PAYMENT RUNTIME SEQUENCE
## Complete Runtime Sequence Diagram — Customer Receipt E2E Flow

**Status:** DISCOVERY COMPLETE (Repository Investigation Only)
**Date:** 2026-07-23
**Scope:** Frontend repository only (`d:/alpha-tech/client`)

---

## SEQUENCE 1: Page Entry — Customer Receipt List

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │  GET /pos/finance/       │                        │                       │                       │
  │  customer-receipts       │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  ProtectedRoute        │                       │                       │
  │                          │  check auth            │                       │                       │
  │                          │  ───────►              │                       │                       │
  │                          │  ◄───────              │                       │                       │
  │                          │                        │                       │                       │
  │                          │  POSLayout mount       │                       │                       │
  │                          │  ───────►              │                       │                       │
  │                          │  ◄───────              │                       │                       │
  │                          │                        │                       │                       │
  │                          │  CustomerReceiptList   │                       │                       │
  │                          │  Page mount            │                       │                       │
  │                          │                        │                       │                       │
  │                          │  dispatch              │                       │                       │
  │                          │  fetchReceipts()       │                       │                       │
  │                          │ ──────────────────────►│                       │                       │
  │                          │                        │  set loading=true     │                       │
  │                          │                        │  ───────►             │                       │
  │                          │                        │                       │                       │
  │                          │                        │  GET /customer-       │                       │
  │                          │                        │  receipts?page=1&     │                       │
  │                          │                        │  limit=20             │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │  GET /customer-       │
  │                          │                        │                       │  receipts             │
  │                          │                        │                       │ ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │                        │                       │                       │
  │                          │                        │  set items,           │                       │
  │                          │                        │  pagination,          │                       │
  │                          │                        │  summary,             │                       │
  │                          │                        │  loading=false        │                       │
  │                          │                        │                       │                       │
  │                          │  ◄─── re-render ──────│                       │                       │
  │                          │                        │                       │                       │
  │                          │  CustomerReceiptTable  │                       │                       │
  │                          │  render items          │                       │                       │
  │                          │                        │                       │                       │
  │                          │  CustomerReceipt       │                       │                       │
  │                          │  SummaryCards render   │                       │                       │
  │                          │                        │                       │                       │
  │  ◄─── Page rendered ────│                        │                       │                       │
```

---

## SEQUENCE 2: Customer Search (Create Receipt Flow)

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │  Click "สร้างใบรับเงิน"  │                        │                       │                       │
  │  or navigate to          │                        │                       │                       │
  │  /customer-receipts/     │                        │                       │                       │
  │  create                  │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  CustomerReceipt       │                       │                       │
  │                          │  CreatePage mount      │                       │                       │
  │                          │                        │                       │                       │
  │                          │  Render customer       │                       │                       │
  │                          │  search form           │                       │                       │
  │                          │                        │                       │                       │
  │  User types phone/name   │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  [Debounce?]           │                       │                       │
  │                          │  GET /customers/       │                       │                       │
  │                          │  by-phone/:phone       │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  GET /customers/      │                       │
  │                          │                        │  by-phone/:phone      │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │  GET /customers/      │
  │                          │                        │                       │  by-phone/:phone      │
  │                          │                        │                       │ ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │  ◄─── customer data ──│                       │                       │
  │                          │                        │                       │                       │
  │  ◄─── Customer shown ───│                        │                       │                       │
```

---

## SEQUENCE 3: Outstanding Invoices Load

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │  User selects customer   │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  dispatch              │                       │                       │
  │                          │  selectCustomer(id)    │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  set selectedCustomer │                       │
  │                          │                        │                       │                       │
  │                          │  dispatch              │                       │                       │
  │                          │  fetchOutstanding()    │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │                       │                       │
  │                          │                        │  GET /sales?          │                       │
  │                          │                        │  customerId=1&        │                       │
  │                          │                        │  status=outstanding   │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │  GET /sales           │
  │                          │                        │                       │ ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │                        │                       │                       │
  │                          │                        │  set outstanding      │                       │
  │                          │                        │  invoices             │                       │
  │                          │                        │                       │                       │
  │  ◄─── Invoices shown ───│                        │                       │                       │
```

---

## SEQUENCE 4: Receipt Creation (POST)

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │  User fills amount,      │                        │                       │                       │
  │  payment method, note    │                        │                       │                       │
  │                          │                        │                       │                       │
  │  User clicks "บันทึก"    │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  [Frontend Validation] │                       │                       │
  │                          │  - customerId present  │                       │                       │
  │                          │  - amount > 0          │                       │                       │
  │                          │  - paymentMethod valid │                       │                       │
  │                          │  - receivedAt valid    │                       │                       │
  │                          │                        │                       │                       │
  │                          │  dispatch              │                       │                       │
  │                          │  createReceipt(payload)│                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │                       │                       │
  │                          │                        │  set submitting=true  │                       │
  │                          │                        │                       │                       │
  │                          │                        │  POST /customer-      │                       │
  │                          │                        │  receipts             │                       │
  │                          │                        │  {                    │                       │
  │                          │                        │    customerId: 1,     │                       │
  │                          │                        │    totalAmount: 1000, │                       │
  │                          │                        │    paymentMethod:     │                       │
  │                          │                        │      "CASH",          │                       │
  │                          │                        │    receivedAt: "...", │                       │
  │                          │                        │    note: "...",       │                       │
  │                          │                        │    branchId: 1        │                       │
  │                          │                        │  }                    │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [apiClient attaches  │
  │                          │                        │                       │   Authorization:      │
  │                          │                        │                       │   Bearer <token>]    │
  │                          │                        │                       │                       │
  │                          │                        │                       │  POST /customer-      │
  │                          │                        │                       │  receipts             │
  │                          │                        │                       │ ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  [Controller]         │
  │                          │                        │                       │  validate request     │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [Service]            │
  │                          │                        │                       │  validateCustomer()   │
  │                          │                        │                       │  validateBranch()     │
  │                          │                        │                       │  generateReceiptNo()  │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [Repository]         │
  │                          │                        │                       │  INSERT customer_     │
  │                          │                        │                       │  receipts             │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [Database]           │
  │                          │                        │                       │  write receipt row    │
  │                          │                        │                       │  ◄───────             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [Projection]         │
  │                          │                        │                       │  update customer      │
  │                          │                        │                       │  balance projection   │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 201 Created ───│
  │                          │                        │                       │                       │
  │                          │                        │  ◄─── 201 Created ───│                       │
  │                          │                        │                       │                       │
  │                          │                        │  set submitting=false │                       │
  │                          │                        │  add receipt to items │                       │
  │                          │                        │                       │                       │
  │                          │  ◄─── success ────────│                       │                       │
  │                          │                        │                       │                       │
  │                          │  Show success toast    │                       │                       │
  │                          │  "สร้างรายการรับชำระ   │                       │                       │
  │                          │   เรียบร้อยแล้ว"       │                       │                       │
  │                          │                        │                       │                       │
  │                          │  Navigate to receipt   │                       │                       │
  │                          │  detail or list        │                       │                       │
  │                          │                        │                       │                       │
  │  ◄─── Success shown ────│                        │                       │                       │
```

---

## SEQUENCE 5: Receipt Creation with 401 + Refresh

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │                          │                        │  POST /customer-      │                       │
  │                          │                        │  receipts             │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [apiClient request   │
  │                          │                        │                       │   interceptor]        │
  │                          │                        │                       │  attach token         │
  │                          │                        │                       │                       │
  │                          │                        │                       │  ──── POST ──────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 401 ───────────│
  │                          │                        │                       │                       │
  │                          │                        │                       │  [apiClient response  │
  │                          │                        │                       │   interceptor]        │
  │                          │                        │                       │  catch 401            │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Check refreshPromise │
  │                          │                        │                       │  singleton            │
  │                          │                        │                       │                       │
  │                          │                        │                       │  POST /auth/refresh   │
  │                          │                        │                       │  (direct axios,       │
  │                          │                        │                       │   bypass interceptor) │
  │                          │                        │                       │ ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │                       │  { accessToken: new } │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Update authStore     │
  │                          │                        │                       │  with new token       │
  │                          │                        │                       │  ───────►             │
  │                          │                        │  ◄─── token updated ─│                       │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Retry original       │
  │                          │                        │                       │  POST /customer-      │
  │                          │                        │                       │  receipts (with       │
  │                          │                        │                       │  _retry=true)         │
  │                          │                        │                       │ ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 201 Created ───│
  │                          │                        │                       │                       │
  │                          │                        │  ◄─── 201 Created ───│                       │
  │                          │                        │                       │                       │
```

---

## SEQUENCE 6: Allocation (POST /allocate)

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │  User navigates to       │                        │                       │                       │
  │  /customer-receipts/     │                        │                       │                       │
  │  :id/allocate            │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  CustomerReceipt       │                       │                       │
  │                          │  AllocatePage mount    │                       │                       │
  │                          │                        │                       │                       │
  │                          │  GET /customer-        │                       │                       │
  │                          │  receipts/:id          │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  GET /customer-       │                       │
  │                          │                        │  receipts/:id         │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │                        │                       │                       │
  │                          │  GET /sales?           │                       │                       │
  │                          │  customerId=&          │                       │                       │
  │                          │  status=outstanding    │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  ───────────────────►│                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │                        │                       │                       │
  │                          │  Render allocation     │                       │                       │
  │                          │  form with receipt     │                       │                       │
  │                          │  + outstanding sales   │                       │                       │
  │                          │                        │                       │                       │
  │  User enters allocation  │                        │                       │                       │
  │  amounts per sale        │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │  User clicks "บันทึก"    │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  [Frontend Validation] │                       │                       │
  │                          │  - sum(allocations)    │                       │                       │
  │                          │    ≤ receipt.          │                       │                       │
  │                          │    remainingAmount     │                       │                       │
  │                          │  - each allocation     │                       │                       │
  │                          │    ≤ sale outstanding  │                       │                       │
  │                          │                        │                       │                       │
  │                          │  dispatch              │                       │                       │
  │                          │  allocateReceipt(      │                       │                       │
  │                          │    receiptId,          │                       │                       │
  │                          │    allocations)        │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │                       │                       │
  │                          │                        │  POST /customer-      │                       │
  │                          │                        │  receipts/:id/        │                       │
  │                          │                        │  allocate             │                       │
  │                          │                        │  { allocations: [...]}│                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [Controller]         │
  │                          │                        │                       │  validate request     │
  │                          │                        │                       │                       │
  │                          │                        │                       │  [Service]            │
  │                          │                        │                       │  BEGIN TRANSACTION    │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Lock receipt row     │
  │                          │                        │                       │  (SELECT FOR UPDATE)  │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Lock sale rows       │
  │                          │                        │                       │  (SELECT FOR UPDATE)  │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Validate outstanding │
  │                          │                        │                       │  balances match       │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Update receipt       │
  │                          │                        │                       │  allocatedAmount +=   │
  │                          │                        │                       │  sum(allocations)     │
  │                          │                        │                       │  remainingAmount -=   │
  │                          │                        │                       │  sum(allocations)     │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Update sale(s)       │
  │                          │                        │                       │  paidAmount += amount │
  │                          │                        │                       │  status check         │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Insert allocation    │
  │                          │                        │                       │  records              │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Update customer      │
  │                          │                        │                       │  balance              │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  COMMIT               │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │                       │                       │
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │                        │                       │                       │
  │                          │                        │  Update receipt in    │                       │
  │                          │                        │  local state          │                       │
  │                          │                        │                       │                       │
  │                          │  ◄─── success ────────│                       │                       │
  │                          │                        │                       │                       │
  │                          │  Show success toast    │                       │                       │
  │                          │  Navigate to receipt   │                       │                       │
  │                          │  detail                │                       │                       │
  │                          │                        │                       │                       │
  │  ◄─── Success shown ────│                        │                       │                       │
```

---

## SEQUENCE 7: Receipt Detail + Print

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │  User clicks "รายละเอียด"│                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  Navigate to           │                       │                       │
  │                          │  /customer-receipts/   │                       │                       │
  │                          │  :id                   │                       │                       │
  │                          │                        │                       │                       │
  │                          │  CustomerReceipt       │                       │                       │
  │                          │  DetailPage mount      │                       │                       │
  │                          │                        │                       │                       │
  │                          │  GET /customer-        │                       │                       │
  │                          │  receipts/:id          │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  GET /customer-       │                       │
  │                          │                        │  receipts/:id         │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │                        │                       │                       │
  │                          │  Render receipt detail │                       │                       │
  │                          │  with allocations      │                       │                       │
  │                          │                        │                       │                       │
  │  ◄─── Detail shown ────│                        │                       │                       │
  │                          │                        │                       │                       │
  │  User clicks "พิมพ์ใบเสร็จ"│                       │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  Navigate to           │                       │                       │
  │                          │  /customer-receipts/   │                       │                       │
  │                          │  :id/print             │                       │                       │
  │                          │                        │                       │                       │
  │                          │  GET /customer-        │                       │                       │
  │                          │  receipts/:id/print    │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  ───────────────────►│                       │
  │                          │                        │                       │  ◄─── HTML/PDF ──────│
  │                          │                        │  ◄─── HTML/PDF ──────│                       │
  │                          │                        │                       │                       │
  │                          │  Render print preview  │                       │                       │
  │                          │  or trigger print      │                       │                       │
  │                          │                        │                       │                       │
  │  ◄─── Print shown ─────│                        │                       │                       │
```

---

## SEQUENCE 8: Filter + Pagination

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │  User changes filter     │                        │                       │                       │
  │  (status, date, etc.)    │                        │                       │                       │
  │ ──────────────────────►  │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  CustomerReceipt       │                       │                       │
  │                          │  SearchFilters         │                       │                       │
  │                          │  onChange(filters)     │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │                       │                       │
  │                          │                        │  updateFilters()      │                       │
  │                          │                        │  reset page to 1      │                       │
  │                          │                        │                       │                       │
  │                          │                        │  fetchReceipts()      │                       │
  │                          │                        │  set loading=true      │                       │
  │                          │                        │                       │                       │
  │                          │                        │  GET /customer-       │                       │
  │                          │                        │  receipts?page=1&     │                       │
  │                          │                        │  limit=20&status=     │                       │
  │                          │                        │  ACTIVE&fromDate=...  │                       │
  │                          │                        │ ─────────────────────►│                       │
  │                          │                        │                       │  ◄─── 200 OK ────────│
  │                          │                        │  ◄─── 200 OK ────────│                       │
  │                          │                        │                       │                       │
  │                          │                        │  set items,           │                       │
  │                          │                        │  pagination,          │                       │
  │                          │                        │  summary,             │                       │
  │                          │                        │  loading=false        │                       │
  │                          │                        │                       │                       │
  │                          │  ◄─── re-render ──────│                       │                       │
  │                          │                        │                       │                       │
  │  ◄─── Updated list ────│                        │                       │                       │
```

---

## SEQUENCE 9: Auth Refresh Race Condition (Critical Path)

```
Browser                    React                    Store                    API                    Controller
  │                          │                        │                       │                       │
  │                          │                        │                       │                       │
  │                          │  Request #1            │                       │                       │
  │                          │  POST /customer-       │                       │                       │
  │                          │  receipts              │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  ───────────────────►│                       │
  │                          │                        │                       │                       │
  │                          │  Request #2            │                       │                       │
  │                          │  POST /customer-       │                       │                       │
  │                          │  receipts              │                       │                       │
  │                          │ ─────────────────────►│                       │                       │
  │                          │                        │  ───────────────────►│                       │
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 401 (Req #1) ──│
  │                          │                        │                       │                       │
  │                          │                        │                       │  [apiClient]          │
  │                          │                        │                       │  refreshPromise =     │
  │                          │                        │                       │  POST /auth/refresh   │
  │                          │                        │                       │  ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 401 (Req #2) ──│
  │                          │                        │                       │                       │
  │                          │                        │                       │  [apiClient]          │
  │                          │                        │                       │  refreshPromise       │
  │                          │                        │                       │  exists → await same │
  │                          │                        │                       │  ───────►             │
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 200 (Refresh) ─│
  │                          │                        │                       │  { accessToken: new } │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Update authStore     │
  │                          │                        │                       │  ───────►             │
  │                          │                        │  ◄─── token updated ─│                       │
  │                          │                        │                       │                       │
  │                          │                        │                       │  Retry Req #1         │
  │                          │                        │                       │  ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 201 (Req #1) ──│
  │                          │                        │                       │                       │
  │                          │                        │                       │  Retry Req #2         │
  │                          │                        │                       │  ─────────────────────►│
  │                          │                        │                       │                       │
  │                          │                        │                       │  ◄─── 201 (Req #2) ──│
  │                          │                        │                       │                       │
  │                          │                        │  ◄─── Both succeed ──│                       │
  │                          │                        │                       │                       │
```

**CRITICAL NOTE:** If `refreshPromise` is NOT a singleton (i.e., each 401 creates a new refresh call), then:
- Two concurrent refresh calls are made
- First refresh succeeds, returns new access token + rotates refresh token
- Second refresh uses the OLD (now rotated) refresh token → fails with 401
- Second refresh failure → authStore clears token → logout → redirect to /login
- **This is the documented bug pattern: "Auth logout after second receipt"**

---

## SEQUENCE 10: Full Happy Path E2E

```
Browser          React/Store          API/Client          Controller          Service           Database
  │                  │                    │                    │                  │                  │
  │  Login           │                    │                    │                  │                  │
  │ ────────────────►│  POST /auth/login  │                    │                  │                  │
  │                  │ ──────────────────►│ ──────────────────►│ ────────────────►│ ────────────────►│
  │                  │                    │                    │                  │                  │
  │                  │ ◄─── 200 + token ──────────────────────│                  │                  │
  │                  │                    │                    │                  │                  │
  │  Navigate to     │                    │                    │                  │                  │
  │  /customer-      │                    │                    │                  │                  │
  │  receipts/create │                    │                    │                  │                  │
  │ ────────────────►│                    │                    │                  │                  │
  │                  │                    │                    │                  │                  │
  │  Search customer │                    │                    │                  │                  │
  │ ────────────────►│  GET /customers/   │                    │                  │                  │
  │                  │  by-phone/...      │                    │                  │                  │
  │                  │ ──────────────────►│ ──────────────────►│ ────────────────►│ ────────────────►│
  │                  │ ◄─── 200 ──────────────────────────────│                  │                  │
  │                  │                    │                    │                  │                  │
  │  Select customer │                    │                    │                  │                  │
  │ ────────────────►│                    │                    │                  │                  │
  │                  │  GET /sales?       │                    │                  │                  │
  │                  │  customerId=&      │                    │                  │                  │
  │                  │  status=outstanding│                    │                  │                  │
  │                  │ ──────────────────►│ ──────────────────►│ ────────────────►│ ────────────────►│
  │                  │ ◄─── 200 ──────────────────────────────│                  │                  │
  │                  │                    │                    │                  │                  │
  │  Enter payment   │                    │                    │                  │                  │
  │  amount + method │                    │                    │                  │                  │
  │ ────────────────►│                    │                    │                  │                  │
  │                  │                    │                    │                  │                  │
  │  Submit receipt  │                    │                    │                  │                  │
  │ ────────────────►│  POST /customer-   │                    │                  │                  │
  │                  │  receipts          │                    │                  │                  │
  │                  │ ──────────────────►│ ──────────────────►│ ────────────────►│ ────────────────►│
  │                  │                    │                    │                  │  INSERT receipt   │
  │                  │                    │                    │                  │ ◄────────────────│
  │                  │ ◄─── 201 ──────────────────────────────│