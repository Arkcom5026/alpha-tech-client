# Sale Settlement Runtime Capability Extraction

## Mission

Extract Sale Settlement runtime ownership from `saleHistoryRuntimeSlice.js` into an explicit capability module while preserving the existing API contract, projector behavior, and Zustand store surface.

## Scope

- Create an explicit Sale Settlement runtime capability owner.
- Move `markSalePaidAction` into the capability module without behavior changes.
- Keep `saleHistoryRuntimeSlice.js` as a compatibility composition boundary.
- Preserve `markSaleAsPaid`, `projectSaleSettlementSuccess`, and `projectSaleSettlementFailure` behavior.
- Preserve the existing Sale Settlement Error Authority contract.
- Add a focused ownership/delegation contract.

## Architecture Goal

Complete the Sale History runtime capability separation so the composition slice owns no feature-specific execution logic and only composes capability owners.

## Safety Boundaries

- No API route or response-shape changes.
- No payment-status business-rule redesign.
- No settlement result projection redesign.
- No Cancel/Void redesign.
- No server, Prisma, or production database changes.
- Human Operational Test remains separate from repository and ALDE evidence.

## Verification

- Focused Sale Settlement runtime capability contract.
- Existing Sale Settlement Error Authority contract.
- Frontend typecheck, lint, production build, and `test:run`.
- ALDE `SyncAndCertify` after merge.

## Status

`IN PROGRESS` — mission opened; implementation pending.
