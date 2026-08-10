# ALPHA-TECH Input Tax 10/10 — Step 10B FE Gap Closure

## Scope

This increment consumes the Step 10A backend contract without recreating tax business rules in the client.

## Verified frontend surfaces

### Input VAT Report — AVAILABLE

- Route/page exists: `src/features/tax/inputVatReport/pages/InputVatReportPage.jsx`.
- API adapter exists: `src/features/tax/inputVatReport/api/inputVatReportApi.js`.
- Runtime endpoint used by the adapter is `/input-tax-reports` relative to the shared API base.
- The report renders the backend authority marker (`INPUT_VAT_RECORD`) and keeps legacy compatibility rows distinguishable.
- Step 10B now maps backend machine error codes to Thai actionable messages using `src/features/tax/contracts/inputTaxErrorMessages.js`.
- The page no longer treats `response.data.message` as the frontend business contract.

## Shared Input Tax error contract

`src/features/tax/contracts/inputTaxErrorMessages.js` is the client handoff layer for known backend error codes. It intentionally maps codes only; it does not duplicate reconciliation, eligibility, filing, period, duplicate, replacement, or VAT calculation rules.

Important mappings include:

- `INPUT_TAX_FILING_RECONCILIATION_REQUIRED`
- `INPUT_TAX_FILING_ELIGIBILITY_REQUIRED`
- `INPUT_TAX_DOCUMENT_ALREADY_IN_FILING`
- `INPUT_TAX_STALE_VERSION`
- `INPUT_TAX_FILING_STALE`
- `TAX_PERIOD_STALE_VERSION`
- `INPUT_TAX_REASON_REQUIRED`
- `INPUT_TAX_DECISION_REASON_REQUIRED`
- `INPUT_TAX_PERIOD_MUTATION_BLOCKED`
- `INPUT_TAX_REPORT_RANGE_TOO_LARGE`
- `INPUT_TAX_REPORT_RESULT_TOO_LARGE`
- branch/access/actor errors for links, filing, overview and decisions

Fallback text is local Thai UI wording and does not parse backend English text.

## Disabled-action contract

The client must not infer tax eligibility from totals, VAT rate, document status combinations, duplicate/replacement chains, or reconciliation arithmetic.

When future Input Tax action surfaces are wired, disabled state must come from backend projections such as `canApprove`, `canSelectForFiling`, `availableActions`, explicit reason codes, or a dedicated disabled-reason projection. If the backend does not expose a reason yet, the surface remains a documented gap instead of recreating the rule in the browser.

The current Input VAT Report has no high-impact mutation button. Its only disabled state is the refresh button while the read request is already in flight; its tooltip explains that local transient UI state.

## Concrete frontend gaps still open after repository discovery

The current client repository does not expose verified dedicated Input Tax UI/API modules for all Step 10A server surfaces. The following remain FE gaps until a concrete client surface is implemented and verified:

- Input Tax Overview / executive control view
- Tax Document detail + lifecycle actions dedicated to Input Tax
- Receipt linking/reconciliation workspace
- Filing workspace (select/remove/submit)
- Duplicate/replacement decision workspace
- Tax Period lifecycle workspace dedicated to Input Tax operations
- Accounting-office/audit package surface
- Investigation workspace
- Filing simulation workspace
- Supplier Tax Health surface

This list is a discovery result, not permission to create placeholder pages. Each surface must be implemented as a usable E2E slice against the Step 10A backend contract.

## Compatibility

- The existing `/reports/inputtax` route/page remains the current Input VAT report surface.
- No legacy Input VAT report authority is removed.
- No VAT percentage is hardcoded in this increment.
- No stock, inventory, payment, or Prisma change is introduced.

## Evidence

- `tests/input-tax-step-10b-error-mapping.contract.test.js`
- `src/features/tax/contracts/inputTaxErrorMessages.js`
- `src/features/tax/inputVatReport/pages/InputVatReportPage.jsx`

Runtime/typecheck/build execution is deferred to the local Runtime Gate under the agreed Git-first workflow.
