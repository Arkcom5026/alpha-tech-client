# Core Sales Human Operational Test Pack

## 1. Purpose

ชุดทดสอบนี้ใช้ยืนยันการทำงานจริงของ Core Sales ตั้งแต่การเตรียมตะกร้า ไปจนถึงการขายแบบชำระทันทีหรือขายเชื่อ การออกเอกสาร และการค้นหารายการย้อนหลัง

ชุดทดสอบนี้ไม่รวม Sale Return, Refund, Stock Reversal หรือ Return Approval

## 2. Test Authority

ต้องบันทึกข้อมูลต่อไปนี้ก่อนเริ่มทดสอบ:

- Client SHA:
- Server SHA:
- Environment: Local / Staging / Production
- Branch/Store ID:
- Operator:
- Date and time:
- Browser and device:
- Test data authorization:

ห้ามใช้ข้อมูลหรือสินค้า Production ที่มีผลต่อธุรกิจจริงโดยไม่ได้รับอนุมัติ

## 3. Preconditions

- ผู้ทดสอบเข้าสู่ระบบด้วยพนักงานของร้านที่กำลังทดสอบ
- มี Structured Stock Item ที่สถานะ `IN_STOCK` อย่างน้อยหนึ่งรายการ
- มี Tracked SIMPLE product และ Simple Lot ที่มียอดคงเหลือ หากต้องการทดสอบเส้นทางนี้
- มี NON_STOCK SIMPLE/service-style product หากต้องการทดสอบเส้นทางนี้
- มีลูกค้าสำหรับขายเชื่อ
- มี Payment Evidence ที่ได้รับอนุญาตสำหรับการทดสอบ
- มี Customer Deposit ที่เป็นของลูกค้าและร้านเดียวกัน หากต้องการทดสอบ Deposit

## 4. Scenario A — Contextual Help

1. เปิดหน้าขายหลัก
2. ตรวจว่ามีปุ่ม `คู่มือ` บริเวณหัวหน้าขาย
3. เปิด Help Drawer
4. ตรวจหัวข้อ Structured, Tracked SIMPLE, NON_STOCK, CASH, CREDIT, Held Cart, Recovery และ Checklist
5. ปิด Drawer และยืนยันว่าหน้าขายเดิมยังอยู่ครบ

Evidence:

- Screenshot / recording:
- Result: PASS / FAIL
- Notes:

## 5. Scenario B — Structured Stock Item

1. เลือกร้านและประเภทราคาที่ถูกต้อง
2. ยิง Barcode หรือค้นหา Structured Stock Item
3. ตรวจว่ารายการถูกเพิ่มด้วยจำนวน 1
4. ตรวจราคา ส่วนลด VAT และยอดสุทธิ
5. ห้ามเพิ่ม Stock Item เดิมซ้ำ

Expected:

- แสดงเฉพาะสินค้าของร้านปัจจุบัน
- Stock Item ที่ไม่พร้อมขายถูกปฏิเสธ
- Duplicate Stock Item ไม่สามารถปิดการขายได้

Evidence:

- Stock Item ID:
- Barcode/Serial:
- Result: PASS / FAIL
- Notes:

## 6. Scenario C — Tracked SIMPLE

1. เพิ่ม Tracked SIMPLE product
2. เลือกหรือยืนยัน Simple Lot
3. ระบุจำนวนที่ไม่เกินยอดคงเหลือ
4. ตรวจยอดสินค้าในตะกร้า
5. ทดสอบจำนวนเกินยอดคงเหลือโดยไม่ Commit ข้อมูลธุรกิจจริง

Expected:

- ต้องมี Simple Lot ที่ตรงกับสินค้าและร้าน
- จำนวนเกิน Lot หรือ Stock Balance ถูกปฏิเสธ
- หลังขายสำเร็จ Lot และ Balance ลดลงตามจำนวน

Evidence:

- Product ID:
- Simple Lot ID:
- Quantity before/after:
- Result: PASS / FAIL
- Notes:

## 7. Scenario D — NON_STOCK / Service

1. เพิ่ม NON_STOCK SIMPLE หรือรายการบริการ
2. ระบุจำนวนและราคา
3. ปิดการขายตามเส้นทางที่ได้รับอนุญาต

Expected:

- บันทึกเป็น Sale line ได้
- ไม่ต้องมี Simple Lot
- ไม่ลด Stock Balance

Evidence:

- Product ID:
- Quantity:
- Stock before/after:
- Result: PASS / FAIL
- Notes:

## 8. Scenario E — Held Cart

1. เพิ่มสินค้าอย่างน้อยหนึ่งรายการ
2. เปิด `ใบพักรายการขาย`
3. ระบุชื่อเรียก เบอร์โทร หรือหมายเหตุ
4. กดบันทึกและเปิดหน้าขายใหม่
5. ค้นหาใบพักและเปิดทำต่อ
6. ตรวจ Revalidation และ Price Change warning
7. ยืนยันการขายจากใบพัก

Expected:

- หน้าขายเดิมถูกล้างหลังบันทึกสำเร็จ
- ใบพักค้นหาและเปิดทำต่อได้เฉพาะร้านปัจจุบัน
- สินค้าไม่พร้อมหรือราคาเปลี่ยนมีคำเตือน
- หลังขายสำเร็จ Held Cart เปลี่ยนจาก `OPEN` เป็น `CONVERTED`

Evidence:

- Held Cart ID/Code:
- Version:
- Status before/after:
- Result: PASS / FAIL
- Notes:

## 9. Scenario F — CASH Completion

1. เตรียมตะกร้าที่ถูกต้อง
2. เลือก `CASH`
3. ใส่ Payment Evidence ให้รวมเท่ากับยอดสุทธิ
4. ยืนยันการขายเพียงครั้งเดียว
5. รอผลลัพธ์ก่อนดำเนินการต่อ

Expected:

- Sale สร้างสำเร็จ
- Payment status เป็น `PAID`
- Completion status เป็น `COMPLETED_PAID`
- เอกสารเริ่มต้นเป็น `RECEIPT`
- Tracked inventory ถูกตัดเพียงครั้งเดียว

Evidence:

- Sale ID/Code:
- Total:
- Payment methods and amounts:
- Document opened:
- Result: PASS / FAIL
- Notes:

## 10. Scenario G — CREDIT Completion

1. เลือกลูกค้า
2. เลือก `CREDIT`
3. ไม่ใส่ CASH, TRANSFER หรือ CARD ในคำสั่งปิดการขาย
4. ยืนยันการขาย

Expected:

- CREDIT ที่ไม่มีลูกค้าถูกปฏิเสธ
- Sale เชื่อสร้างสำเร็จเมื่อข้อมูลครบ
- Payment status เริ่มเป็น `UNPAID` หรือสถานะยอดคงค้างตาม Runtime
- เอกสารเริ่มต้นเป็น `DELIVERY_NOTE`
- Due Date สอดคล้องกับ Payment Terms เมื่อมีข้อมูล

Evidence:

- Sale ID/Code:
- Customer ID:
- Due date:
- Outstanding amount:
- Result: PASS / FAIL
- Notes:

## 11. Scenario H — Payment Validation

ทดสอบเส้นทางปฏิเสธโดยไม่สร้างธุรกรรมที่ไม่ได้รับอนุญาต:

- CASH ชำระต่ำกว่ายอดสุทธิ
- Payment เกินยอดขาย
- CREDIT มี immediate payment
- Deposit ไม่มี `customerDepositId`
- Deposit เป็นของลูกค้าหรือร้านอื่น

Expected:

- ระบบปฏิเสธด้วยข้อความที่เข้าใจได้
- ไม่มี Sale, Payment, Deposit Usage หรือ Stock mutation ค้างอยู่

Evidence:

- Error code/message:
- Database/runtime evidence:
- Result: PASS / FAIL
- Notes:

## 12. Scenario I — Idempotency and Uncertain Response

1. เตรียมคำสั่งขายที่ได้รับอนุญาต
2. ส่งคำสั่งด้วย command identity เดิม
3. จำลอง Retry เฉพาะกรณี payload ไม่เปลี่ยน
4. ตรวจ Sale History ก่อนสร้างคำสั่งใหม่

Expected:

- Retry เดิมคืน canonical result
- ไม่มี Sale, Payment, Stock Movement หรือ Deposit Usage ซ้ำ
- command identity เดิมกับ payload ที่เปลี่ยนถูกปฏิเสธ

Evidence:

- Command ID:
- Sale ID returned on each request:
- Counts before/after:
- Result: PASS / FAIL
- Notes:

## 13. Scenario J — Tax Publication Boundary

หลัง Sale สำเร็จ ตรวจ `taxIntake` ในผลลัพธ์:

- `REGISTERED`
- `REPLAYED`
- `SKIPPED`
- `PENDING_RETRY`

Expected:

- Tax publication เกิดหลัง Sale transaction
- `PENDING_RETRY` ไม่ย้อน Sale ที่สำเร็จแล้ว
- ไม่สร้าง Sale ใหม่เพื่อแก้ Tax Candidate
- ใช้ Tax Retry/Reconciliation แยกตาม Workflow ภาษี

Evidence:

- Sale ID:
- Tax intake status:
- Candidate/Document ID ถ้ามี:
- Result: PASS / FAIL
- Notes:

## 14. Scenario K — History and Printable

1. ค้นหาจาก Sale Code
2. ค้นหาจากลูกค้า/บริษัทและช่วงวันที่
3. ตรวจ Paid/Unpaid/Partial filters
4. เปิด Sale Detail และเอกสาร

Expected:

- แสดงเฉพาะร้านปัจจุบัน
- Detail มีทั้ง `items`, `simpleItems`, payments, totals และ balance ตามที่เกี่ยวข้อง
- รายการ `CANCELLED` ไม่อยู่ใน Printable search
- Receipt/Delivery Note เปิดจาก Sale authority เดิม

Evidence:

- Search parameters:
- Sale ID/Code:
- Document type:
- Result: PASS / FAIL
- Notes:

## 15. Cross-store Isolation Check

ตรวจด้วยข้อมูลที่ได้รับอนุญาตเท่านั้น:

- Stock Item ของร้านอื่นไม่สามารถขายได้
- Held Cart ของร้านอื่นไม่สามารถค้นหรือเปิดได้
- Customer Deposit ของร้านอื่นใช้ไม่ได้
- Sale ของร้านอื่นไม่สามารถเปิด Detail หรือ Printable ได้

Evidence:

- Current Branch ID:
- Foreign record IDs used for negative test:
- Result: PASS / FAIL
- Notes:

## 16. Final Result

- Contextual Help: PASS / FAIL
- Structured Stock: PASS / FAIL / N/A
- Tracked SIMPLE: PASS / FAIL / N/A
- NON_STOCK: PASS / FAIL / N/A
- Held Cart: PASS / FAIL
- CASH Completion: PASS / FAIL
- CREDIT Completion: PASS / FAIL
- Payment Validation: PASS / FAIL
- Idempotency: PASS / FAIL
- Tax Publication Boundary: PASS / FAIL
- History/Printable: PASS / FAIL
- Cross-store Isolation: PASS / FAIL

Overall Result: PASS / FAIL / BLOCKED

Blocking defects:

1.
2.
3.

Operator confirmation:

- Name:
- Date/time:
- Evidence location:
- Signature/approval note:
