# Missing Cost Resolution — Frontend E2E Workflow

Related issue: #59

## Mission

Deliver the complete user-facing Missing Cost Resolution workflow on top of the certified backend authority without introducing direct stock-balance editing, cross-branch leakage, stale-plan execution, inferred cost, or a parallel recovery model.

## Published Authorities

- Client main at mission start: `4fe62d5fc448ae7361e876b877387c5f7e511539`
- Server main authority: `9f99c128c45eb630dfeb6280b7b61643e82e44b4`
- Backend CI and exact-SHA ALDE certification passed before this mission opened.

## Target User Flow

1. Open Inventory Recovery workspace.
2. View branch-scoped queue of missing-cost records.
3. Open a resolution detail.
4. Prepare proposed cost and evidence.
5. Submit for review.
6. Review, approve, reject, return, or cancel according to permission and lifecycle authority.
7. Build a fresh recovery preview from server authority.
8. Build a deterministic approval plan.
9. Confirm exact execution authority with an idempotency key.
10. Execute through the controlled backend boundary.
11. Display resulting inventory authority and immutable audit history.

## Delivery Increments

### Increment 1 — Capability Audit and Frontend Contracts

- Discover current routing, navigation, authentication, permission, API-client, error, ADS, responsive-layout, and test patterns.
- Inventory all Missing Cost backend DTOs and status/error codes.
- Define module ownership and page/API contracts.
- No runtime user-facing route until contracts are grounded.

### Increment 2 — Queue and Resolution Detail

- Branch-scoped queue, filters, search, loading/empty/error states.
- Resolution detail with current inventory authority, evidence versions, lifecycle status, and audit summary.

### Increment 3 — Evidence and Review Lifecycle

- Draft/evidence editing.
- Submit/review/approve/reject/return/cancel actions.
- Permission-aware controls and optimistic-conflict handling.

### Increment 4 — Recovery Preview and Approval Plan

- Fresh preview on every entry.
- Stale-data projection.
- Deterministic plan summary and exact authority display.

### Increment 5 — Controlled Execution Integration

- Explicit confirmation.
- Idempotency-key generation and retry safety.
- Remaining backend production-safe execution gap closed without bypassing authorization.

### Increment 6 — Post-Recovery Audit and UX Closure

- Resulting inventory authority.
- Immutable lifecycle and execution timeline.
- Mobile layout, accessibility, recovery guidance, and all error states.

### Increment 7 — E2E Verification

- Targeted FE and BE contracts.
- Frontend and Backend CI.
- Local-main merge candidates.
- Exact client/server ALDE certification.
- Publication race checks and runtime evidence.

## Architecture Constraints

- The Missing Cost feature owns its workflow UI and API adoption.
- Shared extraction is limited to genuinely neutral primitives.
- Authenticated branch context is the only branch authority.
- Client-supplied preview or plan data is never execution authority.
- No direct `StockBalance` edit UI.
- No zero-cost or inferred-cost fallback.
- Stale authority aborts and requires refresh.
- Duplicate execution must remain idempotent.
- No Production mutation during development or certification.

## Completion Authority

This mission is complete only when an authorized user can complete the workflow from queue discovery through immutable audit, CI and ALDE pass for exact published SHAs, and no uncontrolled Production mutation occurs.
