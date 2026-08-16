# Action Feedback Residual Audit — Wave 185

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-185`
Base: `feature/action-feedback-residual-wave-184`

## Scope

Canonical owner inspected: `src/features/repair/components/RepairHandoverPanel.jsx`.

The panel owns the compound lifecycle that finalizes digital handover and then closes/reconciles the repair job.

## Residual found

The previous implementation already had a synchronous `savingRef`, entity-scoped ADS feedback, and explicit partial-success handling when handover finalization succeeded but close/reload failed.

The remaining authority gap was cross-job async context:

1. `getHandover(repairJobId)` responses were not sequenced. A response from Repair Job A could arrive after navigation to Repair Job B and overwrite B's handover/form state.
2. After `finalizeHandover(A)` succeeded, the code could continue into `onWorkflowAction({ action: 'CLOSE' })` even if the page had already moved to Job B. Because the callback itself is parent-owned, continuing after the context switch could target the wrong current workspace.
3. Non-throwing callback failures such as `{ ok: false }` were not treated as failures for close/reload reconciliation.
4. Mutation completion from an old job could write error/saving state into the newly selected job.

## Hardening applied

- Added `repairJobIdRef` as the current entity authority.
- Added `loadRequestRef` to sequence handover reads and discard stale responses.
- Reset local handover/form state when the repair job identity changes before loading the new entity.
- Bound finalization to `repairJobIdSnapshot`.
- After handover persistence succeeds, the flow verifies that the current page still owns the same repair job before invoking the automatic close callback.
- If context changed after persistence, the flow stops before close and reports dedicated partial success through `repair:handover:<jobId>:context-changed-after-finalize:error`.
- Close and parent reload callbacks now treat `false` and `{ ok: false }` as observable reconciliation failures in addition to thrown errors.
- State writes in success/error/finally are restricted to the job that still owns the workspace.

## Resulting lifecycle

`load snapshot -> request sequencing -> stale-response rejection`

and for persistence:

`handover snapshot -> finalize persistence -> verify same job context -> close/reload -> success or partial-success feedback -> owner-safe release`

This keeps an already successful handover from being replayed or misreported while preventing an automatic close from crossing into another repair job context.

## Contract

Added `tests/repair-handover-cross-job-authority.contract.test.js` to lock:

- current repair-job authority,
- request sequencing,
- stale read rejection,
- context-change stop before automatic close,
- non-throwing close/reload failure handling,
- entity-scoped partial-success events.

## Local verification

Pending under the current Git-first workflow. Run the contract, typecheck, build, and relevant repair suites after pulling the wave chain into Local.
