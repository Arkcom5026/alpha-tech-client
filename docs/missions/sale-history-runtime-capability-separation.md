# Sale History Runtime Capability Separation

## Mission

Separate Sale History runtime responsibilities into explicit capability owners while preserving the existing API contracts and user-visible behavior.

## Scope

- Extract dashboard overview aggregation from the history runtime slice.
- Extract sale list/detail query actions.
- Extract printable-sale query action.
- Keep settlement action behavior unchanged.
- Keep the current Zustand store surface backward-compatible.
- Add focused capability-separation contracts.

## Architecture Goal

Reduce `saleHistoryRuntimeSlice.js` from a mixed orchestration file into a compatibility composition boundary whose actions delegate to capability-owned modules.

## Safety Boundaries

- No API route or response-shape changes.
- No payment-status business-rule redesign in this increment.
- No Cancel/Void redesign.
- No printable document redesign.
- No production database or server changes.
- Human Operational Test remains separate from repository and ALDE evidence.

## Verification

- Focused contract for ownership and backward-compatible store surface.
- Frontend typecheck, lint, production build, and `test:run`.
- ALDE `SyncAndCertify` after merge.

## Status

`IN PROGRESS` — discovery complete; implementation pending.
