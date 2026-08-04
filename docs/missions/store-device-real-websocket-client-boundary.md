# Store Device Real WebSocket Client Boundary

## Mission
Add the first real outbound WebSocket client boundary to the local gateway process while keeping production credentials and physical device execution disabled.

## Runtime Gate

```powershell
cd D:\alpha-tech\client
node tests/store-device-real-websocket-client-boundary.contract.test.js
```

## Safety
- Gateway runtime is disabled by default.
- Endpoint must be configured explicitly and must use `ws://` or `wss://`.
- No production secret or certificate is included.
- Physical execution remains disabled unless an explicit future authority enables it.
- Runtime remains branch-scoped and gateway-scoped.

## Next Increment
Integrate the gateway client into local-print-bridge startup and health diagnostics behind an opt-in environment gate, using a non-production WebSocket runtime only.
