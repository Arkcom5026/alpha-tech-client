# Action Feedback Residual Audit — Wave 173

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-173`
Scope: VAT carry-forward confirmation authority

## Residual found

`VatCarryForwardAuthorityPanel.jsx` already had synchronous `savingRef`, ADS success/error feedback, and a post-confirm callback error path. However, two authority gaps remained:

1. mutation ownership was released in the `finally` block immediately after `confirmVatCarryForwardAuthority()` returned, before success feedback and post-success refresh completed;
2. the local `load()` helper swallowed refresh failures, so a successful persistence followed by a failed Authority refresh could not be represented as partial success.

This could allow another confirmation command to begin while the first command was still reconciling UI state, and could leave stale Authority data without an explicit post-success warning.

## Changes

- Keep `savingRef` and render-visible `saving` ownership through persistence, local Authority refresh, and parent settlement refresh.
- Snapshot `branchId` and `taxPeriodId` before persistence and use the snapshots in command/event identity.
- Make `load()` return an observable `{ ok, data, error }` result while preserving its existing UI error reporting behavior.
- Emit persistence success before refresh.
- Emit a dedicated partial-success event when the Authority refresh fails after persistence has already succeeded.
- Keep the existing parent `onConfirmed` partial-success path, but bind its event key to the same authority identity.

## Outcome authority

Persistence failure:
- `tax-vat-carry-forward:<branchId>:<taxPeriodId>:confirm:error`

Persistence success:
- `tax-vat-carry-forward:<branchId>:<taxPeriodId>:confirm:success`

Authority refresh failure after success:
- `tax-vat-carry-forward:<branchId>:<taxPeriodId>:refresh:error`

Related settlement refresh failure after success:
- `tax-vat-carry-forward:<branchId>:<taxPeriodId>:post-confirm:error`

## Verification added

`tests/vat-carry-forward-partial-success-authority.contract.test.js`

The contract locks:
- synchronous mutation ownership;
- immutable authority identity snapshots;
- observable refresh outcome;
- persistence-success-before-refresh ordering;
- dedicated partial-success feedback;
- no early ownership release before reconciliation finishes.

Local runtime verification remains pending under the current Git-first workflow.
