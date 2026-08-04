# Store Device Mock Authenticated WebSocket Runtime

## Mission
Prove the authenticated gateway lifecycle over the WebSocket adapter boundary before opening a real server endpoint.

## Runtime Gate

```powershell
node tests/store-device-mock-authenticated-websocket-runtime.contract.test.js
```

## Invariants
- Gateway and branch authority are fixed for the runtime lifetime.
- Challenge proof is required before heartbeat or job handling.
- Heartbeat, lease and result must use the authenticated session.
- Job completion advances the reconnect cursor.
- Reconnect preserves cursor authority.
- Revocation permanently blocks future connection and execution.

## Exclusions
- No production URL or credential.
- No database or migration.
- No physical device execution.
- No production cutover.
