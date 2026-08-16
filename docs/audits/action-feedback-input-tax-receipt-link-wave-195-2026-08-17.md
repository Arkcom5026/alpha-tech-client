# Action Feedback Residual Audit — Wave 195

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-195`
Base: `feature/action-feedback-residual-wave-194`

## Scope

`src/features/tax/inputDocuments/hooks/useInputTaxReceiptWorkspaceController.js`

## Residual found

The Input Tax receipt-link workspace still used render-state-only mutation protection and combined persistence with post-success refresh in the same error boundary for four important flows:

- attach selected receipts to an input-tax document;
- create a manual input-tax document;
- reallocate an existing receipt link;
- cancel an existing receipt link.

The read helpers also swallowed their refresh outcome, so callers could not distinguish persistence failure from successful persistence followed by stale UI reconciliation. Async reads were not bound to the branch that owned the request.

## Changes

- Added synchronous `mutationRef` serialization across receipt-link mutations.
- Added `branchIdRef` current-context authority.
- Made receipt/document/link loaders return observable `{ ok, data/error, stale }` outcomes.
- Added immutable snapshots for branch, tax document, selected receipts, invoice, link allocation and cancellation reason before persistence.
- Separated persistence success feedback from reconciliation failure feedback.
- Added explicit partial-success events for attach, document create, reallocate and cancel.
- Suppressed stale writes when branch context changes after a request starts.
- Prevented manual workspace refresh and invoice edits while mutation ownership is active.

## Authority events

Examples:

- `input-tax-receipt:<taxDocumentId>:attach:success`
- `input-tax-receipt:<taxDocumentId>:attach:refresh:error`
- `input-tax-receipt:<taxDocumentId>:attach:context-changed:error`
- `input-tax-receipt:<documentId>:document:create:refresh:error`
- `input-tax-receipt:<linkId>:reallocate:refresh:error`
- `input-tax-receipt:<linkId>:cancel:refresh:error`

## Contract

`tests/input-tax-receipt-link-reconciliation-authority.contract.test.js`

The contract locks synchronous ownership, branch authority, observable loader outcomes, immutable command snapshots, and partial-success reconciliation events.

## Verification boundary

Git-side structural verification is complete for this wave. Local typecheck/build/runtime verification remains pending under the current Git-first workflow.
