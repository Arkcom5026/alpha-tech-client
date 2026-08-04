# Store Device Management UI — Parallel Wave

## Mission
Create the branch-scoped management workspace for gateways, printers and future store devices using mock/read-model contracts until server APIs are available.

## Required slices
- List store devices
- View gateway/device details
- View connection, authentication and heartbeat state
- View capabilities and assigned workstation
- View recent jobs/errors
- Register/rename/revoke intent contracts
- Empty, loading, offline and error states

## Invariants
- UI data is always scoped to the authenticated branch.
- No cross-store aggregation in normal store views.
- Destructive actions require explicit confirmation and server revalidation.
- Mock data must be visibly isolated from production API wiring.
- No credentials or proof material may be rendered.

## Verification
- Branch isolation UI contract tests.
- State projection tests.
- Revocation confirmation tests.
- Responsive desktop/mobile layout checks.
