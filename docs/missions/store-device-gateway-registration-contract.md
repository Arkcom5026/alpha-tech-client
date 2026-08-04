# Store Device Gateway Registration Contract

## Mission

สร้าง authority สำหรับลงทะเบียน Store Device Gateway ให้เป็นเจ้าของโดยร้านเดียว มี lifecycle ตรวจสอบได้ และเป็นฐานของ secure outbound job channel ภายใต้ Epic #88

## Invariants

- `gatewayId` หนึ่งค่าไม่สามารถย้ายข้าม `branchId` ได้
- Gateway เริ่มจาก `PENDING` และต้องผ่าน enrollment ก่อน heartbeat
- Revoked gateway ต้อง Offline และห้าม heartbeat หรือ rotate credential
- Capability และ platform metadata เป็น immutable snapshot ใน contract
- Credential rotation เพิ่ม version โดยไม่เปิดเผย secret ใน client contract

## Runtime Gate

```powershell
cd D:\alpha-tech\client
node tests/store-device-gateway-registration.contract.test.js
```

Required result: all tests pass with zero failures.

## Out of Scope

- Database persistence or migration
- Enrollment API
- Real credentials or certificate issuance
- WebSocket/long-poll connection
- Physical device execution
- Production cutover

## Next Increment

Secure outbound gateway session contract: challenge/response enrollment, authenticated heartbeat, branch-scoped job lease, acknowledgement, reconnect, and revocation enforcement.
