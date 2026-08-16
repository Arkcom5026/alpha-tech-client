# Action Feedback Residual Audit — Wave 177

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-177`
Scope: Tax Publication Retry

## Residual found

`TaxPublicationRetryPage.jsx` already had success/error ADS feedback, but two authority gaps remained:

1. Retry commands used React `busy` state only. A second click in the same render tick could enter before the disabled state committed.
2. A successful publication retry immediately called `load()` inside the same `try/catch`. If the retry persisted successfully but the gap-list refresh failed, the flow could fall into the mutation error path and tell the user publication failed even though the Server had already accepted it.

The same pattern existed for both single-sale retry and retry-all.

## Wave 177 changes

- Added synchronous `mutationRef` ownership across the complete retry lifecycle.
- Snapshot the Sale id for single retry and the retry-all command before persistence.
- Made gap-list loading return an observable `{ ok, gaps, error }` result.
- Separated persistence outcome from read-after-success reconciliation.
- Success is now emitted immediately after the Server confirms publication.
- Refresh failures after success use dedicated `:refresh:error` ADS events and explicitly state that publication succeeded but the latest gap list could not be refreshed.
- Kept the interaction frozen until post-success reconciliation finishes.

## Contract evidence

Added:

`tests/tax-publication-retry-partial-success-authority.contract.test.js`

The contract locks:

- synchronous mutation ownership,
- immutable command identity,
- observable refresh outcome,
- persistence-before-refresh ordering,
- partial-success feedback for both single and bulk retry,
- lifecycle-safe ownership release.

## Scope discipline

No API route, Server behavior, schema, or tax publication policy changed. The Wave only hardens Client command authority and outcome communication.

## Verification status

Git-side source/contract/audit changes are complete. Local contract execution, typecheck, build, and runtime verification remain pending until Local execution is available.
