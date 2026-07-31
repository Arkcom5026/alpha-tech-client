# Mission — Sale Return DDWD Client Adoption

## Mission

Adopt the Documentation-Driven Workflow Development Standard (DDWD) for the Sale Return workflow on the Client side.

## Objective

Provide module-owned operational guidance for returning serialized and SIMPLE sale items, refund evidence, deduction approval, stock restoration, retry recovery, and return history without duplicating Server authority.

## Client Authority Discovered

Canonical runtime owner:

- `src/features/sales/return/index.js`
- `src/features/sales/return/pages/ReturnSearchPage.jsx`
- `src/features/sales/return/pages/CreateReturnPage.jsx`
- `src/features/sales/return/store/saleReturnRuntimeStore.js`
- `src/features/sales/return/hooks/useSaleReturnRuntimeController.js`
- `src/features/sales/return/api/saleReturnApi.js`

Canonical API paths:

- eligibility: `GET /sales/returns/eligible/:saleId`
- completion: `POST /sales/returns/complete`
- returnable-sale lookup: `GET /sales/return`

Runtime route proof:

- `src/routes/partner/salesRoutes.jsx` imports `CreateReturnPage` and `ReturnSearchPage` from `@/features/sales/return`.
- POS routes mount `sales/sale-return` and `sales/sale-return/create/:saleId` to the canonical pages.

Legacy/compatibility feature still present:

- `src/features/saleReturn/api/saleReturnApi.js`
- `src/features/saleReturn/store/saleReturnStore.js`
- legacy API targets `/sale-returns/...`

## Canonical versus Legacy Decision

- `src/features/sales/return` is the active Client runtime owner.
- `src/features/saleReturn` is a legacy feature path and is not mounted by the current POS sales router.
- The legacy feature is retained temporarily because Server compatibility routes remain active and external/deep-link usage has not been disproven.
- This DDWD Increment records the retirement boundary but does not delete the legacy feature or compatibility endpoint.
- Retirement requires a separately approved implementation increment with repository/runtime usage evidence.

## Planned Scope

- Operational User Guide
- in-app Help owned by the active Sale Return module
- eligibility and remaining-returnable guidance
- serialized and SIMPLE quantity selection
- refund channels and source-payment evidence
- deducted-refund reason and approval guidance
- stock-restoration outcome and conflict recovery
- command identity, safe retry, and duplicate prevention
- return history/list/detail guidance
- credit note, tax adjustment, and accounting-boundary guidance only where supported by Server authority
- focused contract and CI gate after implementation is complete
- Human Operational Test Pack

## Explicit Exclusions

- No assumption that Credit Note or tax adjustment is implemented.
- No deletion of legacy API or route paths in this documentation phase.
- No Sales Store, API contract, stock mutation, refund posting, or production-data behavior change unless opened as a separately justified implementation increment.

## Verification Strategy

- Continue repository discovery and documentation implementation first.
- CI checks are intentionally deferred until the implementation package is complete.
- Final certification will run once on the final Client and Server SHAs.
- Human Operational Test and explicit merge approval remain mandatory.

## Completion Criteria

- [x] Dedicated branch exists.
- [x] Draft PR exists.
- [x] Initial Client API authority discovery is recorded.
- [x] Active UI/router/store owner is proven.
- [x] Canonical versus legacy usage decision is recorded.
- [ ] Operational User Guide exists.
- [ ] Contextual in-app guidance is implemented where appropriate.
- [ ] Focused contract and final certification are recorded.
- [ ] Human Operational Test is recorded.
- [ ] Review and explicit merge decision are recorded.

## Current State

`IN PROGRESS` — active Client owner and hybrid boundary are confirmed; documentation, help projection, acceptance, and merge remain pending.
