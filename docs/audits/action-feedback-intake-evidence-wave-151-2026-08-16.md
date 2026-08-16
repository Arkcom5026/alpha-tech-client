# Action Feedback Residual Audit — Wave 151

Date: 2026-08-16

## Owner

`src/features/repair/components/IntakeEvidencePanel.jsx`

## Residual finding

The intake-evidence save path already had ADS success/error feedback and correctly preserved a retry draft after repair intake partial success. However, the persistent save still relied on the React `loading` state as its only duplicate-submit boundary. A second invocation could enter before the loading render committed.

The post-save `onSaved` refresh callback was already separated from the persistence catch path, but refresh failure used a generic warning rather than an action-scoped partial-success event.

## Wave 151 hardening

- Added synchronous `savingRef` ownership for the persistent evidence mutation.
- Added a render-visible `saving` state distinct from initial/read loading.
- Snapshot `repairJobId`, draft values, and consent-write authority before persistence.
- Freeze edit/cancel/form controls while the save owns the boundary.
- Preserve the existing server-confirmed success outcome before parent refresh.
- Report parent-refresh failure as an ADS `actionError` with an explicit partial-success message and event key.
- Preserve the established rule that retrying evidence does not create a second repair job.

## Contract

`tests/repair-intake-evidence-mutation-authority.contract.test.js`

The contract locks synchronous ownership, immutable snapshots, ADS save outcomes, partial-success refresh feedback, and UI freeze behavior.

## Verification status

Git-side structural implementation is complete. Local `npm run verify` remains pending until Local execution is available.
