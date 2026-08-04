# Store Device Limited Real Adapter Pilot

## Mission
Establish the last fail-closed boundary before one explicitly authorized physical printer pilot.

## Authority
The pilot is valid only when all identities match exactly:

- authenticated `branchId`
- configured `gatewayId`
- configured registered `deviceId`
- durable `jobId`
- local RAW-capable printer queue

## Safety defaults

- disabled unless explicitly enabled
- one configured device only
- one active job only
- completed job replay is deduplicated
- shared/UNC printer connections are rejected
- revoked, cross-store or non-printer devices are rejected
- no Production-wide physical execution

## Verification

```powershell
node tests/store-device-limited-real-adapter-pilot.contract.test.js
```

## Not included

- no automatic environment enablement
- no real print command issued by this increment
- no server migration
- no merge or deploy
