# Action Feedback Residual Audit — Wave 148

Date: 2026-08-16
Repository: `Arkcom5026/alpha-tech-client`
Branch: `feature/action-feedback-residual-wave-148`
Base: `feature/action-feedback-residual-wave-147`

## Scope

Wave 148 hardens the persistent lifecycle mutations owned by:

`src/features/repair/components/RepairSubcontractPanel.jsx`

The owner governs four server-persisted workflow transitions:

- send a repair job to an external subcontractor;
- update external repair quote/reference data;
- request the device back from the subcontractor;
- confirm that the device has physically returned to the shop and release the repair-workflow hold.

## Residual defect

Before Wave 148, these mutations shared a `runMutation` helper with React `loading` plus inline `notice/error` state. That provided visible local state, but did not provide the complete ADS persistent-action authority:

- no synchronous mutation ref protecting the first-render duplicate-submit gap;
- no ADS `actionSuccess` / `actionError` lifecycle outcome;
- mutable form state was read directly inside asynchronous request closures;
- conflicting form controls could remain editable during persistence;
- the shared wrapper did not distinguish action-specific progress.

## Hardening applied

Wave 148 adds:

1. `mutationRef` as the synchronous ownership gate for all subcontract lifecycle mutations.
2. `mutationBusy` and `mutationAction` as render-visible ownership/progress state.
3. Immutable snapshots for send, update, request-return, and receive-return payloads before transport begins.
4. ADS `feedback.actionSuccess` and `feedback.actionError` event keys scoped by repair job and lifecycle action.
5. A separate refresh-error outcome when persistence succeeds but the parent repair workspace callback fails.
6. Interaction freeze through `interactionLocked` and disabled fieldsets/buttons while one mutation owns the boundary.
7. Action-specific progress labels for send, update, request-return, and receive-return.
8. Existing inline notice/error presentation is retained as contextual feedback rather than acting as the sole persistent-action outcome.

## Contract coverage

Added:

`tests/repair-subcontract-lifecycle-mutation-authority.contract.test.js`

The contract locks:

- synchronous mutation ownership;
- ADS success/error authority;
- immutable payload snapshots;
- preservation of `REQUEST_RETURN` and `RECEIVE_RETURN` commands;
- global lifecycle-control freeze while a mutation is in flight;
- action-specific progress states.

## Verification status

Git-side source hardening and structural contract coverage are complete for Wave 148.

Local execution has not been run yet. When Local becomes available, the release gate must still run the targeted contract and the normal client verification workflow before merging to `main`.
