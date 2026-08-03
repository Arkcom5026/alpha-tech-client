# Core Sales Human Operational Test Pack

## 1. Purpose

ชุดทดสอบนี้ใช้ยืนยัน Core Sales จริงตั้งแต่ค้นหาและเลือกลูกค้าของร้าน เตรียมตะกร้า ปิดการขาย ออกเอกสาร และตรวจผลในฐานข้อมูล

ชุดทดสอบนี้ไม่รวม Sale Return, Refund, Stock Reversal หรือ Return Approval

## 2. Test Authority

บันทึกก่อนเริ่ม:

- Client SHA:
- Server SHA:
- Environment:
- Branch/Store ID:
- Operator and Employee ID:
- Date/time:
- Browser/device:
- Test data authorization:

ห้ามใช้ข้อมูล Production ที่มีผลต่อธุรกิจจริงโดยไม่ได้รับอนุมัติ

## 3. Preconditions

- เข้าระบบด้วยพนักงานของร้านที่ทดสอบ
- มีลูกค้าของร้านปัจจุบันอย่างน้อยหนึ่งราย
- มีลูกค้าของร้านอื่นสำหรับ negative test ที่ได้รับอนุญาต
- มีเบอร์โทรใหม่ที่ยังไม่เป็น CustomerProfile สำหรับทดสอบ first association
- มี Structured Stock Item สถานะ `IN_STOCK`
- มี Payment Evidence ที่ได้รับอนุญาต
- มี Customer Deposit ของลูกค้าและร้านเดียวกันหากทดสอบ Deposit

## 4. Scenario A — Contextual Help

1. เปิดหน้าขายและ Help Drawer
2. ตรวจว่าคู่มืออธิบายช่องค้นหาลูกค้าเดียว
3. ตรวจว่าระบุชื่อ เบอร์โทร บริษัท อีเมล และเลขผู้เสียภาษี
4. ตรวจว่าระบุชัดว่า Sale ไม่ค้นหาสินค้า รุ่น Barcode, Serial, IMEI หรือ Service Tag
5. ตรวจคำแนะนำลูกค้าใหม่ ลูกค้าข้ามร้าน และ error recovery

Expected: คู่มือสอดคล้องกับ runtime ปัจจุบัน

Evidence / Result / Notes:

## 5. Scenario B — Unified Customer Search by Name

1. กรอกชื่อลูกค้าของร้านในช่องค้นหาเดียว
2. กด Enter
3. ตรวจรายการผลลัพธ์หลายรายการเมื่อมีข้อมูลคล้ายกัน
4. ตรวจชื่อ เบอร์โทร บริษัท และเลขผู้เสียภาษีก่อนเลือก
5. เลือกลูกค้า

Expected:

- ไม่ต้องเลือกโหมดชื่อ/โทรศัพท์
- แสดงเฉพาะลูกค้าที่สัมพันธ์กับร้านปัจจุบัน
- หลังเลือกแล้ว Customer ID ถูกส่งเข้า Sale state
- เงินมัดจำโหลดภายหลังการเลือก ไม่ใช่ search authority

Evidence:

- Query:
- Selected Customer ID:
- Result count:
- Result: PASS / FAIL

## 6. Scenario C — Unified Customer Search by Phone and Organization

ทดสอบอย่างน้อย:

- เบอร์โทรเต็มหรือบางส่วนตาม contract
- ชื่อบริษัทหรือหน่วยงาน
- อีเมล
- เลขผู้เสียภาษี

Expected: ผลลัพธ์อยู่ในร้านปัจจุบันและเลือกได้จากรายการเดียวกัน

Evidence / Result / Notes:

## 7. Scenario D — Search Domain Boundary

1. กรอก Barcode, Serial Number, IMEI หรือ Service Tag ที่มีอยู่ในระบบซ่อม
2. ตรวจผล Customer Search ของ Sale

Expected:

- Sale Customer Search ไม่คืนอุปกรณ์ สินค้า งานซ่อม หรืองานเคลม
- ช่องค้นหาสินค้ายังคงเป็น workflow แยก

Evidence / Result / Notes:

## 8. Scenario E — Cross-store Customer Isolation

1. ใช้ชื่อ/เบอร์ของลูกค้าร้านอื่นค้นหาจากร้านปัจจุบัน
2. ทดลองส่ง Customer ID ร้านอื่นตรงเข้า Sale Completion ด้วยข้อมูลทดสอบที่ได้รับอนุญาต

Expected:

- ลูกค้าร้านอื่นไม่ปรากฏในผลค้นหา
- forged Customer ID ถูกปฏิเสธด้วย `SALE_CUSTOMER_NOT_ACCESSIBLE_IN_BRANCH`
- ไม่มี Sale, Payment, Stock Movement หรือ Deposit Usage ถูกสร้าง
- Client คงตะกร้าและ Payment state ไว้เพื่อให้เลือกใหม่

Evidence:

- Current Branch ID:
- Foreign Customer ID:
- Error code:
- DB counts before/after:
- Result: PASS / FAIL

## 9. Scenario F — Create New Customer and First Sale

1. ค้นหาด้วยเบอร์ใหม่และยืนยันว่าไม่พบ
2. เพิ่มชื่อ เบอร์ และข้อมูลที่จำเป็น
3. สร้างลูกค้าใหม่จากหน้า Sale
4. ตรวจว่า UI เลือกลูกค้าใหม่ทันที
5. เพิ่มสินค้า รับชำระ และยืนยัน Sale แรกภายใน session
6. Refresh/ค้นหาลูกค้าอีกครั้งหลัง Sale สำเร็จ

Expected:

- Server ออก first-association evidence ที่ผูกกับ Customer, Branch และ Employee
- evidence ไม่แสดงใน UI และไม่ถูกเก็บถาวรนอก session
- Sale แรกสำเร็จ
- หลัง Sale สำเร็จ ลูกค้าค้นหาได้จาก branch evidence ถาวร
- Sale.customerId และ Sale.branchId ตรงกับลูกค้าและร้านที่ทดสอบ

Evidence:

- New Customer ID:
- Sale ID:
- Branch ID:
- Evidence issued/consumed:
- Result: PASS / FAIL

## 10. Scenario G — First-association Negative Cases

ทดสอบโดยไม่สร้างธุรกรรมจริง:

- token ถูกแก้ไข
- token หมดอายุ
- token ของ Customer อื่น
- token ของ Branch อื่น
- token ของ Employee อื่น
- เบอร์โทรตรงกับ CustomerProfile ของร้านอื่น

Expected:

- ถูกปฏิเสธ
- ไม่เกิด Sale หรือ mutation ใด
- `CUSTOMER_PHONE_NOT_AVAILABLE_IN_BRANCH` ใช้กับเบอร์ที่เป็นลูกค้าร้านอื่น

Evidence / Result / Notes:

## 11. Scenario H — Structured Stock Item

1. ยิง Barcode หรือค้นหา Stock Item
2. ตรวจจำนวน 1 ราคา ส่วนลด VAT
3. ห้ามเพิ่ม Stock Item เดิมซ้ำ

Expected: แสดงและขายเฉพาะสินค้าของร้านปัจจุบัน

Evidence / Result / Notes:

## 12. Scenario I — CASH Completion with Selected Customer

1. เลือกลูกค้าของร้านจาก Unified Search
2. เพิ่มสินค้า
3. ใส่ Payment Evidence เท่ากับยอดสุทธิ
4. ยืนยันเพียงครั้งเดียว
5. เปิด Receipt

Expected:

- Sale สร้างสำเร็จและ `PAID`
- Sale.customerId ตรงกับลูกค้าที่เลือก
- Sale.branchId ตรงกับร้านพนักงาน
- Stock ลดครั้งเดียว
- Receipt เปิดจาก canonical Sale ID

Evidence / Result / Notes:

## 13. Scenario J — CASH without Customer

1. ล้างลูกค้า
2. ทำ CASH Sale ตามนโยบายร้าน

Expected: ขายได้โดย `customerId = null` และ guard ไม่บังคับลูกค้ากับ CASH anonymous sale

Evidence / Result / Notes:

## 14. Scenario K — CREDIT Completion

1. เลือกลูกค้าของร้าน
2. เลือก CREDIT
3. ไม่ใส่ CASH/TRANSFER/CARD
4. ยืนยัน

Expected:

- CREDIT ไม่มีลูกค้าถูกปฏิเสธ
- ลูกค้าข้ามร้านถูกปฏิเสธ
- Sale เชื่อสำเร็จเมื่อข้อมูลครบ
- เอกสารเริ่มต้น `DELIVERY_NOTE`

Evidence / Result / Notes:

## 15. Scenario L — Customer Deposit Isolation

1. เลือกลูกค้าของร้านและโหลด Deposit
2. ทดลอง Deposit ของลูกค้าหรือร้านอื่น

Expected:

- Deposit โหลดหลังเลือกลูกค้า
- คืนเฉพาะ Deposit ของ Customer และ Branch เดียวกัน
- Deposit ข้ามร้านใช้ไม่ได้

Evidence / Result / Notes:

## 16. Scenario M — Idempotency and Uncertain Response

Retry ด้วย command identity เดิมและ payload เดิมเท่านั้น

Expected:

- canonical Sale ID เดิม
- ไม่มี Sale, Payment, Stock Movement หรือ Deposit Usage ซ้ำ
- payload เปลี่ยนภายใต้ command เดิมถูกปฏิเสธ

Evidence / Result / Notes:

## 17. Scenario N — Repair/Claim Regression

หลังเปลี่ยน Customer policy กลาง ให้ตรวจ:

- Repair Intake Search ยังคืนลูกค้าและอุปกรณ์ของร้าน
- Create RepairJob ด้วยลูกค้าของร้านสำเร็จ
- ลูกค้าข้ามร้านถูกปฏิเสธ
- External Device Intake ยังทำงาน
- Warranty Assets จำกัด Customer + Branch

Evidence / Result / Notes:

## 18. Scenario O — Documents, Tax, History

- CASH PAID เปิด Receipt และเอกสารภาษีตามสิทธิ์
- CREDIT/UNPAID/PARTIALLY_PAID ใช้ Delivery Note
- History/Printable จำกัดร้าน
- Tax `PENDING_RETRY` ไม่สร้าง Sale ซ้ำ

Evidence / Result / Notes:

## 19. Test-DB Post-condition Authority

Read-only verifier ต้องยืนยันอย่างน้อย:

- Sale ID/Code มีอยู่
- Sale.branchId ตรง authenticated Branch
- Sale.customerId ตรงลูกค้าที่เลือก หรือ null สำหรับ anonymous CASH
- Customer มี branch evidence จาก Sale ที่เพิ่งสร้าง
- SaleItem/SaleItemSimple และ StockMovement อยู่ Branch เดียวกัน
- Payment อยู่กับ Sale เดียวกัน
- ไม่มี Sale หรือ mutation จาก negative cross-store tests

Browser PASS โดยไม่มี Test-DB post-condition ยังไม่ถือว่า E2E PASS

## 20. Final Result

- Unified Search by Name: PASS / FAIL
- Phone/Organization Search: PASS / FAIL
- Search Domain Boundary: PASS / FAIL
- Cross-store Isolation: PASS / FAIL
- New Customer First Sale: PASS / FAIL
- First-association Negatives: PASS / FAIL
- CASH Selected Customer: PASS / FAIL
- CASH Anonymous: PASS / FAIL
- CREDIT: PASS / FAIL
- Deposit Isolation: PASS / FAIL
- Idempotency: PASS / FAIL
- Repair Regression: PASS / FAIL
- Documents/History: PASS / FAIL
- Test-DB Post-condition: PASS / FAIL

Overall Result: PASS / FAIL / BLOCKED

Blocking defects:

1.
2.
3.

Operator / Date / Evidence location / Approval:
