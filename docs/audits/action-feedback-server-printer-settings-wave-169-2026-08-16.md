# Wave 169 — Server Printer Settings mutation / refresh authority

## Scope

Canonical owner: `src/features/printing/settings/ServerPrinterSettingsPanel.jsx`.

## Residual found

The shared `perform()` helper placed each persistent printer-settings mutation and the subsequent `load()` refresh in the same error boundary. A successful route/profile/device mutation followed by a refresh failure could therefore be reported through the persistence failure path. The panel also relied on render-visible `status`/`busy` only, leaving a first-render gap for repeated commands.

## Changes

- added synchronous `actionRef` ownership for settings mutations and printer test commands;
- made `load()` return an observable `{ ok, error }` result while preserving existing read feedback;
- snapshot mutation commands before persistence;
- changed `perform()` to announce server-confirmed persistence success before refresh;
- classified refresh-after-success failure with `:refresh:error` rather than the persistence `:error` key;
- preserved the destructive route-disable confirmation;
- serialized printer test against settings mutations and snapshot its command before sending.

## Contract

`tests/server-printer-settings-mutation-authority.contract.test.js` locks synchronous ownership, observable refresh outcomes, immutable command snapshots, and persistence-success-before-refresh semantics.

## Verification status

Git-side implementation complete. Local typecheck/build/test verification remains pending until Local execution is available.
