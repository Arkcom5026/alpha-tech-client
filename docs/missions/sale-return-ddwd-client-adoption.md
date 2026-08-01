# Mission — Sale Return DDWD Client Adoption

## Mission

Adopt the Documentation-Driven Workflow Development Standard (DDWD) for the Sale Return workflow on the Client side.

## Objective

Provide module-owned operational guidance for returning serialized and SIMPLE sale items, refund evidence, deduction approval, stock restoration, retry recovery, and return history without duplicating Server authority.

## Client Authority Confirmed

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

Legacy/compatibility feature retained temporarily:

- `src/features/saleReturn/api/saleReturnApi.js`
- `src/features/saleReturn/store/saleReturnStore.js`
- legacy API targets `/sale-returns/...`

## Canonical versus Legacy Decision

- `src/features/sales/return` is the active Client runtime owner.
- `src/features/saleReturn` is a legacy feature path and is not mounted by the current POS sales router.
- The legacy feature is retained temporarily because Server compatibility routes remain active and external/deep-link usage has not been disproven.
- Retirement requires a separately approved implementation increment with repository/runtime usage evidence.

## Implemented Scope

- Operational User Guide: `docs/workflows/sale-return-operational-user-guide.md`
- Human Operational Test Pack: `docs/workflows/sale-return-human-operational-test-pack.md`
- module-owned help content: `src/features/sales/return/help/saleReturnHelpContent.js`
- module-owned Help Drawer: `src/features/sales/return/help/SaleReturnHelpDrawer.jsx`
- contextual `คู่มือ` entry on both canonical runtime pages
- serialized and SIMPLE return guidance
- refund source, deduction, and approval guidance
- stock conflict and safe-retry guidance
- Credit Note and tax boundary guidance without claiming unsupported runtime behavior
- focused contract: `tests/sale-return-help.contract.test.js`

## Runtime Impact

Documentation projection, contextual Help UI, and a focused repository contract only. No Sales Store, API contract, eligibility calculation, refund posting, stock mutation, completion workflow, Prisma, migration, or production-data behavior change.

## Verification Strategy

- Implementation and documentation package is complete.
- Focused contract exists but has not yet been executed in this phase.
- CI and final certification remain intentionally deferred until final Client and Server SHAs are stable.
- Human Operational Test and explicit merge approval remain mandatory.

## Completion Criteria

- [x] Dedicated branch exists.
- [x] Draft PR exists.
- [x] Active UI/router/store owner is proven.
- [x] Canonical versus legacy usage decision is recorded.
- [x] Operational User Guide exists.
- [x] Contextual in-app guidance is implemented.
- [x] Human Operational Test Pack exists.
- [x] Focused contract exists.
- [ ] Focused contract execution and final certification are recorded.
- [ ] Human Operational Test is recorded.
- [ ] Review and explicit merge decision are recorded.

## Current State

`IN PROGRESS` — Client implementation and documentation are complete; focused execution, final certification, Human Operational Test, review, and merge remain pending.
