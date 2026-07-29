# Input Tax Control Center UI Agenda

## Mission

Deliver the frontend operating surface for the completed backend Input Tax agenda. The UI must make TaxDocument-centric reconciliation, quality review, eligibility, filing readiness, filing authority, and period control usable by finance staff without falling back to receipt-centric interpretation.

## Repository Authority

- Frontend repository: `Arkcom5026/alpha-tech-client`
- Base branch: `main`
- Starting main SHA: `6c59421a2e37a4c6d88e490a25d377c7b12f9113`
- Backend authority: server PR #77 merged to `main` at merge commit `db7130094e9e1a36ecc64f93d55a56a31b19e570`
- Working branch: `feature/input-tax-control-center-ui`
- One agenda = one Draft PR working area

## Existing Frontend Foundation

The repository already contains:

- tax intake workspace
- input-tax receipt-link workspace
- tax-period management
- legacy input-tax report surface
- finance sidebar routes for tax intake, input-tax tracking, and tax periods

The new work must integrate these foundations rather than create a second unrelated tax module.

## Product Goal

Create one coherent Input Tax Control Center where staff can answer:

1. What input-tax documents exist in this shop and period?
2. Which documents are complete, claimable, blocked, duplicated, replaced, selected, or filed?
3. Why is a document not ready?
4. Which filing period is open, closed, locked, submitted, or reopened?
5. What action is safe and permitted next?

## Architecture Goal

- The tax module owns its pages, components, API adapters, contracts, state, and workflow-specific presentation.
- Do not move tax workflow components into generic shared/common folders.
- Use neutral shared primitives only when they are already established and do not carry tax-domain meaning.
- Treat backend contracts as authority; do not rebuild eligibility, duplicate, replacement, filing, or period rules in the browser.
- Every mutation must revalidate from the server and render server failure codes as actionable Thai messages.
- Scope all reads and actions to the active shop/store context.

## Complete Scope

### 1. Input Tax Control Center

Primary module landing page containing:

- selected filing period
- period state and permitted actions
- headline KPI cards
- month-over-month comparison
- quality indicators
- eligibility and filing-readiness distribution
- document-type and source-type summaries
- recent documents
- drill-down links preserving the selected period and filters

### 2. Tax Document List

TaxDocument-centric table with:

- invoice/document number
- supplier
- document date
- received date
- claim period
- filed period
- taxable amount, VAT, and total
- reconciliation state
- eligibility state and reason
- duplicate state
- replacement state
- filing state
- source linkage

Required capabilities:

- search
- period-view switching: document / received / claim / filed
- status and quality filters
- pagination
- empty, loading, error, and stale-data states
- shop-scoped URLs and requests

### 3. Tax Document Detail

One document authority view containing:

- document identity and financial values
- supplier identity and tax ID quality
- source traceability to PO, quick receipt, or other source
- receipt allocation/reconciliation
- eligibility decision and reasons
- duplicate evidence and review state
- replacement chain
- filing selection and filing history
- lifecycle/audit events when available

### 4. Filing Workspace

Operational surface for preparing one filing period:

- ready documents
- selected documents
- deferred or blocked documents
- filed documents
- select/remove actions where allowed
- totals recalculated from server authority
- mutation guards when the period is closed, locked, or submitted
- clear reason for every disabled action

### 5. Period Control

Integrate and elevate the existing tax-period UI to support:

- open period
- close period
- reopen period
- locked/submitted read-only behavior
- confirmation dialogs with business impact
- authoritative refresh after mutation

### 6. Quality Center

Focused queues for:

- missing supplier tax ID
- missing document number
- missing source
- allocation mismatch
- duplicate risk
- replacement conflict
- other backend quality signals

Each queue must drill down to the affected TaxDocument list and detail.

### 7. Duplicate and Replacement Review

- display duplicate evidence supplied by the backend
- allow supported review decisions without reproducing fingerprint logic in the UI
- display predecessor/successor replacement chain
- prevent superseded documents from appearing as independently claimable

### 8. Navigation and Compatibility

- introduce a clear `ภาษีซื้อ` / Input Tax Control Center entry in the finance navigation
- preserve existing tax intake, receipt-link, and tax-period routes during migration
- redirect or link legacy input-tax report users into the new control center where appropriate
- avoid breaking existing bookmarked URLs

## Delivery Increments

### Increment 1 — Control Center Foundation

- module route and navigation
- API adapter and frontend contract normalization
- period selector
- headline, comparison, quality, distributions, recent documents
- loading/error/empty states
- contract-focused tests

### Increment 2 — Document List and Detail

- TaxDocument list
- filters and period-view switching
- detail drawer/page
- source traceability and status explanations

### Increment 3 — Filing Workspace and Period Authority

- ready/selected/blocked/filed queues
- selection/removal mutations
- close/reopen integration
- mutation guards and server revalidation

### Increment 4 — Quality, Duplicate, and Replacement Operations

- quality queues
- duplicate review
- replacement-chain visualization
- drill-down continuity

### Increment 5 — Integration and Operational Polish

- navigation migration
- legacy compatibility
- permissions
- responsive behavior
- accessibility
- repository integration review
- owner-executable runtime and production verification checklist

## Definition of Done

Repository Complete requires:

- all five increments represented in this Draft PR
- frontend contracts aligned with current backend responses
- no browser-owned duplicate, eligibility, filing, or period business authority
- active-shop isolation on every query and mutation
- existing tax workflows remain reachable
- focused tests pass
- build/lint/type checks pass where configured
- `git diff --check` passes
- runtime and production verification checklist is documented

## Merge Policy

- Keep the PR Draft while the agenda is incomplete.
- Do not merge intermediate increments separately.
- Do not deploy from the working branch.
- Merge only after Repository Complete and explicit product-owner approval.
- Runtime, Operational, and Production verification remain separate gates and must not be implied by repository review.

## Out of Scope

- changing backend tax business rules without an explicit contract gap
- production database migration
- redesigning purchase order or quick receipt workflows
- output-tax UI work
- generic finance dashboard redesign
- unrelated shared-component refactoring
