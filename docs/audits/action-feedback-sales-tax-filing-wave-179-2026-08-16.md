# Action Feedback Residual Audit — Wave 179

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-179`
Scope: Sales Tax Filing prepare / submit authority

## Residual found

`SalesTaxFilingPage.jsx` already exposed ADS success/error feedback and a confirmation before submitting a filing batch, but two authority gaps remained:

1. Prepare and submit commands relied on React `busy` state only, leaving a same-render-tick duplicate command window.
2. A successful prepare/submit immediately called `load()` inside the same `try/catch`. If Server persistence succeeded but the filing-list refresh failed, the flow could fall into the mutation error path and tell the user that prepare/submit failed even though the mutation had already committed.

The prepare command also read `branchId/year/month` directly across the async boundary instead of freezing command identity at dispatch time.

## Wave 179 changes

- Added synchronous `mutationRef` ownership across prepare/submit and post-success reconciliation.
- Made filing-list loading return an observable `{ ok, batches, error }` outcome while preserving initial read-error feedback.
- Snapshot branch/year/month before prepare persistence.
- Snapshot branch/batch id and batch period before submit persistence.
- Emit persistence success immediately after Server confirmation.
- Refresh failures after prepare/submit now use dedicated `:refresh:error` feedback and explicitly state that the mutation succeeded but the latest list could not be refreshed.
- Keep interaction frozen until reconciliation finishes.
- Disable period controls while mutation ownership is active.

## Contract evidence

Added:

`tests/sales-tax-filing-partial-success-authority.contract.test.js`

The contract locks synchronous ownership, immutable command snapshots, observable refresh outcome, persistence-before-refresh ordering, dedicated partial-success feedback, and owner-safe dialog release.

## Scope discipline

No API route, Server tax policy, schema, filing semantics, or document-selection logic changed. This Wave only hardens Client mutation authority and outcome communication.

## Verification status

Git-side source/contract/audit changes are complete. Local contract execution, typecheck, build, and runtime verification remain pending until Local execution is available.
