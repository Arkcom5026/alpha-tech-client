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

Status: **Repository implementation complete**

- module route and navigation
- API adapter and frontend contract normalization
- period selector
- headline, comparison, quality, distributions, recent documents
- loading/error/empty states

### Increment 2 — Document List and Detail

Status: **Repository implementation complete**

- TaxDocument list
- filters
- detail page
- source traceability and reconciliation display
- lifecycle/audit presentation

### Increment 3 — Filing Workspace and Period Authority

Status: **Readiness and period-authority UI complete; filing mutations deferred by backend HTTP contract gap**

- ready/selected/blocked/filed summaries
- period state and mutation-blocked warning
- existing close/reopen/lock/submit period UI preserved and integrated
- no browser-owned filing mutation authority

Deferred contract gap:

- no confirmed HTTP route/controller for select document, remove document, or mark filing batch filed
- corresponding UI mutation controls must not be enabled until the backend publishes an authoritative contract

### Increment 4 — Quality, Duplicate, and Replacement Operations

Status: **Read/review/drill-down UI complete; decision mutations deferred by backend HTTP contract gap**

- quality queues and counts
- blocker summary
- duplicate and replacement authority displayed through backend projections
- TaxDocument drill-down continuity

Deferred contract gap:

- no confirmed HTTP mutation contract for duplicate review decisions
- no confirmed HTTP mutation contract for replacement-chain edits
- the UI must not invent these actions or reproduce server fingerprint/chain rules

### Increment 5 — Integration and Operational Polish

Status: **Repository integration complete; runtime certification pending owner execution**

- finance navigation includes Control Center, document list, filing readiness, and quality review
- existing tax intake, receipt-link, and tax-period routes remain reachable
- route and public export wiring completed inside the tax module
- active-shop branch scoping retained across new API adapters and pages
- responsive layouts, loading, empty, error, and missing-branch states represented
- Repository Integration Review completed against PR changed-file scope
- owner-executable verification checklist documented below

## Repository Integration Review

### Changed Surface

- `src/features/tax/inputTaxControlCenter/**`
- `src/features/tax/inputTaxDocuments/**`
- `src/features/tax/inputTaxFiling/**`
- `src/features/tax/inputTaxQuality/**`
- `src/features/tax/index.js`
- `src/routes/partner/posPartnerRoutes.jsx`
- `src/config/sidebarFinanceItems.js`

### Navigation Continuity

New routes:

- `/:shopSlug/pos/finance/input-tax`
- `/:shopSlug/pos/finance/input-tax-documents`
- `/:shopSlug/pos/finance/input-tax-documents/:taxDocumentId`
- `/:shopSlug/pos/finance/input-tax-filing`
- `/:shopSlug/pos/finance/input-tax-quality`

Preserved routes:

- `/:shopSlug/pos/finance/tax-intake`
- `/:shopSlug/pos/finance/input-tax-receipts`
- `/:shopSlug/pos/finance/tax-periods`

### Authority Review

- Backend remains the authority for reconciliation, eligibility, duplicate, replacement, filing, and period transitions.
- Frontend calculations are presentation-only formatting and local list totals where no business decision is derived.
- Every new query requires the active branch context.
- Missing filing/duplicate/replacement mutation endpoints are recorded as explicit contract gaps rather than hidden behind mock behavior.
- No production deployment, merge, or runtime certification is implied by this review.

## Owner Runtime / Operational / Production Verification Checklist

Execute after checking out the PR branch or after explicit merge approval.

### A. Local Runtime Gate

1. Install dependencies using the repository-standard package manager.
2. Run configured lint checks.
3. Run configured frontend tests.
4. Run the production build.
5. Confirm no unresolved imports from the new tax module paths.
6. Confirm browser console has no render, hook, router, or request errors.
7. Run `git diff --check` against the reviewed head.

Record:

- Node and package-manager versions
- command outputs
- tested commit SHA
- pass/fail and any baseline failures unrelated to this agenda

### B. Authentication and Shop Scope

1. Sign in as an account with tax/report authority.
2. Select a valid branch.
3. Open all new Input Tax routes.
4. Switch branches and confirm every page reloads using the new branch ID.
5. Confirm no document from another branch appears.
6. Test an account lacking required authority and confirm server errors are rendered safely.

### C. Control Center

1. Open the Input Tax Control Center.
2. Verify `DOCUMENT`, `RECEIVED`, `CLAIM`, and `FILED` period views.
3. Change date ranges and confirm KPI, quality, readiness, and recent-document data refresh together.
4. Verify loading, empty, and backend-error states.
5. Compare a sample KPI against the backend response or database authority.

### D. TaxDocument List and Detail

1. Open the list and exercise status and document-type filters.
2. Open at least one document detail.
3. Confirm document identity, amounts, supplier tax ID, source/candidate, reconciliation, and lifecycle events.
4. Verify malformed or cross-branch document IDs are rejected safely.
5. Confirm back navigation returns to the list without breaking the shop-scoped route.

### E. Filing and Period Authority

1. Open Filing Readiness and compare counts/amounts with the Control Center.
2. Confirm CLOSED, LOCKED, or SUBMITTED periods display mutation-blocked guidance.
3. Open Tax Period Management.
4. Exercise supported close/reopen/lock/submit transitions only in a safe test period.
5. Confirm every period mutation refreshes from the server.
6. Do not expect select/remove/file batch buttons until the backend HTTP filing contract is implemented.

### F. Quality, Duplicate, and Replacement Review

1. Open Quality Center and verify missing tax ID, missing number, duplicate risk, replacement, and attention counts.
2. Verify blocker summaries and VAT values.
3. Search recent documents and drill into TaxDocument detail.
4. Confirm duplicate/replacement data shown matches backend projections.
5. Do not expect review-decision mutations until authoritative endpoints are implemented.

### G. Compatibility

1. Confirm Tax Intake remains reachable and functional.
2. Confirm Input-tax Receipt Links remains reachable and functional.
3. Confirm Tax Period Management remains reachable and functional.
4. Check existing bookmarks for these routes.
5. Verify unrelated Finance pages and sidebar entries remain unaffected.

### H. Production Verification

1. Confirm the deployed frontend commit SHA equals the approved merge commit.
2. Confirm the deployed backend contains server PR #77 authority.
3. Verify API base URL and authentication token handling.
4. Run one read-only pass across all new routes using real production data.
5. Perform period mutation tests only with an explicitly approved safe period.
6. Capture screenshots, network evidence, console output, and affected branch/period/document IDs.
7. Report any data mismatch before enabling additional tax operations.

## Definition of Done

Repository Complete requires:

- all five increments represented in this Draft PR
- frontend contracts aligned with current backend responses
- no browser-owned duplicate, eligibility, filing, or period business authority
- active-shop isolation on every query and mutation
- existing tax workflows remain reachable
- runtime and production verification checklist documented
- all known backend HTTP contract gaps explicitly recorded

Runtime Complete additionally requires owner evidence that configured lint, tests, and build pass.

Operational Complete additionally requires browser-to-API verification across the new routes using an authorized branch context.

Production Complete additionally requires deployed commit authority and production evidence.

## Merge Policy

- Keep the PR Draft until Repository Complete is reviewed.
- Do not deploy from the working branch.
- Merge only after explicit product-owner approval.
- Runtime, Operational, and Production verification remain separate gates and must not be implied by repository review.

## Out of Scope

- changing backend tax business rules without an explicit contract gap
- inventing frontend filing, duplicate, or replacement mutations
- production database migration
- redesigning purchase order or quick receipt workflows
- output-tax UI work
- generic finance dashboard redesign
- unrelated shared-component refactoring
