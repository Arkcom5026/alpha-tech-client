# Store Device Secure Transport Boundary

## Mission
Create the transport-neutral outbound connection boundary for Epic #88 before introducing a real WebSocket or HTTP implementation.

## Scope
- Immutable gateway transport identity scoped by `branchId` and `gatewayId`
- Explicit transport lifecycle
- In-memory authenticated exchange boundary for contract verification
- Authority checks on every inbound and outbound protocol envelope
- Reconnect cursor support
- Bounded exponential reconnect backoff with jitter
- Revocation enforcement

## Invariants
- A transport cannot exchange messages for another branch or gateway.
- A revoked transport cannot reconnect, send, or receive.
- The gateway remains the initiator of the future production connection.
- No production credential or physical-device execution is introduced.

## Runtime Gate

```powershell
cd D:\alpha-tech\client
node tests/store-device-secure-transport-boundary.contract.test.js
```

Expected: all tests pass with zero failures.

## Deferred
- Real WebSocket/HTTP transport
- TLS and production credential issuance
- Persistence and server APIs
- Physical device execution
