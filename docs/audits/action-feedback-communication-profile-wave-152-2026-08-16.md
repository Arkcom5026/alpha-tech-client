# Action Feedback Residual Audit — Wave 152

Date: 2026-08-16

## Owner

`src/features/communication/pages/CommunicationProfileSettingsPage.jsx`

## Residual defect

Communication profile persistence already had synchronous `savingRef`, immutable payload construction, frozen conflicting controls, and ADS success/error feedback. The remaining defect was the post-save refresh boundary.

`saveCommunicationProfile(payload)` and the subsequent `load()` refresh lived inside the same outer `try`. If the server saved the profile successfully but the refresh request failed, execution fell into the mutation `catch` and could tell the user that saving the communication profile failed even though persistence had already succeeded.

This is a partial-success authority defect and can encourage duplicate save attempts against an already-persisted profile.

## Hardening

Wave 152 keeps the existing persistence semantics and adds explicit post-success refresh authority:

- `load()` now returns a structured `{ ok, error, message }` result while preserving inline read-error state;
- server-confirmed save success is emitted before refresh begins;
- post-save refresh failure emits a distinct ADS action error stating that the profile was saved successfully but the list refresh failed;
- mutation failures retain their existing `:save:error` authority;
- synchronous `savingRef`, payload snapshot, and interaction freeze remain unchanged.

## Contract

`tests/communication-profile-partial-success-authority.contract.test.js`

The contract locks:

- synchronous mutation ownership;
- immutable save payload;
- server-confirmed success authority;
- distinct save-error and refresh-error event keys;
- ordering that refresh occurs only after save success;
- wording that preserves the successful persistence outcome when refresh fails.

## Verification status

Git-side structural implementation is complete. Local `npm run verify` remains pending before integration into `main`.
