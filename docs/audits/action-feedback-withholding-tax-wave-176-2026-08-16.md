# Action Feedback Residual Audit — Wave 176

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-176`
Scope: Withholding Tax workspace mutation / refresh authority

## Residual found

`WithholdingTaxWorkspacePage.jsx` already had a synchronous `mutationRef`, ADS success/error feedback, and a shared `run()` helper for treatment transitions, certificate issuance, filing preparation, and filing-evidence submission.

The remaining defect was post-success reconciliation visibility. `run()` executed the persistent command, emitted success, and then called `load()`. However `load()` handled refresh failures internally and returned no outcome. The mutation caller therefore could not distinguish:

- persistence succeeded and refresh succeeded; from
- persistence succeeded but the WHT workspace remained stale because refresh failed.

This is especially important for WHT transitions because users can otherwise repeat a treatment/certificate/filing action based on stale screen state.

## Changes

- `load()` now returns an observable `{ ok, data, error }` result while preserving existing read-error UI behavior.
- `run()` snapshots branch and tax-period authority before persistence.
- persistent work receives the immutable authority snapshots rather than reading route/store identity later.
- success feedback is emitted immediately after confirmed persistence.
- post-success `load()` is evaluated separately; a failed refresh emits a dedicated partial-success ADS event ending in `:refresh:error`.
- treatment item id, certificate expense/form identity, filing form type, and filing evidence reference are snapshotted before persistence.

## Outcome semantics

Persistence failure remains an action error.

Persistence success followed by refresh failure is now reported as:

> ดำเนินการ WHT สำเร็จแล้ว แต่รีเฟรชข้อมูล WHT ล่าสุดไม่สำเร็จ

The user is therefore told that the financial/tax transition already happened and that only the visible workspace may be stale.

## Contract

Added:

`tests/withholding-tax-partial-success-authority.contract.test.js`

The contract locks synchronous mutation ownership, observable refresh outcomes, immutable command authority, success-before-refresh ordering, dedicated partial-success feedback, and filing/certificate snapshots.

## Verification status

Git-side structural verification only. Local typecheck/build/runtime verification remains pending under the current Git-first workflow.
