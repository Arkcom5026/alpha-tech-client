# Action Feedback Residual Audit — Wave 161

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-161`
Base: `feature/action-feedback-residual-wave-160`

## Scope

Wave 161 hardens the customer-deposit payment persistence boundary in `PaymentSectionDeposit.jsx`.

## Residual found

The deposit flow already emitted ADS success/error feedback and attempted to report refresh-after-create failure separately. However, the financial mutation still relied only on Zustand `isSubmitting`, leaving a first-render duplicate-submit gap.

The submitted customer identity, payment-method flags, and amounts were read from live component state. In addition, the post-success balance refresh was inside the same outer `try/catch` as the create mutation. If the refresh action threw after the server had already persisted the deposit, execution could fall into the create-error branch and incorrectly tell the operator that the deposit failed.

## Changes

- Added synchronous `submittingRef` mutation ownership plus render-visible local `submitting` state.
- Added `mutationBusy` combining local and store authority.
- Snapshotted customer identity and the complete financial command before persistence begins.
- Scoped create failure handling to the persistence call only.
- Kept server-confirmed success authoritative before any refresh begins.
- Isolated refresh-after-create errors so they report partial success instead of deposit failure.
- Kept payment amount inputs and submit control frozen while the financial boundary is owned.
- Preserved existing store actions and deposit semantics.

## Contract

Added `tests/customer-deposit-financial-mutation-authority.contract.test.js` to lock synchronous ownership, immutable command snapshots, financial editor freeze behavior, and separation of persistence failure from post-success refresh failure.

## Verification status

Git-side implementation complete. Local typecheck/build/test verification remains pending until the local workspace is available.
