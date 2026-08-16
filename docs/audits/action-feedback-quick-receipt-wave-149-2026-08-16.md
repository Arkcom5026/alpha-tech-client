# Action Feedback Residual Audit — Wave 149

Date: 2026-08-16

## Scope

Owner: `src/features/receiving/quick-stock/session/useQuickReceiptSessionController.js`

This wave continues from `feature/action-feedback-residual-wave-148` and hardens Quick Receipt session mutations that already had ADS outcomes but still had two residual authority defects:

1. React `isBusy` was the only duplicate-submit guard, leaving a first-render gap before the disabled UI could commit.
2. `refreshDrafts()` ran inside the main mutation `try` block after server persistence. If the refresh failed, the outer catch reported the whole save/finalize/cancel operation as failed even though persistence had already succeeded.

## Changes

- Added synchronous `busyRef` ownership for save-for-later, finalize, resume, server-line delete, and draft cancellation.
- Extended conflicting local edit guards to also respect `busyRef.current`.
- Snapshotted draft/receipt/item identifiers before asynchronous work where applicable.
- Preserved existing ADS success/error event keys for true mutation outcomes.
- Split post-success draft refresh failures into explicit partial-success feedback:
  - save succeeded but draft list refresh failed;
  - stock receipt finalized successfully but draft list refresh failed;
  - cancellation succeeded but draft list refresh failed.
- Upgraded resume-draft failure from generic `feedback.error` to keyed `feedback.actionError`.

## Why this matters

A refresh failure must not tell the operator that a persistence operation failed after the server has already committed it. In inventory workflows this can cause unsafe retries, duplicated operational actions, or loss of confidence in the stock state.

The synchronous ref also closes the event-loop window where two rapid interactions could enter the same mutation before React committed `isBusy=true`.

## Contract

Added:

`tests/quick-receipt-partial-success-mutation-authority.contract.test.js`

The contract locks:

- synchronous mutation ownership;
- stable identifier snapshots;
- distinct partial-success refresh messages and event keys;
- action-level feedback for resume failures.

## Verification status

Git-side implementation and structural contract are complete. Local `npm run verify` has not yet been executed and remains required before integration into `main`.
