# Mission — Sale Return DDWD Client Adoption

## Mission

Adopt the Documentation-Driven Workflow Development Standard (DDWD) for the Sale Return workflow on the Client side.

## Objective

Provide module-owned operational guidance for returning serialized and SIMPLE sale items, refund evidence, deduction approval, stock restoration, retry recovery, and return history without duplicating Server authority.

## Client Authority Discovered

Canonical API owner:

- `src/features/sales/return/api/saleReturnApi.js`
- eligibility: `GET /sales/returns/eligible/:saleId`
- completion: `POST /sales/returns/complete`
- returnable-sale lookup: `GET /sales/return`

Legacy/compatibility API still present:

- `src/features/saleReturn/api/saleReturnApi.js`
- completion: `POST /sale-returns/create`
- list/detail: `/sale-returns/...`

## Hybrid State Under Assessment

- Two Client API namespaces exist for Sale Return.
- The canonical nested Sales feature and legacy top-level feature must be traced to actual page/router/store usage.
- No legacy file or compatibility endpoint may be removed until usage and backward-compatibility evidence are complete.
- The DDWD adoption may record a retirement decision, but does not pre-authorize runtime removal.

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

## Explicit Exclusions Until Discovery Completes

- No assumption that the legacy or canonical UI is the sole runtime owner without usage evidence.
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
- [ ] Draft PR exists.
- [x] Initial Client API authority discovery is recorded.
- [ ] Active UI/router/store owner is proven.
- [ ] Canonical versus legacy usage decision is recorded.
- [ ] Operational User Guide exists.
- [ ] Contextual in-app guidance is implemented where appropriate.
- [ ] Focused contract and final certification are recorded.
- [ ] Human Operational Test is recorded.
- [ ] Review and explicit merge decision are recorded.

## Current State

`IN PROGRESS` — Client authority discovery has begun; active UI ownership, documentation, help projection, hybrid-state decision, acceptance, and merge remain pending.
