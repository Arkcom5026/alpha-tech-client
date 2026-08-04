# Store Device Platform — Memory Handoff & Closure Record

## Purpose
This document is the mandatory bootstrap record for any future task that continues, integrates, merges, deploys, or operationally activates the Store Device / Local Print Bridge work. The implementation is substantial and may remain unused unless the next task explicitly reads and understands this record before acting.

## Current agenda status

- Development agenda: CLOSED
- Architecture and safety gates: COMPLETE
- Database persistence foundations: APPLIED
- Physical printer acceptance: NOT EXECUTED
- One-shot physical pilot: DEFERRED until the USB host `advice01` is online
- Production-wide WebSocket or physical execution: DISABLED

Do not claim that a physical print succeeded. No real print command was issued during this agenda.

## Core architecture delivered

The completed design establishes this flow:

`Print Snapshot -> Durable PRINT Job -> Gateway Session -> Lease -> Registered Device -> Adapter Execution -> Persisted Result -> Management Diagnostics`

Tenant rule: Alpha-Tech `Branch` means an independent store/tenant. Every Gateway, Session, Job, Lease, Result, Device, Workstation assignment, API projection, and diagnostic must remain scoped to the authenticated/current `branchId`. Cross-store access is denied and ownership must not leak.

## Server foundations

### Store Device persistence foundation
Migration:

- `20260804170000_store_device_persistence_foundation`

Applied successfully to the credential-bearing PostgreSQL target. Evidence recorded:

- source authority used for accepted migration evidence: `1d38e220d0f6d60869bcadb5193ff62f9c4d0f56`
- Prisma ledger applied at `2026-08-04 17:12:54 UTC`
- schema reported up to date
- 5 durable tables and 7 lifecycle enums
- branch-scoped indexes and composite foreign keys
- one-active-lease partial unique index
- revoked gateway/session lease rejection trigger
- append-only result trigger
- additive DDL only; no destructive or business-data rewrite statements
- pre-apply recovery bundle SHA-256: `11ce260e366d6a98b024deb964b6941e9283440f96892b2f58ae947fd5cc2caf`

### Durable Device Registry persistence
Migration:

- `20260805010000_store_device_registry_durable_persistence`

Applied successfully from exact source:

- `db956399e899c0798776e44b692dd9905a2cf25a`

Prisma reported 46 migrations and database schema up to date.

This adds durable branch-owned Device Registry and Workstation assignment state. It prevents gateway reassignment, denies cross-store access, and clears workstation assignment on revoke.

### Important server PRs / branches

- PR #285 — Store Device persistence foundation
- PR #289 — Durable Job API wave
- PR #300 — Device Registry & Workstation foundation and management API
- PR #302 — Durable Device Registry persistence

Future work must inspect current PR state and source ancestry before merge. Some PRs were stacked and must not be treated as independent main-based changes without verifying their bases.

## Client / Local Print Bridge foundations

Implemented and contract-tested capabilities include:

- Gateway registration identity contract
- signed protocol proof and canonical serialization
- authenticated outbound session and challenge
- protocol envelopes, replay protection, sequence ordering
- secure transport and WebSocket adapter boundaries
- mock and non-production authenticated process harnesses
- authenticated startup runtime
- durable execution engine, retries, dead-letter behavior
- adapter SDK
- immutable print profiles and dynamic receipt height
- management UI/API adoption
- offline queue and observability projections
- durable job binding
- print pipeline integration
- limited real-adapter pilot gate
- physical adapter runtime binding
- local Windows printer discovery
- local printer queue certification
- local printer host certification command

## Client PR #125 — Limited physical pilot

Branch:

- `feature/store-device-limited-real-adapter-pilot`

Latest accepted source at closure:

- `9cf7bde61b9bdd69f317075095bc51aaa0e8d4b9`

Later targeted-test fix source:

- `c539c9e2c954185897196e0a0cf9e1ebd3324f60`

Then host-certification command was added, restoring latest branch source to:

- `9cf7bde61b9bdd69f317075095bc51aaa0e8d4b9`

Future tasks must fetch the current remote HEAD instead of assuming either SHA remains current.

Targeted evidence passed:

- limited real-adapter pilot: 3/3
- physical pilot runtime integration: 2/2
- local printer queue certification: 3/3
- local printer host certification command: 1/1

Total focused gate: 9/9 PASS.

Full client suite failures observed during the agenda were primarily unrelated legacy/Vitest collection issues and unrelated storefront/product-template assertions. Do not use those unrelated failures to invalidate the Store Device targeted contracts; equally, do not claim the whole client suite passed.

## Physical pilot safety contract

Physical execution must remain disabled unless all exact authorities match:

- authenticated/configured `branchId`
- configured `gatewayId`
- configured registered `deviceId`
- durable `jobId`
- configured exact Windows printer ID
- non-revoked PRINTER device with print capability
- local Windows queue
- `queueAuthority = LOCAL_QUEUE`
- `isLocalQueue = true`
- not shared and not UNC
- RAW capable
- online and not work-offline
- explicit confirmation token

The runtime permits one active pilot job and deduplicates a completed job so the adapter is called only once.

Environment variables used by the opt-in pilot:

- `ALPHA_PRINT_BRIDGE_ENABLE_PHYSICAL_PILOT=1`
- `ALPHA_PRINT_BRIDGE_PILOT_BRANCH_ID`
- `ALPHA_PRINT_BRIDGE_PILOT_GATEWAY_ID`
- `ALPHA_PRINT_BRIDGE_PILOT_DEVICE_ID`
- `ALPHA_PRINT_BRIDGE_PILOT_PRINTER_ID`
- `ALPHA_PRINT_BRIDGE_PILOT_CONFIRMATION`

Do not enable these broadly or persist them until the host queue passes certification.

## Operational evidence and current blocker

On the current workstation, discovery found:

### EPSON TM-T82X Receipt

Identity:

- `windows:\\advice01\EPSON TM-T82X Receipt`

State:

- `SHARED_CONNECTION`
- `isLocalQueue = false`
- `isSharedConnection = true`
- `raw = false`
- online

This queue is correctly rejected and must never be used as a shortcut for the physical pilot.

### EPSON L3210 Series

State:

- local USB queue
- RAW projected true by current discovery logic
- offline / work-offline
- not the target 80 mm receipt printer

It is not an acceptable substitute for the TM-T82X pilot.

The actual USB host for TM-T82X is `advice01`, but that machine was offline at closure. Therefore host certification returned `STORE_DEVICE_QUEUE_NOT_FOUND` on the current machine, which is expected fail-closed behavior.

## Command to run when advice01 is online

Checkout the current PR #125 branch on `advice01`, then run from `tools/local-print-bridge`:

```powershell
$env:ALPHA_PRINT_BRIDGE_PILOT_PRINTER_ID = 'windows:EPSON TM-T82X Receipt'
$env:ALPHA_PRINT_BRIDGE_PILOT_DEVICE_ID = 'printer-front'
$env:ALPHA_PRINT_BRIDGE_PILOT_GATEWAY_ID = 'gw-store-2'

node .\scripts\certify-local-printer-host.mjs
```

Expected certification evidence:

- result PASS
- physicalExecution false
- printer ID exactly `windows:EPSON TM-T82X Receipt`
- port `TMUSB001`
- `LOCAL_QUEUE`
- RAW true
- online

Only after that evidence should a separately authorized one-shot physical print be considered. After one print, disable the pilot immediately and record the spool/result evidence. Do not turn this into production-wide execution implicitly.

## Mandatory bootstrap for future tasks

Before continuing this area, the next task must:

1. Read this document and PR #125 discussion.
2. Inspect current heads and stacked PR bases in both repositories.
3. Preserve branch/store isolation.
4. Preserve disabled-by-default physical execution.
5. Never use UNC/shared queue fallback.
6. Never claim physical acceptance without real host and spool evidence.
7. Distinguish completed development from deferred operational acceptance.
8. Reuse the existing architecture rather than rebuilding a parallel print path.

## Closure statement

The Store Device / Local Print Bridge development agenda is closed as implementation-complete and safety-gate-complete. The only deferred event is operational one-shot physical acceptance on `advice01` when that USB host is available. This is not an unresolved architecture task and must not cause future work to discard or unknowingly bypass the implementation.
