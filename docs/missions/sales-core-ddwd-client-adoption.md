# Mission — Core Sales DDWD Client Adoption

## Mission

Adopt the Documentation-Driven Workflow Development Standard (DDWD) for the Core Sales workflow on the Client side.

## Objective

Add contextual, module-owned operational guidance for selling from item selection through payment or credit completion and initial document handling without duplicating Server authority.

## Existing Foundation Reviewed

- `src/features/sales/create/pages/CreateSalePage.jsx`
- mixed item search and cart workflow
- Held Cart save, resume, revalidate, and cancel flow
- customer selection and sale-mode controls
- payment evidence and credit-sale controls
- sale completion command identity and retry behavior
- printable/history lookup APIs
- existing sales tests and build gates

## Implemented Scope

- Core Sales in-app help content
- item search and cart checklist
- structured, tracked SIMPLE, and NON_STOCK line guidance
- Held Cart snapshot/resume/revalidation guidance
- customer and sale-type guidance
- immediate payment versus credit-sale guidance
- payment evidence and outstanding balance
- completion/idempotency and stock-conflict recovery
- receipt versus delivery-note defaults
- printable/history lookup guidance
- tax-candidate publication boundary
- focused contract and dedicated npm test command
- independent CI gate before Production Build
- Human Operational Test Pack

## Explicit Exclusion

- Sale Return is not part of this Increment and will be adopted separately.

## Documentation Status

- Workflow Contract: companion Server PR #197
- Acceptance Scenarios: companion Server PR #197
- Operational User Guide: implemented at `docs/workflows/core-sales-operational-user-guide.md`
- Human Operational Test Pack: implemented at `docs/workflows/core-sales-human-operational-test-pack.md`
- In-app Help: implemented through `CreateSalePage.jsx`
- Contextual Help: implemented in the main Sales workflow header
- Focused Contract: implemented at `tests/core-sales-help.contract.test.js`
- CI Gate: implemented before Production Build
- Workflow Assistant / runtime-backed checklist: separate scope; not part of this Increment
- Static operational checklist and FAQ / troubleshooting: implemented

## Current-head Certification Evidence

- Certified Client SHA: `ca7e1a18e36c22eafb3da9191aca7e09fd0f64d7`
- GitHub Actions run: `30668830284`
- Workflow conclusion: `SUCCESS`
- Repair Help contract: PASS
- Warranty Claim Help contract: PASS
- Quick Receipt Help contract: PASS
- Core Sales Help contract: PASS
- Production Build: PASS

## Runtime Impact

Documentation projection, contextual Help UI, focused contract, CI configuration, and operational test guidance only. No API, Prisma, migration, stock mutation, payment posting, route, Sales Store, or production-data change.

## Completion Criteria

- [x] Mission pack exists.
- [x] Draft PR is opened.
- [x] Core Sales guidance is implemented.
- [x] Contextual Help entry is implemented where appropriate.
- [x] Focused contract is added.
- [x] Independent CI gate is added.
- [x] Human Operational Test Pack exists.
- [x] Current Client head certification passes.
- [ ] Human Operational Test is executed and recorded.
- [ ] Independent human review is recorded.
- [ ] Explicit merge decision is recorded.

## Current State

`IN PROGRESS` — implementation and current-head repository/CI certification are complete. Human Operational Test, independent human review, and explicit merge approval remain pending. The PR must stay Draft and must not merge until those gates are satisfied.
