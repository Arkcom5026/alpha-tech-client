# Store Device WebSocket Adapter Foundation

## Mission
Create a WebSocket transport adapter boundary with injectable socket runtime, branch/gateway authority, framing, reconnect backoff, reconnect cursor and revocation enforcement.

## Runtime Gate

```powershell
cd D:\alpha-tech\client
node tests/store-device-websocket-adapter-foundation.contract.test.js
```

## Safety
- Mock socket runtime only
- No production URL, credential or TLS certificate
- No database or migration
- No physical device execution
- No production cutover
