# Store Device Management API Adoption Wave

## Mission
Adopt real branch-scoped Store Device APIs in the verified management projection and UI boundaries.

## Scope
- Gateway/device list and detail API clients
- Heartbeat/authentication/runtime status adoption
- Capability and workstation assignment adoption
- Job/error/history projections
- Register/rename/assign/revoke command boundaries
- Loading, empty, offline, stale and permission states

## Invariants
- No cross-store aggregation
- No proof key, token or credential rendering
- Destructive commands require explicit confirmation and server revalidation
- Mobile and desktop states remain supported

## Dependency
Production API wiring waits for server durable job/session endpoints; mock/read-model contracts remain authoritative until then.
