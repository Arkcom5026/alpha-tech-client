# Store Device Protocol Envelope Foundation

## Mission
Define the transport-neutral message envelope shared by Alpha-Tech Server and Store Device Gateway before introducing a real WebSocket or HTTP channel.

## Scope
- Versioned protocol envelope
- Message types for challenge, authentication, heartbeat, job flow, reconnect, result and revocation
- Branch/gateway/session authority fields
- Correlation and causation identifiers
- Monotonic session sequence
- Nonce and message-id replay protection
- Expiry enforcement
- Reconnect cursor foundation

## Invariants
- Every envelope carries `gatewayId` and `branchId`.
- Unsupported message types are rejected.
- Expired, duplicated, replayed or out-of-order messages are rejected.
- An authenticated authority cannot accept another branch or gateway identity.
- Payload is copied and frozen at contract creation.

## Out of Scope
- Real signatures, certificates or secrets
- Database persistence
- WebSocket/HTTP transport
- Production gateway connection
- Physical device execution

## Runtime Gate
```powershell
cd D:\alpha-tech\client
node tests/store-device-protocol-envelope.contract.test.js
```

## Next Increment
Signed protocol proof foundation: canonical serialization, message digest, challenge proof contract, credential version binding and clock-skew policy before implementing a real server transport.
