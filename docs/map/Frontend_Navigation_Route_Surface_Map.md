# P1 Frontend Map — Navigation & Route Surface Map

Status: DRAFT / READING & MAPPING ONLY
Scope: Frontend routing, layout, navigation, and route-surface impact
Purpose: Understand the frontend navigation structure before changing Login/Auth or any runtime layer.

---

## 1. Why This Map Exists

This file exists to document how users move through the P1 frontend.

The goal is not to refactor routes yet.

The goal is to understand:

- Which files define application routes.
- Which layouts wrap each route group.
- Which route surfaces are public.
- Which route surfaces are POS/internal.
- Which paths depend on `shopSlug`.
- Which pages may be affected if Auth Runtime changes.
- Which routing rules are currently hardcoded and may become risky later.

This document should be updated as more frontend files are reviewed.

---

## 2. Current Route Entry

### File

`src/App.jsx`

### Observed Role

`App.jsx` is the root application entry.

It currently:

- Creates the browser router from `AppRouter`.
- Calls `bootstrapAuthAction()` on mount.
- Renders `RouterProvider`.

### Interpretation

`App.jsx` starts Auth Bootstrap globally, but it does not decide page access.

That means route access decisions must happen elsewhere, or they are not currently enforced at route level.

---

## 3. Main Router

### File

`src/routes/AppRouter.jsx`

### Current Top-Level Routes

```txt
/
partner-portal
partner-portal/forgot-password
partner-portal/reset-password
:shopSlug/pos
:shopSlug/shop
*
```

### Public / Portal Routes

```txt
/
partner-portal
partner-portal/forgot-password
partner-portal/reset-password
```

These routes are public-facing entry or recovery surfaces.

### POS Route

```txt
/:shopSlug/pos
```

This route loads the POS master layout.

### Shop Route

```txt
/:shopSlug/shop
```

This route loads online partner shop routes.

### Catch-All Route

```txt
*
→ /advancetech/pos/dashboard
```

### Important Observation

The catch-all currently redirects to a hardcoded POS dashboard path.

This may preserve a previous operational workaround, but it creates a multi-tenant risk if the logged-in user does not belong to `advancetech`.

---

## 4. POS Master Layout

### Location

Inside `src/routes/AppRouter.jsx`

### Component

`PartnerPosMasterLayout`

### Responsibilities

- Reads `shopSlug` from URL params.
- Renders `SidebarLoader`.
- Renders `HeaderPos`.
- Renders child pages through `Outlet`.

### Layout Structure

```txt
PartnerPosMasterLayout
    ├── SidebarLoader
    ├── HeaderPos
    └── Outlet
```

### Interpretation

The POS layout is a presentation shell.

It currently does not verify:

- token
- role
- branch
- branchSlug
- profileType
- capability

### Risk

If there is no guard elsewhere, POS pages can render before Auth Runtime is fully settled.

---

## 5. POS Route Children

### File

`src/routes/partner/posPartnerRoutes.jsx`

### Main POS Modules

```txt
dashboard
customers
purchases
sales
stock
stock/quick-input
reports
finance
settings
services
logout
```

### Important Observation

`posPartnerRoutes.jsx` mounts many operational domains directly.

These include high-risk business surfaces:

- purchasing
- sales
- stock
- finance
- settings
- employee management
- bank settings
- customer receipts

### Risk

If a future AuthGate is added too aggressively, it may affect all POS modules at once.

Any guard should be introduced carefully and tested route by route.

---

## 6. Purchase Routes

### File

`src/routes/partner/purchasesRoutes.jsx`

### Main Paths

```txt
purchases
purchases/orders
purchases/orders/create
purchases/orders/edit/:id
purchases/orders/view/:id
purchases/orders/print/:id

purchases/receipt
purchases/receipt/create/:id
purchases/receipt/view/:id
purchases/receipt/print/:id
purchases/receipt/items
purchases/receipt/items/scan/:receiptId
purchases/receipt/quick-receive

purchases/barcodes
purchases/barcodes/preview/:receiptId
purchases/barcodes/print
purchases/barcodes/range-print

purchases/suppliers
purchases/suppliers/create
purchases/suppliers/edit/:id
purchases/suppliers/view/:id
```

### Important Pages

- Quick stock receive uses `QuickStockPage`.
- Barcode and receipt pages are operationally sensitive.

### Auth/Runtime Risk

Purchase and stock intake routes depend heavily on correct branch context.

If branch context is wrong, stock can be received into the wrong branch.

---

## 7. Sales Routes

### File

`src/routes/partner/salesRoutes.jsx`

### Main Paths

```txt
sales
sales/dashboard
sales/sale
sales/bill
sales/bill/print-short/:saleId
sales/bill/print-full/:saleId
sales/print-short/:saleId
sales/print-full/:saleId
sales/delivery-note
sales/delivery-note/print/:saleId
sales/combined-billing
sales/sale-return
sales/sale-return/create/:saleId
sales/order-online
sales/order-online/convert/:id
sales/order-online/:id
```

### Important Pages

- QuickSalePage
- PrintBillPageShortTax
- PrintBillPageFullTax
- PrintDeliveryNotePage
- CreateReturnPage
- Online order conversion

### Auth/Runtime Risk

Sales pages depend on:

- employee identity
- branch identity
- document runtime
- sales runtime
- customer/order data

Print pages may need special care because they are often opened directly or refreshed.

---

## 8. Stock Routes

### File

`src/routes/partner/stockRoutes.jsx`

### Main Paths

```txt
stock
stock/products
stock/products/create
stock/products/edit/:id

stock/categories
stock/categories/create
stock/categories/edit/:id

stock/types
stock/types/create
stock/types/edit/:id

stock/brands
stock/brands/create
stock/brands/edit/:id

stock/profiles
stock/profiles/create
stock/profiles/edit/:id

stock/templates
stock/templates/create
stock/templates/edit/:id

stock/branch-prices
stock/stock-audit
stock/ready-to-sell
stock/ready-to-sell/structured/:productId

stock/units
stock/units/create
stock/units/edit/:id
```

### Important Pages

Stock routes include both runtime stock surfaces and master-data management surfaces.

### Auth/Runtime Risk

Stock routes are highly sensitive to branch context.

Product master data may be global or branch-specific depending on page behavior, so future access rules must be very careful.

---

## 9. Finance Routes

### Location

Inside `src/routes/partner/posPartnerRoutes.jsx`

### Main Paths

```txt
finance
finance/daily-closing
finance/ar
finance/customer-credit
finance/customer-receipts
finance/customer-receipts/create
finance/customer-receipts/:id
finance/customer-receipts/:id/allocate
finance/customer-receipts/:id/print
```

### Important Pages

- DailyClosingPage
- AccountsReceivablePage
- CustomerCreditPage
- CustomerReceipt pages

### Auth/Runtime Risk

Finance routes are operationally sensitive and already validated with real users.

Any AuthGate or route change must not break Daily Closing access.

---

## 10. Settings Routes

### Location

Inside `src/routes/partner/posPartnerRoutes.jsx`

### Main Paths

```txt
settings
settings/employee
settings/employee/edit/:id
settings/approve
settings/roles
settings/staff
settings/positions
settings/positions/create
settings/positions/edit/:id
settings/branches
settings/bank
settings/bank/create
settings/bank/edit/:id
```

### Important Pages

- Employee management
- Role management
- Staff settings
- Position management
- Branch management
- Bank management

### Auth/Runtime Risk

Settings has the highest authorization risk.

However, RBAC is currently not in scope for Login/Auth stabilization.

For now, this map only records that these routes exist and may require future capability gating.

---

## 11. Sidebar Navigation

### Files

```txt
src/features/pos/components/sidebar/SidebarLoader.jsx
src/config/sidebarMenuConfig.js
```

### Current Behavior

Sidebar derives active module from the current pathname.

It receives `shopSlug` from the URL and builds module menu paths.

### Interpretation

Sidebar is navigation presentation.

It does not currently enforce auth or capability.

### Risk

If URL `shopSlug` differs from authenticated branchSlug, Sidebar will keep building links under the URL slug.

---

## 12. Header Navigation

### File

`src/features/pos/components/header/HeaderPos.jsx`

### Current Behavior

Header builds top module links from `shopSlug`.

It displays:

- branch name
- POS operator
- superadmin indicator
- logout menu

### Interpretation

Header is a navigation and session display surface.

It does not own Auth Runtime.

### Risk

Header may trigger branch reload from `selectedBranchId`, which should be reviewed against POS branch ownership rules.

---

## 13. Online Partner Routes

### File

`src/routes/partner/onlinePartnerRoutes.jsx`

### Current Paths

```txt
/:shopSlug/shop
/:shopSlug/shop/products/:productId
/:shopSlug/shop/cart
```

### Interpretation

Online partner routes are separate from POS internal routes.

Online branch selection and POS branch identity should not be mixed.

---

## 14. Customer Routes

### File

`src/routes/partner/customerPartnerRoutes.jsx`

### Current Paths

```txt
customers
customers/:customerId
```

### Interpretation

Customer routes are internal POS routes under the POS route tree.

They may depend on branch and customer runtime.

---

## 15. Route-Level Auth Status

### Current Finding

No dedicated route guard has been confirmed yet in reviewed files.

No reviewed route file currently wraps POS routes with:

```txt
ProtectRoute
RequireAuth
AuthGate
PrivateRoute
```

### Meaning

Current FE appears to rely on:

```txt
App bootstrapAuthAction
authStore
apiClient refresh/retry
page-level API behavior
```

rather than a route-level runtime gate.

### Open Question

A repository-wide search is still required to confirm whether a guard exists elsewhere.

---

## 16. Route Risk Matrix

### High Risk Routes

```txt
/:shopSlug/pos/purchases/receipt/quick-receive
/:shopSlug/pos/sales/sale
/:shopSlug/pos/stock/products
/:shopSlug/pos/stock/branch-prices
/:shopSlug/pos/finance/daily-closing
/:shopSlug/pos/settings/*
```

Reason:
These surfaces depend heavily on identity, branch, or sensitive business permissions.

### Medium Risk Routes

```txt
/:shopSlug/pos/reports/*
/:shopSlug/pos/customers/*
/:shopSlug/pos/sales/bill/*
/:shopSlug/pos/sales/delivery-note/*
```

Reason:
They are important but may be read/print oriented depending on page.

### Low Risk Routes

```txt
/
/partner-portal
/partner-portal/forgot-password
/partner-portal/reset-password
/:shopSlug/shop/*
```

Reason:
These are public or non-POS internal surfaces.

---

## 17. Route Ownership Rules To Consider

Before making Auth changes, the team should decide:

### POS Canonical Slug

Should POS trust:

```txt
URL shopSlug
```

or

```txt
authStore.employee.branchSlug
```

Recommended direction:

```txt
authStore.employee.branchSlug is canonical for POS.
URL shopSlug should be corrected if mismatched.
```

### POS Render Timing

Should POS pages render while `isBootstrappingAuth=true`?

Recommended direction:

```txt
No. POS should wait for Auth Runtime to settle.
```

### Catch-All Redirect

Should catch-all always go to `/advancetech/pos/dashboard`?

Recommended direction:

```txt
No. Catch-all should be context-aware or return to public portal.
```

---

## 18. Next Exploration Targets

To complete this Navigation Map:

- Search for all files containing `ProtectRoute`.
- Search for all files containing `RequireAuth`.
- Search for all files containing `AuthGate`.
- Search for all files containing `PrivateRoute`.
- Search for all usages of `/logout`.
- Search for all usages of `useNavigate` with `/partner-portal`, `/login`, or `/`.
- Search all files that read `shopSlug`.
- Search all files that read `employee.branchSlug`.

---

## 19. Working Conclusion

Frontend routing is currently module-oriented and mostly presentation-driven.

The route tree is readable and organized by POS domain, but there is not yet enough evidence of a dedicated Route Guard layer.

This means Login/Auth stabilization should not start by changing routes broadly.

The safest next step is dependency search and guard discovery.

After route ownership is confirmed, a future small AuthGate can be designed with minimal impact.
