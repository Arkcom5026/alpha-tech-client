# Sale Customer Section Responsibility Extraction

## Mission

Decompose the oversized Sale `CustomerSection.jsx` by real runtime responsibility, not by line count or visual fragments, while preserving current behavior.

## Architecture Goal

`CustomerSection.jsx` must become a thin composition shell. Each workflow responsibility must have one explicit owner:

- customer search state and execution
- customer editor state and save validation
- customer/deposit hydration and Sale handoff
- UI projection
- presentation components

This follows the Purchase Order composition model while preserving Sale feature ownership.

## Authorized Structure

- `components/SaleCustomerSearch.jsx`
- `components/SaleCustomerSearchResults.jsx`
- `hooks/useSaleCustomerSearch.js`
- `hooks/useSaleCustomerEditor.js`
- `hooks/useSaleCustomerHydration.js`
- `projections/saleCustomerSectionProjection.js`
- `index.js`
- later wiring changes in `src/features/sales/create/components/CustomerSection.jsx`
- focused repository contract evidence

## Responsibility Boundaries

### Search Owner

`useSaleCustomerSearch` owns search mode, query values, result state, minimum validation, search execution, not-found signaling, and loading/error state.

### Editor Owner

`useSaleCustomerEditor` owns customer fields, address fields, dirty state, payload construction, create/update save validation, hydration, and reset.

### Hydration and Handoff Owner

`useSaleCustomerHydration` owns loading the full customer/deposit context after selection, setting the Sale customer ID, projecting deposit state, selecting the default Sale mode, and focusing product search.

### Projection Owner

`saleCustomerSectionProjection` owns the stable view model consumed by the composition shell and presentation components.

### Component Owners

Presentation components render delegated state and emit intent. They must not call APIs, own Deposit logic, own Sale state, or access Repair workflows.

## Required Invariants

1. Existing name/phone search mode remains unchanged in this increment.
2. Existing 10-digit phone search behavior remains unchanged.
3. Existing Customer Deposit hydration remains unchanged.
4. Existing create/update/address behavior remains unchanged.
5. Existing Sale customer selection and product-search focus handoff remain unchanged.
6. Sale owns this workflow; no shared Repair component is introduced.
7. Unified single-field search is deferred to the next stacked increment.
8. Extraction is incomplete until the legacy shell delegates to these owners and duplicate responsibilities are removed.

## Non-goals

- `/customers/search` cutover
- removal of radio search mode
- partial phone search
- Repair intake search changes
- backend changes
- visual redesign
- runtime certification

## Verification Boundary

Repository evidence can prove responsibility ownership, public exports, isolation, and delegation contracts. Runtime and Operational PASS require executable evidence.
