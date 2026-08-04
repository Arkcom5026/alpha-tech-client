# Store Device Persistence Binding Wave

## Mission
Bind the verified in-memory execution engine to server durable job APIs without changing engine lifecycle semantics.

## Scope
- Durable job client boundary
- Lease/ack/progress/result transport contracts
- Reconnect cursor and resume adoption
- Duplicate delivery and duplicate result protection
- Process restart recovery contracts
- Mock server adapter for local verification

## Invariants
- Strict branch authority
- One active lease
- Idempotent create and terminal completion
- Revoked session cannot resume work
- Physical execution remains disabled

## Dependency
Final integration waits for server durable job API authority and persistence foundation exact SHA.
