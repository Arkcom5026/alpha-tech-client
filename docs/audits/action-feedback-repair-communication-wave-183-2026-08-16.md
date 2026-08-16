# Action Feedback Residual Audit — Wave 183

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-183`
Base: `feature/action-feedback-residual-wave-182`

## Scope

Canonical owner: `src/features/repair/components/RepairCommunicationPanel.jsx`

Persistent mutation: recording a repair communication activity.

## Residual defect

The panel already had synchronous save ownership and post-save refresh feedback, but read authority was still tied to the current render implicitly.

If `repairJobId` changed while a preference/activity request was in flight, an older response could arrive later and overwrite the communication state for the newer repair job. The post-save refresh also called `load()` without binding the refresh explicitly to the job whose mutation had just been persisted.

This created a cross-job stale async-response risk: a valid Server result for job A could become visible inside job B's workspace.

## Hardening

- Added `repairJobIdRef` as current repair-job authority.
- Added monotonically increasing `loadRequestRef` ownership for reads.
- Snapshot the job id before every read and persistence command.
- Suppress stale read results when either the current job or request owner no longer matches.
- Bind post-save reconciliation to `repairJobIdSnapshot` rather than the latest prop value.
- Preserve persistence success independently from stale or failed reconciliation.
- Added entity-specific load, save and refresh feedback keys.
- Extended synchronous mutation locking to all interactive communication controls through `mutationBusy`.

## Outcome semantics

Persistence failure remains a record error.

Persistence success followed by a genuine refresh failure remains partial success.

A refresh result that is merely stale because the user moved to another repair job is suppressed rather than reported as an error for the new workspace.

## Regression contract

`tests/repair-communication-cross-job-authority.contract.test.js`

The contract locks current-job authority, request sequencing, stale-result suppression, immutable mutation identity, post-save snapshot refresh and synchronous interaction ownership.

## Verification status

Git-side source/contract/audit completed. Local contract execution, typecheck and build remain pending under the current Git-first workflow.
