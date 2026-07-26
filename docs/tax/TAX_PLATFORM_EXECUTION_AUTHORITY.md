# Alpha-Tech Tax Platform — Frontend Execution Authority

## Mission

Deliver the frontend surfaces for the Alpha-Tech Tax Platform while preserving current Sales, Purchase, Repair, Expense, Return, Claim, and document-printing workflows.

This branch is the dedicated frontend delivery line:

- Branch: `feature/tax-platform-authority`
- Base: `main`
- Repository: `Arkcom5026/alpha-tech-client`

## Source of Truth

1. Current frontend routes, stores, API clients, and runtime behavior
2. Backend tax contracts on the matching server branch
3. Tax Step Packages STEP 001–180
4. Browser and operational evidence from the user's local environment

## UI Ownership Boundary

The tax module owns its workflow-bound UI and components. Existing Sales, Purchase, Repair, Expense, Return, and Claim modules retain their own UI.

Cross-module reuse is limited to neutral primitives that do not own tax workflow meaning.

## Planned Tax Surfaces

- tax workspace and dashboard
- candidate review and validation
- tax document issue/detail/history
- customer/supplier/issuer snapshot review
- input and output VAT ledgers
- reconciliation and exception queues
- tax period, lock, close, and reopen controls
- credit note, debit note, cancellation, and replacement flows
- filing, submission evidence, settlement, refund, and archive
- permissions, monitoring, operational health, and governance surfaces where operationally justified

## Compatibility Rule

Existing receipts and full-tax-invoice printing must continue to work during migration. The first implementation pass separates projection and authority without changing the user-visible business result.

Issued tax documents must render from immutable backend snapshots rather than current mutable Sale, Customer, Branch, Product, or Supplier master data.

## Delivery Strategy

### Phase A — Module Foundation

- module routes and shell
- API contracts and client boundary
- candidate and tax-document read models
- compatibility adapter for current tax invoice printing

### Phase B — Core Operations

- issue/review/approve flows
- tax document detail and audit history
- input/output VAT views
- reconciliation and exceptions
- periods, locking, and closing

### Phase C — Corrections and Filing

- cancellation, replacement, credit/debit notes
- filing, submission evidence, payment/refund/settlement
- export, print, and archive

### Phase D — Operational Governance

- health, recovery, monitoring, permissions, training, release, and long-term governance surfaces only where they provide real operational value

STEP 121–180 are guidance and recurring controls, not a requirement to create 60 separate screens.

## Backend Contract Gate

No frontend flow may invent a backend tax contract. Every backend-facing change must record:

- endpoint and method
- request/response schema
- lifecycle and failure codes
- affected POS surface
- compatibility impact

## Gates

- Gate A — Repository: module isolation, routes, public API, type/contracts, static review
- Gate B — Runtime: install, lint, tests, build
- Gate C — Operational: browser/mobile → API → tax authority → DB → projection → document/report

## Initial Execution Order

1. Inventory current tax invoice, purchase receipt, reporting, routes, and API usage
2. Freeze current visible behavior
3. Introduce isolated tax module skeleton
4. add compatibility read/print boundary
5. implement against verified backend contracts slice by slice
6. run browser and operational verification after each integrated capability

## Completion Rule

Frontend delivery is complete only when the operational tax lifecycle can be performed and audited without making Sales or Purchase own tax authority, while preserving existing POS workflows during transition.
