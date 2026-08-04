# Store Device Authority & Adapter Contract Foundation

Epic: #88

## Mission
Create the first transport-neutral authority boundary for Alpha-Tech Store Device & Printing Platform.

## Guarantees
- Every device job requires `branchId` and cannot exist without tenant scope.
- Every job has an idempotency key and immutable payload snapshot.
- User origin and physical execution target are separate concepts.
- Device workflows depend on a single adapter contract, not on Windows queues or printer brands.
- New transports can be registered without changing document workflows.

## Initial Transports
- WINDOWS_RAW
- USB_ESC_POS
- TCP_ESC_POS
- WIFI_PRINTER
- BLUETOOTH_ESC_POS
- VENDOR_SDK
- SYSTEM_DRIVER
- PDF

## Runtime Gate
```powershell
cd D:\alpha-tech\client
node tests/store-device-authority-adapter.contract.test.js
```

## Out of Scope
- Database persistence
- Server queue
- Secure outbound channel
- Device registration UI
- Physical device execution
- Production cutover
