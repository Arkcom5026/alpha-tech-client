# Action Feedback Residual Audit — Wave 156

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-156`
Base: `feature/action-feedback-residual-wave-155`

## Scope

Wave 156 hardens Unit create/edit persistence boundaries.

## Residual found

`CreateUnitWorkspace.jsx` and `EditUnitWorkspace.jsx` already emitted ADS success/error feedback, but both relied only on React `isSubmitting` state. A fast second submit could enter before the disabled render committed. The submitted form values and route identifiers were also read directly from live values at mutation time.

`UnitForm.jsx` disabled only the submit button while saving, leaving the name field mutable during an in-flight request.

## Changes

- Added synchronous `submittingRef` ownership to both create and edit flows.
- Added immutable payload snapshots before persistence starts.
- Edit now snapshots unit id and shop slug and uses unit-specific ADS event keys.
- Unit form input and fieldset are frozen while persistence is in flight.
- Existing Unit store actions and navigation semantics are preserved.

## Contract

Added `tests/unit-create-edit-mutation-authority.contract.test.js` to lock synchronous duplicate-submit protection, stable snapshots, ADS event keys, and form freeze behavior.

## Verification status

Git-side implementation complete. Local typecheck/build/test verification remains pending until the local workspace is available.
