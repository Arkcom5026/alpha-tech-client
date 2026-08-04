# Store Device Authenticated Startup Runtime

Integrate the non-production challenge/proof/session handshake into the opt-in local gateway startup runtime.

## Runtime authority

- Gateway startup remains opt-in.
- Enabled runtime requires a gateway ID, branch ID, credential version, and proof key.
- Heartbeat starts only after an `AUTHENTICATED` acknowledgement for the active session.
- Authentication state and timestamps are exposed through `/health` without exposing proof material.
- Physical execution remains forcibly disabled.

## Local gate

```powershell
node tests/store-device-authenticated-startup-runtime.contract.test.js
node tests/store-device-authenticated-startup-process.contract.test.js
```
