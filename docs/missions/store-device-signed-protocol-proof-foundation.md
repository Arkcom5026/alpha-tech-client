# Store Device Signed Protocol Proof Foundation

## Mission
เพิ่ม proof contract สำหรับ Server/Gateway protocol ก่อนเริ่ม transport จริง โดยผูกข้อความกับ canonical serialization, digest, challenge, credential version และ clock authority

## Scope
- Deterministic canonical serialization
- SHA-256 message digest
- HMAC-SHA256 reference challenge proof
- Credential version binding
- Payload tamper detection
- Clock-skew and expiry policy
- Timing-safe proof comparison

## Invariants
- Proof material ต้องครอบคลุม branchId, gatewayId, sessionId, sequence, nonce, timestamp, expiry และ payload
- เปลี่ยน payload หรือ authority field ใดต้องทำให้ verification ไม่ผ่าน
- Credential version ไม่ตรงต้องถูกปฏิเสธ
- Message ที่มาจากอนาคตเกิน policy หรือหมดอายุต้องถูกปฏิเสธ
- Production secret/certificate จะต้องมาจาก server-side credential authority ไม่เก็บใน client source

## Safety
- ไม่มี credential หรือ secret จริง
- ไม่มี Database/Migration
- ไม่มี WebSocket/HTTP transport
- ไม่มี Physical execution
- ไม่มี Production cutover

## Local Verification
```powershell
cd D:\alpha-tech\client
node tests/store-device-signed-protocol-proof.contract.test.js
```

## Runtime Gate
- Contract tests PASS บน exact branch SHA
- Canonical digest stable
- Valid proof verifies
- Payload tamper, credential mismatch และ clock-skew violations ถูกปฏิเสธ

## Next Increment
Secure transport boundary foundation: outbound gateway client/server interfaces, reconnect backoff, authenticated protocol exchange และ test transport โดยยังไม่ใช้ Production credential
