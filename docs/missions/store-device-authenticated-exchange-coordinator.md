# Store Device Authenticated Exchange Coordinator

## Mission
Integrate challenge authentication, heartbeat, branch-scoped job lease/result, disconnect, reconnect cursor resume, and revocation on the in-memory transport boundary.

## Runtime Gate

```powershell
cd D:\alpha-tech\client
node tests/store-device-authenticated-exchange-coordinator.contract.test.js
```

## Required Evidence
- Valid proof authenticates the gateway session.
- Invalid proof is rejected.
- Cross-branch job leases are rejected.
- Heartbeat and job result use the authenticated session.
- Reconnect resumes from the last cursor.
- Revocation blocks further connection.

## Safety
No database, production credential, WebSocket, physical execution, or production cutover is included.
