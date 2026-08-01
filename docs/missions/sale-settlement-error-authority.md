# Sale Settlement Error Authority

## Mission

Expose deterministic Sale Settlement outcomes to the UI so a rejected close-bill action cannot be mistaken for success.

## Scope

- return structured `{ ok, error, code, status, detail }` from settlement action
- preserve branch-scoped and payment-evidence failure messages
- prevent silent error swallowing
- add focused client contracts
- no cancellation/void redesign
- no document or dashboard redesign
- no route compatibility removal

## Safety Boundaries

- no optimistic success without canonical server response
- no checkout or history mutation after deterministic settlement failure
- repository/CI evidence does not represent Human Operational Test

## Verification Target

- focused contract
- frontend test:run
- production build
- integrated ALDE SyncAndCertify after merge
