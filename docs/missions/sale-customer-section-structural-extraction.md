# Sale Customer Section Structural Extraction

## Mission

Extract the search surface and search result list from the oversized Sale `CustomerSection.jsx` without changing runtime behavior.

## Authority

This increment follows the Purchase Order frontend pattern:

- feature-owned components
- explicit public exports
- orchestration remains in the owning feature
- behavior-preserving structural movement before behavior change

## Authorized Scope

- `src/features/sales/create/customer/components/SaleCustomerSearch.jsx`
- `src/features/sales/create/customer/components/SaleCustomerSearchResults.jsx`
- `src/features/sales/create/customer/index.js`
- wiring changes in `src/features/sales/create/components/CustomerSection.jsx`
- focused repository contract evidence

## Required Invariants

1. Existing name/phone search mode remains unchanged in this increment.
2. Existing 10-digit phone search behavior remains unchanged.
3. Existing Customer Deposit hydration remains unchanged.
4. Existing create/update/address behavior remains unchanged.
5. Existing Sale customer selection and product-search focus handoff remain unchanged.
6. Components remain owned by the Sale create flow; no shared Repair component is introduced.
7. Unified search behavior is deferred to the next stacked increment.

## Non-goals

- `/customers/search` cutover
- removal of radio search mode
- partial phone search
- Repair intake search changes
- backend changes
- visual redesign
- runtime certification

## Verification Boundary

Repository evidence can prove file ownership, exports, and structural scope. Runtime and Operational PASS require executable evidence.
