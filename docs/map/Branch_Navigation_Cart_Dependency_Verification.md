# Branch, Navigation & Cart Dependency Verification

Status: DRAFT / VERIFIED PASS 01
Scope: Frontend POS sidebar route generation, menu config, stock menu capability metadata, online cart store, and online order store
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Maps:
- `docs/map/Dependency_Map.md`
- `docs/map/Login_Checkout_Dependency_Verification.md`

---

## 1. Purpose

This document records a focused verification pass for branch-dependent navigation and online cart/order runtime dependencies.

เป้าหมายคือบันทึกผลการตรวจส่วนที่เกี่ยวกับ Route/Branch/Cart/Order ก่อนแก้ Login/Auth Runtime

This is not an implementation plan.

---

## 2. Files Reviewed

```txt
src/features/pos/components/sidebar/SidebarLoader.jsx
src/config/sidebarMenuConfig.js
src/config/sidebarStockItems.js
src/features/online/cart/store/cartStore.js
src/features/online/order/store/orderOnlineStore.js
```

---

## 3. SidebarLoader Verification

Reviewed file:

```txt
src/features/pos/components/sidebar/SidebarLoader.jsx
```

Observed dependencies:

- Reads `shopSlug` from `useParams()`.
- Reads current `pathname` from `useLocation()`.
- Calls `getSidebarMenuConfig(shopSlug)`.
- Determines active POS module from URL path segments around `/pos`.
- Renders menu links using `item.to` values from menu config.
- Does not read authStore.
- Does not read branchStore.
- Does not enforce capability filtering itself.

Observed behavior:

- If path contains `/pos/<module>`, module is derived from URL.
- If no module is found, fallback active module is `purchases`.
- If menu config for active module is missing, it falls back to reports or purchases menu config.

Risk:

```txt
MEDIUM for navigation correctness
LOW for direct auth mutation
```

Reasons:

- Sidebar is route/URL driven, not auth/branch driven.
- It trusts URL `shopSlug` for building module menu links.
- If URL shopSlug differs from authenticated branchSlug, sidebar will still render links using the URL slug.
- Capability metadata may exist in menu items, but SidebarLoader does not filter by capability during this pass.

---

## 4. Sidebar Menu Config Verification

Reviewed file:

```txt
src/config/sidebarMenuConfig.js
```

Observed behavior:

- `getSidebarMenuConfig(shopSlug)` delegates to module-specific sidebar item builders.
- Each module receives the same `shopSlug`.
- Returned keys include purchases, sales, services, stock, reports, finance, and settings.

Risk:

```txt
MEDIUM
```

Reason:

- Route generation depends on `shopSlug` being correct.
- There is no direct auth or branch validation at this switchboard level.

---

## 5. Stock Sidebar Items Verification

Reviewed file:

```txt
src/config/sidebarStockItems.js
```

Observed behavior:

- Imports `P1_CAP` from RBAC client.
- Defines `filterSidebarGroupsByCap(groups, canFn)` helper.
- `filterSidebarGroupsByCap` can filter items by `item.cap`.
- `getSidebarStockItems(shopSlug)` builds stock links with prefix `/${shopSlug}/pos` or `/pos`.
- Stock menu items include capability metadata such as `VIEW_REPORTS`, `MANAGE_PRODUCTS`, `STOCK_AUDIT`, and `EDIT_PRICING`.

Important observation:

- Capability metadata exists, but the reviewed `SidebarLoader.jsx` does not apply `filterSidebarGroupsByCap`.
- Therefore, capability fields are metadata/dormant unless applied elsewhere.

Risk:

```txt
LOW if capability filtering remains dormant
HIGH if capability filtering is activated during Auth stabilization
```

Reason:

- Turning on filtering would mix authorization changes with Auth/Login stabilization.
- Current user-approved scope keeps RBAC out of Auth stabilization.

---

## 6. Cart Store Verification

Reviewed file:

```txt
src/features/online/cart/store/cartStore.js
```

Observed dependencies:

- Imports multiple cart API functions.
- Imports `useAuthStore`.
- Reads `token` imperatively through `useAuthStore.getState()` in several actions.
- Persists `cartItems` and `selectedItems` only.
- Does not persist `branchPrices`.

Observed auth dependency points:

```txt
addToCart
removeFromCart
increaseQuantity
decreaseQuantity
fetchCartAction
```

Observed branch dependency point:

```txt
fetchCartBranchPricesAction(branchId)
```

Observed behavior:

- If token exists, cart actions sync with server cart APIs.
- If no token exists, add/increase/decrease behavior can operate locally.
- `fetchCartAction` returns early when token is missing.
- `mergeCartAction` maps local cart items and sends them to server.
- `clearStorage` removes `cart-storage` and clears cart state.

Risk:

```txt
HIGH for auth token shape changes
MEDIUM for online checkout branch price behavior
```

Reasons:

- CartStore reads `authStore.token` imperatively.
- If authStore token naming or authChecked semantics change, cart sync can break silently.
- Branch price fetching depends on external caller passing correct branchId.
- CartStore itself does not own branch truth.

---

## 7. Order Online Store Verification

Reviewed file:

```txt
src/features/online/order/store/orderOnlineStore.js
```

Observed dependencies:

- Imports online order API functions.
- Imports cartStore.
- Does not import authStore directly.
- Does not import branchStore directly.

Observed submit flow:

1. Reads `cartItems` and `clearCart` from cartStore.
2. Builds payload from cart items.
3. Spreads caller-provided `userInputData` into payload.
4. Calls `createOrder(payload)`.
5. Clears cart on success.

Important observation:

- `branchId` and `customerId` are not owned by orderOnlineStore.
- They are expected to be provided by the caller, such as CheckoutPage.

Risk:

```txt
MEDIUM
```

Reason:

- Order branch/customer truth is owned upstream by CheckoutPage/authStore/branchStore combination.
- orderOnlineStore will submit whatever branchId/customerId it receives.

---

## 8. Verified Discoveries

### DISC-FE-NAV-001 — POS sidebar navigation is URL shopSlug driven

Status: VERIFIED

Evidence:

- SidebarLoader reads `shopSlug` from route params.
- SidebarLoader passes `shopSlug` into `getSidebarMenuConfig(shopSlug)`.
- Menu item builders generate paths using `shopSlug`.

Impact:

- POS sidebar does not validate URL slug against authStore employee branchSlug.
- Slug canonicalization must be handled elsewhere if required.

---

### DISC-FE-NAV-002 — Sidebar capability metadata exists but is not applied in SidebarLoader

Status: VERIFIED IN REVIEWED FILES

Evidence:

- Stock sidebar items define `cap` values.
- `filterSidebarGroupsByCap` exists.
- SidebarLoader renders menu config directly without calling a capability filter.

Impact:

- Do not assume menu permission filtering is active.
- Do not activate capability filtering during current Login/Auth stabilization.

---

### DISC-FE-CART-001 — CartStore depends on authStore token through getState

Status: VERIFIED

Evidence:

- CartStore calls `useAuthStore.getState().token` in multiple actions.

Impact:

- Auth token field changes can break cart sync.
- CartStore must be included in Auth Runtime impact analysis.

---

### DISC-FE-CART-002 — CartStore does not own branch truth

Status: VERIFIED

Evidence:

- CartStore fetches branch prices only when given a branchId.
- It does not read branchStore itself.

Impact:

- CheckoutPage or another caller owns branch selection for branch-price lookup.

---

### DISC-FE-ORDER-001 — orderOnlineStore does not own customer/branch identity

Status: VERIFIED

Evidence:

- orderOnlineStore does not import authStore or branchStore.
- It spreads caller-provided userInputData into create order payload.

Impact:

- CheckoutPage is currently the upstream owner of customerId and branchId for online order submission.

---

## 9. Impact on Current Auth Agenda

Current Auth stabilization must preserve:

```txt
Sidebar route generation from shopSlug
Cart token-based server sync
Cart local fallback behavior when token is absent
Cart merge after online login
Cart branch price fetch with caller-supplied branchId
Online order payload branchId/customerId from CheckoutPage
```

Still out of scope:

```txt
RBAC activation
Permission-based menu filtering
Route guard activation
Multi-branch switching
Backend auth changes
```

---

## 10. Open Questions

1. Should POS navigation validate URL `shopSlug` against `authStore.employee.branchSlug`?
2. Should `general-pos` fallback be allowed for employee POS route?
3. Should capability metadata remain dormant until RBAC agenda?
4. Should cartStore read `accessToken || token` instead of only `token` in future cleanup?
5. Should online checkout use only one branch source: `currentBranch.id` or `selectedBranchId`?
6. Should orderOnlineStore validate required payload fields before createOrder?

---

## 11. Next Verification Targets

Continue with:

```txt
src/features/auth/components/SubEmployeeManager.jsx
src/features/online/cart/api/cartApi.js
src/features/online/order/api/orderOnlineApi.js
src/routes/AppRouter.jsx
src/routes/partner/onlinePartnerRoutes.jsx
```

Search next:

```txt
general-pos
branchSlug
filterSidebarGroupsByCap
canSelector
selectedBranchId
currentBranch.id
```

---

## 12. Working Conclusion

POS sidebar navigation is URL-slug driven and does not validate against authenticated branch identity.

Sidebar capability metadata exists but appears dormant in reviewed files.

Online cart runtime depends on authStore token but not branchStore directly.

Online order store does not own customer or branch identity; CheckoutPage currently owns that payload composition.

Therefore, Auth/Login stabilization must preserve shared loginAction behavior and avoid activating dormant authorization/menu filtering during this agenda.
