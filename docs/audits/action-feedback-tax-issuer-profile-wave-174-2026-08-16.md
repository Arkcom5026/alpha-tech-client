# Action Feedback Residual Audit — Wave 174

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-174`

## Scope

Tax issuer profile branch authority in `src/features/tax/issuerProfile/pages/TaxIssuerProfilePage.jsx`.

## Residual found

The workspace already had synchronous `savingRef`, immutable save payload snapshots, ADS success/error feedback, and disabled form controls while saving.

A branch-identity race remained around asynchronous reads and saves:

- profile reads were not cancelled/ignored when the selected branch changed before the request completed;
- a stale read could overwrite the form for the newly selected branch;
- a save was correctly sent with a branch snapshot, but its response could still overwrite the form after the user had switched to another branch;
- feedback event keys were generic and did not identify which branch owned the outcome.

This is particularly sensitive because issuer profile values control tax-document identity and numbering policy for each branch.

## Hardening

- Added `branchIdRef` as render-current branch authority.
- Snapshot branch id for every async load and save command.
- Added active-request cleanup and current-branch checks before reconciling read results.
- Save responses reconcile into the visible form only while the same branch remains active.
- If the save succeeds after the user changes branch, ADS confirms that the previous branch was saved without overwriting the new branch workspace.
- Load/save feedback keys now include the branch id.
- Existing `savingRef`, payload snapshot, and control freeze behavior remain unchanged.

## Contract

Added `tests/tax-issuer-profile-branch-authority.contract.test.js` to lock:

- render-current branch ref;
- immutable branch snapshots;
- stale async read suppression;
- save-result reconciliation guard;
- branch-aware success wording;
- branch-specific ADS event identities.

## Verification status

Git-side implementation complete. Local contract/typecheck/build verification remains pending until the local verification workflow is available.
