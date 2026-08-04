# Store Device Authenticated WebSocket Process Harness

## Mission
Prove challenge, signed proof, session authentication, and heartbeat authorization across a real Node process and WebSocket boundary before any production endpoint or persistence work.

## Scope
- Loopback-only authenticated WebSocket harness
- Protocol challenge envelope
- HMAC-SHA256 detached proof
- Credential-version binding
- Session authentication acknowledgement
- Heartbeat allowed only after authentication
- Invalid proof rejection

## Safety
- Non-production proof key only
- Loopback endpoint only
- No database or migration
- No printer or device execution
- No production URL, credential, or certificate

## Verification
```powershell
node tests/store-device-authenticated-websocket-process-harness.contract.test.js
```
