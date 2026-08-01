# Missing Cost Resolution — Controlled Execution UI

## Delivered

- Fresh server Preview and deterministic Approval Plan are required before confirmation.
- Explicit confirmation is required before POST execution.
- `X-Idempotency-Key` is generated and sent for one execution attempt.
- Client submits exact plan fields but never submits branch, role, employee, or approval identity authority.
- Stale, duplicate, forbidden, disabled-capability, loading, and success states are represented.
- Post-recovery audit displays resulting quantity, average cost, inventory value, occurrence time, and immutable event hash.

## Safety

- No direct StockBalance edit UI.
- No cached plan can be executed without current server validation.
- Approval identity is displayed from server plan and is not client-controlled.
- No Production mutation was performed during implementation.

## Remaining Verification

- Frontend targeted tests, typecheck, lint, build, and test suite.
- Backend targeted tests and Backend CI for PR #236.
- Local-main merge candidates for both repositories.
- Exact-SHA ALDE certification and publication race checks.
