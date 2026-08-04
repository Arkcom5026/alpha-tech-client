# Store Device Secure Outbound Session Contract

Epic: #88
Base: `feature/store-device-gateway-registration-contract`

## Mission
Define the transport-neutral contract for an enrolled Store Device Gateway to initiate an authenticated outbound session, lease branch-scoped jobs, acknowledge delivery, reconnect safely, and obey revocation.

## Invariants
- Every session and lease is scoped by `branchId` and `gatewayId`.
- A job may have only one active lease for the same authority.
- Revoked or disconnected sessions cannot lease work.
- No inbound public port, real credential, server API, database, or physical device execution is introduced.

## Local Gate
```powershell
cd D:\alpha-tech\client
node tests/store-device-secure-outbound-session.contract.test.js
```

## Next Increment
Server-side secure job channel and gateway protocol boundary: challenge response messages, heartbeat envelope, job pull/lease acknowledgement, reconnect cursor, and signed branch authority.
