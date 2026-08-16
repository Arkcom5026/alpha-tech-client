# Action Feedback Residual Audit — Wave 163

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-163`
Base: `feature/action-feedback-residual-wave-162`

## Scope

Canonical Order Online POS slip approval, rejection, and delete transitions.

## Residuals found

1. `OrderOnlinePosTable.jsx` referenced `approveOrderOnlineSlipAction`, while the canonical store exports `approveOrderOnlinePaymentSlipAction`. This could leave the table approval path without a valid action owner.
2. Table confirmation used React `runningAction` only, leaving a first-render gap before the UI disabled state committed.
3. Detail approval/rejection also relied on store render state without a synchronous component guard.
4. Store approval/rejection/delete placed persistence and post-success refresh in one failure boundary. A refresh failure after Server persistence could therefore be surfaced as if the transition itself failed.
5. Store mutation actions did not share an explicit transition owner, allowing conflicting persistent commands to race.

## Changes

- Added `mutationAction` as synchronous Zustand transition ownership.
- Snapshot identifiers/status before persistence.
- Corrected the table to use `approveOrderOnlinePaymentSlipAction`.
- Added component `actionRef` guards to table and detail owners.
- Separated approval/rejection/delete persistence failures from post-success refresh failures.
- Return `refreshError` as a partial-success outcome so the UI can first confirm persistence success and then report stale-view refresh failure separately.
- Added mutation-specific progress labels on the detail page.

## Verification contract

`tests/order-online-pos-transition-authority.contract.test.js` locks:

- shared store mutation ownership,
- canonical approval action naming,
- immutable command/id snapshots,
- first-render duplicate-submit protection,
- partial-success refresh semantics.

Local typecheck/build/full test verification remains pending until Local execution is available.
