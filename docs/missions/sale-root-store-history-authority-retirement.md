# Sale Root Store History Authority Retirement

## Mission

Retire duplicated Sale History, Printable, Dashboard, and Settlement runtime ownership from the legacy root `salesStore.js` after the capability-based Sale History runtime has become the certified authority.

## Problem

`src/features/sales/store/salesStore.js` still imports history APIs and declares history/printable/settlement state and actions that overlap with the capability architecture under `src/features/sales/history/`. This creates dual runtime authority and preserves a hybrid migration state.

## Scope

- inventory all consumers of the legacy root history/printable/settlement surface
- retire duplicated imports, state, helpers, and actions only when consumer evidence permits
- preserve sale creation, cart, payment-entry, return, online conversion, and document-line responsibilities that still belong to the root store
- preserve current UI behavior and public store contracts through explicit compatibility where still required
- add a focused root-store retirement contract

## Architecture Goal

One runtime authority for each Sale History capability:

- Dashboard → `saleDashboardRuntimeCapability.js`
- History query/detail → `saleHistoryQueryRuntimeCapability.js`
- Printable search → `salePrintableRuntimeCapability.js`
- Settlement → `saleSettlementRuntimeCapability.js`

The legacy root store must not independently own those capabilities.

## Safety Boundaries

- no API route or response-shape changes
- no sale creation/cart/payment business-rule redesign
- no Return, Cancel/Void, online-order conversion, or document-line redesign
- no server, Prisma, migration, or production database changes
- do not delete a compatibility declaration until consumer references are proven absent or migrated
- Human Operational Test remains separate from repository and ALDE evidence

## Verification

- consumer-reference audit
- focused root-store history authority retirement contract
- existing Sale History Runtime Capability Separation contract
- Sale Settlement Runtime Capability and Error Authority contracts
- frontend typecheck, lint, production build, and `test:run`
- ALDE `SyncAndCertify` after merge

## Status

`IN PROGRESS` — discovery found duplicated root-store authority; consumer audit and implementation pending.
