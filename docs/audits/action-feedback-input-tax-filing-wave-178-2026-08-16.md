# Action Feedback Residual Audit — Wave 178

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-178`
Scope: Input Tax Filing Workspace

## Residual found

`InputTaxFilingWorkspacePage.jsx` already had synchronous `mutationRef` ownership and ADS success/error feedback, but two material outcome gaps remained.

1. `runMutation()` emitted success and then called `load()`. The loader caught refresh errors internally and returned no outcome, so a mutation could persist successfully while the screen stayed stale with no partial-success message.
2. `selectAllReady()` persisted documents sequentially. If several documents were selected successfully and a later request failed, the generic mutation error path did not preserve or communicate how many earlier documents had already been committed.

## Wave 178 changes

- Made workspace loading return an observable `{ ok, workspace, error }` result while preserving normal read-error feedback.
- Snapshot branch and tax-period authority before each mutation.
- Snapshot document ids, batch id, lifecycle target, removal reason/version, and the full ready-document command set before persistence.
- Keep success feedback authoritative as soon as the Server confirms persistence.
- Report read-after-success refresh failure separately with a dedicated `:refresh:error` event.
- Preserve `partialCompleted` evidence when bulk selection stops after one or more successful commits.
- Report bulk partial completion as a warning that includes the number of documents already added and stops the remaining loop to avoid accidental replay.
- Refresh after partial completion so the UI reconciles with the Server; if that refresh also fails, report a second dedicated partial-refresh warning.

## Contract evidence

Added:

`tests/input-tax-filing-partial-success-authority.contract.test.js`

The contract locks observable refresh results, synchronous mutation ownership, immutable command snapshots, dedicated post-success refresh feedback, completed-count preservation for bulk selection, and immutable removal reason authority.

## Scope discipline

No Server route, database schema, VAT eligibility policy, filing rule, or lifecycle transition contract changed. The Wave only hardens Client-side command authority and outcome communication.

## Verification status

Git-side source/contract/audit changes are complete. Local contract execution, typecheck, build, and runtime verification remain pending until Local execution is available.
