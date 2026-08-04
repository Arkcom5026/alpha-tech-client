# Store Device Non-Production WebSocket Harness

## Mission

พิสูจน์ Local Print Bridge process จริงว่าสามารถเชื่อม outbound WebSocket ไปยัง endpoint ทดสอบ ส่ง heartbeat รับ reconnect cursor ถูกตัดการเชื่อมต่อ และ reconnect ได้ โดยไม่เปิด Physical execution

## Runtime Gate

```powershell
cd D:\alpha-tech\client
node tests/store-device-nonproduction-websocket-process-smoke.contract.test.js
```

## Expected Evidence

- Bridge `/health` แสดง Gateway enabled
- Physical execution, RAW printing และ Physical pilot ยังคงปิด
- Harness รับ heartbeat ที่ผูกกับ `gatewayId` และ `branchId`
- Harness บังคับ disconnect หนึ่งครั้ง
- Bridge reconnect และส่ง heartbeat ต่อได้
- Reconnect cursor ปรากฏใน `/health`

## Safety

- ใช้เฉพาะ loopback `127.0.0.1`
- ไม่มี Production URL หรือ credential
- ไม่มี Database/Migration
- ไม่มี Printer/Device execution
