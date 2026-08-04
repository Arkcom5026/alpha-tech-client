# Alpha-Tech Native POS Printing Platform

## Mission

ย้ายการพิมพ์เอกสารที่ใช้บ่อยออกจาก `window.print()` และ Chrome Print Preview ไปสู่ Print Authority กลางที่ส่ง Print Job ไปยัง Alpha-Tech Local Print Bridge ก่อนพิมพ์ด้วย ESC/POS หรือ renderer ที่เหมาะกับอุปกรณ์

## Proven Problem

การทดสอบกับ EPSON TM-T82X พิสูจน์แล้วว่า Browser/Driver เลือก Windows Paper Form `Roll Paper 80 x 297 mm` แม้หน้าเว็บจะส่ง `@page` ความสูง 120, 180, 400 มม. และแม้พิมพ์จาก iframe แยกเอกสาร ดังนั้นการแก้ CSS เพิ่มไม่ใช่ Production solution

## Non-negotiable Product Contract

- หน้าตรวจและแก้ไขใบเสร็จ ใบกำกับภาษี และใบส่งของยังคงอยู่
- การเปลี่ยนครั้งนี้เปลี่ยนเฉพาะ Print Delivery Channel
- Print Job ต้องสร้างจาก snapshot ที่ยืนยันแล้ว ไม่อ่าน DOM เป็น authority
- ทุก Print Job ต้องผูก `branchId`, workstation และ printer profile
- ร้านแต่ละร้านเป็น tenant อิสระ ห้าม route งานพิมพ์ข้ามร้าน
- Browser printing ต้องคงเป็น fallback ระหว่าง rollout จนกว่า Local Bridge ผ่าน Runtime Gate
- ห้ามอ้างว่าพิมพ์สำเร็จจน Local Bridge ตอบผลสำเร็จจริง

## Increment 1 — Client Print Authority Foundation

สถานะของ PR นี้:

- กำหนด Print Job Contract
- กำหนด Document Type และ Print Job Status
- กำหนด Local Bridge HTTP boundary ที่ `127.0.0.1:17451`
- กำหนด Print Authority Service สำหรับ health check, printer discovery และ dispatch
- ยังไม่เปลี่ยนปุ่มพิมพ์จริง
- ยังไม่มี Windows Service หรือ ESC/POS implementation

## Planned E2E Increments

1. Client Print Authority Foundation
2. Local Print Bridge executable/service foundation
3. Printer discovery and workstation registration
4. ESC/POS receipt renderer, feed and partial cut
5. Short Tax Receipt pilot cutover with browser fallback
6. Print result, retry and audit persistence
7. Receipt and Delivery Note migration
8. Repair, barcode, label and cash drawer expansion

## Local Bridge Contract Draft

### `GET /health`

```json
{
  "status": "ok",
  "service": "alpha-tech-local-print-bridge",
  "version": "0.1.0"
}
```

### `GET /v1/printers`

Returns printers visible to the workstation with stable printer profile identifiers.

### `POST /v1/print-jobs`

Accepts an immutable print job snapshot and returns the actual dispatch result.

```json
{
  "bridgeJobId": "...",
  "status": "PRINTED",
  "printerName": "EPSON TM-T82X Receipt",
  "printedAt": "..."
}
```

## Runtime Gates before Cutover

- Local Bridge health endpoint reachable from the client
- Correct printer is discovered and selected for the current workstation
- Short receipt prints without Chrome dialog
- Paper length follows content and partial cut occurs after footer
- Duplicate dispatch protection works for the same job ID
- Offline/unavailable bridge produces a clear recoverable error
- Browser fallback remains available during pilot
- Printed document matches the latest saved document snapshot
