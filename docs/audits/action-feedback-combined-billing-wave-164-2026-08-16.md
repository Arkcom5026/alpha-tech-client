# Action Feedback Residual Audit — Wave 164

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-164`
Base: `feature/action-feedback-residual-wave-163`

## Scope

Canonical owner audited:

- `src/features/combinedBilling/pages/CombinedBillingPage.jsx`

Persistent action:

- confirm Document Workspace / create consolidated delivery document and hand off to existing Bill/Tax flow

## Residual found

The page already had ADS success/error feedback and the store rejected a second confirmation while its shared `loading` flag was active. However, the UI boundary still depended on render-visible state only, and the selected customer/lines/prices were read directly while the command was being assembled.

More importantly, successful persistence and the two post-create reads (`loadDocumentWorkspaceAction` and `loadHistoryAction`) lived in the same `try/catch`. A refresh exception after the server had already created the consolidated document therefore fell into the generic `combined-billing:create:error` outcome.

## Hardening

Wave 164 adds:

- synchronous `confirmRef` ownership at the UI boundary;
- render-visible `confirming` state combined with store loading as `mutationBusy`;
- immutable `customerIdSnapshot` and `command` before persistence;
- freeze of selection, final price, adjustment reason, note and submit controls for the full create lifecycle;
- mutation-specific progress copy;
- server-confirmed success before post-create refresh;
- separate partial-success feedback when workspace/history refresh fails after persistence.

The persistence error event remains `combined-billing:create:error`. Post-success read failure now uses `combined-billing:<document>:refresh-after-create:error` and explicitly states that the consolidated delivery document was already created.

## Contract evidence

Added:

- `tests/combined-billing-create-partial-success-authority.contract.test.js`

The contract locks synchronous ownership, immutable command construction, conflicting-control freeze, and the ordering `persistence success -> refresh -> partial-success feedback`.

## Verification status

Git-side implementation and diff audit completed. Local typecheck/build/test verification remains pending until Local execution is available.
