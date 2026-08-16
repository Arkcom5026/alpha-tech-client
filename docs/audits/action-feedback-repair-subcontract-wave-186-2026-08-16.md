# Wave 186 — Repair Subcontract reconciliation authority

## Scope

Residual audit of `src/features/repair/components/RepairSubcontractPanel.jsx` after the earlier subcontract lifecycle hardening.

## Finding

The panel already had mutation serialization, immutable command snapshots, ADS success/error feedback, and parent refresh handling. Two residual authority gaps remained:

1. `load()` swallowed subcontract-context refresh failures and returned no outcome. After persistence succeeded, `runMutation()` therefore could not distinguish a successful mutation followed by a failed context refresh.
2. Mutation commands snapshot `job.id`, but feedback/reconciliation still depended on the live `job` prop. If the workspace changed to another repair job after persistence, the old mutation could continue into refresh or parent reconciliation under the wrong entity context.

## Change

- Added `jobIdRef` as current repair-job authority.
- Included the synchronous mutation ref in `interactionLocked`.
- Made `load()` return observable `{ ok, data/error, stale }` outcomes and suppress stale writes when the repair-job identity changes.
- Bound `runMutation()` to an immutable `jobIdSnapshot` for event identity and reconciliation.
- Added explicit partial-success feedback for:
  - repair-job context changing after subcontract persistence;
  - subcontract context refresh failing after persistence;
  - parent repair-job reconciliation failing, including non-throwing `{ ok: false }` / `false` outcomes.
- Made post-success local form resets owner-safe so an old mutation does not mutate the UI for a newly selected repair job.

## Evidence keys

- `repair:subcontract:<jobId>:<key>:success`
- `repair:subcontract:<jobId>:<key>:context-changed:error`
- `repair:subcontract:<jobId>:<key>:context-refresh:error`
- `repair:subcontract:<jobId>:<key>:refresh:error`
- `repair:subcontract:<jobId>:<key>:error`

## Contract

`tests/repair-subcontract-reconciliation-authority.contract.test.js`

The contract locks current-job authority, observable refresh outcomes, immutable mutation ownership, partial-success event separation, non-throwing parent refresh failure handling, and owner-safe post-success reconciliation.

## Local verification

Pending under the current Git-first workflow. Run the contract plus the normal client typecheck/build suite after merging the feature branch into local `main`.
