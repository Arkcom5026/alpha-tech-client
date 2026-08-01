# Core Sales Operational User Guide (Draft)

## 1. Purpose

คู่มือนี้อธิบายการขายสินค้าตั้งแต่ค้นหาและเพิ่มสินค้าเข้าตะกร้า ไปจนถึงยืนยันการขาย ชำระเงินหรือขายเชื่อ และเปิดเอกสารเริ่มต้น โดยอ้างอิงหน้าขาย `CreateSalePage` และ Server Core Sale Completion authority

> Sale Return ไม่อยู่ในคู่มือนี้ และต้องใช้คู่มือ/Increment แยก

## 2. Main Screen Areas

หน้าขายหลักประกอบด้วย:

1. Customer section — ค้นหา/เลือก/ล้างลูกค้า และเลือกโหมดการขาย
2. Price type and item search — ราคาปลีก ราคาช่าง ราคาส่ง และช่องยิง Barcode
3. Sale cart — รายการ Structured Stock Item และ SIMPLE product
4. Payment section — วิธีชำระ โหมด CASH/CREDIT และตัวเลือกเอกสาร
5. Held Cart panel — พักรายการ ค้นหา เปิดทำต่อ และยกเลิก
6. Completion handoff — เปิด Receipt หรือ Delivery Note หลังยืนยันสำเร็จ

## 3. Before Starting

- ตรวจว่ากำลังทำงานอยู่ในร้านที่ถูกต้อง
- เลือกประเภทราคาให้ตรงกับลูกค้า
- หากเป็นขายเชื่อ ต้องเลือก Customer ก่อน
- ตรวจว่าบาร์โค้ดหรือสินค้าที่ค้นหาเป็นของร้านปัจจุบัน
- ห้ามขาย Stock Item เดิมซ้ำในตะกร้าเดียวกัน

## 4. Add Items to the Cart

### Structured Stock Item

- ยิง Barcode ของชิ้นสินค้าที่มีตัวตนเฉพาะ
- แต่ละ Stock Item มีจำนวนเท่ากับ 1
- ระบบต้องยืนยันว่า Stock Item ยังเป็น `IN_STOCK` ในร้านปัจจุบัน

### Tracked SIMPLE product

- เลือกสินค้าและระบุจำนวน
- ระบบต้องมี Simple Lot ที่ตรงกับสินค้าและร้าน
- ปริมาณใน Lot และ Stock Balance ต้องเพียงพอ

### NON_STOCK SIMPLE / service-style product

- เพิ่มรายการและจำนวนได้โดยไม่ตัด Stock Balance
- ยังคงต้องเป็นสินค้าที่ Active และอยู่ในขอบเขตร้าน

## 5. Customer and Sale Mode

### CASH

- เลือกลูกค้าหรือขายแบบไม่ระบุลูกค้าได้ตามนโยบายร้าน
- ต้องมี Payment Evidence ครบยอดสุทธิ
- รองรับ `CASH`, `TRANSFER`, `CARD`, `DEPOSIT`
- เงินมัดจำต้องเป็นของลูกค้าที่เลือกและร้านเดียวกัน

### CREDIT

- ต้องเลือกลูกค้า
- ห้ามแนบการชำระแบบ CASH, TRANSFER หรือ CARD ในคำสั่งปิดการขาย
- ระบบสร้างรายการขายเชื่อและกำหนด Delivery Note เป็นเอกสารเริ่มต้น
- Due Date อาจคำนวณจาก Payment Terms ของลูกค้า

## 6. Totals and VAT

ก่อนยืนยัน ให้ตรวจ:

- ยอดก่อนส่วนลด
- ส่วนลดรวม
- ยอดสุทธิ
- VAT และ VAT Rate
- ยอดรวมของแต่ละบรรทัดต้องตรงกับยอดเอกสาร

หากยอดหรือ VAT ไม่ตรง ระบบจะปฏิเสธด้วย `SALE_TOTAL_MISMATCH`

## 7. Payment Evidence

- CASH completion ต้องมียอด Payment Item รวมเท่ากับยอดสุทธิ
- ห้ามใส่ยอดชำระเกินยอดขาย
- `DEPOSIT` ต้องมี `customerDepositId`
- เงินมัดจำต้อง Active และมียอดคงเหลือเพียงพอ
- หากเงินมัดจำถูกใช้พร้อมกันจากอีกคำสั่ง ระบบอาจตอบ `DEPOSIT_BALANCE_CONFLICT`

## 8. Hold and Resume a Cart

### Save current cart

1. เปิด “ใบพักรายการขาย”
2. ตรวจว่ามีสินค้าอย่างน้อยหนึ่งรายการ
3. ระบุชื่อเรียกลูกค้า เบอร์โทร หรือหมายเหตุได้
4. กด “บันทึกและเปิดหน้าขายใหม่”
5. ระบบล้างตะกร้าปัจจุบันหลังบันทึกสำเร็จ

### Resume

1. เปิด Held Cart panel
2. ค้นหาด้วยรหัส ชื่อ หรือเบอร์โทร
3. เลือก “เปิดทำต่อ”
4. ตรวจข้อความ revalidation
5. หากมีราคาเปลี่ยนหรือสินค้าไม่พร้อม ให้แก้ตะกร้าก่อนยืนยัน

Held Cart เป็น snapshot เพื่อพักงาน ไม่ใช่ Inventory reservation authority

### Cancel

- ต้องระบุเหตุผล
- ใบพักที่ถูกแปลงเป็นการขายแล้วหรือยกเลิกแล้วเปิดทำต่อไม่ได้

## 9. Confirm the Sale

ก่อนกดยืนยัน:

- ตรวจลูกค้าและ Sale Mode
- ตรวจ Price Type
- ตรวจสินค้า จำนวน ราคา และส่วนลด
- ตรวจ Payment Evidence
- ตรวจตัวเลือก Receipt / Delivery Note

เมื่อยืนยัน ระบบจะ:

1. ตรวจ command identity และ safe replay
2. ตรวจ Held Cart snapshot หากมี
3. ตรวจ Stock Item, Simple Lot และ Stock Balance
4. สร้าง Sale และรายการ `items` / `simpleItems`
5. ตัด Stock ภายใน transaction
6. บันทึก Payment Evidence
7. คำนวณ Paid/Outstanding status
8. เปลี่ยน Held Cart ที่ถูกใช้จาก `OPEN` เป็น `CONVERTED`
9. Commit Sale transaction
10. ส่งผล Sale และ Document Defaults กลับ
11. พยายามเผยแพร่ Tax Candidate เป็น downstream step

Sale ที่ Commit สำเร็จแล้วเป็น authority ของการขาย แม้การเผยแพร่ Tax Candidate จะอยู่สถานะ `SKIPPED` หรือ `PENDING_RETRY` ก็ตาม ห้ามสร้าง Sale ใหม่เพื่อแก้ปัญหาภาษี

## 10. Document Defaults

- CASH ที่ชำระครบ: `RECEIPT`
- CREDIT: `DELIVERY_NOTE`
- การขอ Tax Invoice ของ CASH ต้องเป็นไปตามตัวเลือกที่ผู้ใช้เลือกและ Runtime policy

หลัง Completion สำเร็จ ให้เปิดเอกสารจากผลลัพธ์ของคำสั่งล่าสุด ห้ามสร้างยอดใหม่จากหน้าจอเอง

## 11. Tax Publication Result

ผลการเผยแพร่ Tax Candidate อาจเป็น:

- `REGISTERED` — สร้าง Tax Candidate สำเร็จ
- `REPLAYED` — พบ authority เดิมและคืนผลอย่างปลอดภัย
- `SKIPPED` — Sale ยังไม่เข้าเงื่อนไข tax-ready หรือข้อมูล authority ไม่ครบ
- `PENDING_RETRY` — downstream tax intake ล้มเหลวและต้อง Retry/Reconcile ภายหลัง

เมื่อเป็น `PENDING_RETRY` ให้ค้นหา Sale ด้วยรหัสขายหรือประวัติ ยืนยันว่า Sale สำเร็จแล้ว และใช้กระบวนการ Tax Retry/Reconciliation แยก ห้ามกดขายซ้ำ

## 12. History and Printable Recovery

ใช้ History/Printable เมื่อ:

- ต้องพิมพ์ Receipt หรือ Delivery Note ซ้ำ
- ต้องค้นหารายการด้วยรหัส ลูกค้า บริษัท หรือช่วงวันที่
- ต้องตรวจยอดชำระ ยอดคงเหลือ หรือ Payment Timeline
- ต้องยืนยันว่า Sale สำเร็จแล้วหลังหน้าจอตอบไม่แน่นอนหรือ Tax Publication ต้อง Retry

ผลค้นหาต้องแสดงเฉพาะร้านปัจจุบัน และไม่รวมรายการ `CANCELLED`

## 13. Common Errors and Recovery

| Error | Meaning | Recovery |
|---|---|---|
| `SALE_ITEMS_REQUIRED` | ไม่มีสินค้า | เพิ่มสินค้าอย่างน้อยหนึ่งรายการ |
| `DUPLICATE_STOCK_ITEM` | Stock Item เดิมซ้ำ | ลบบรรทัดซ้ำ |
| `SALE_TOTAL_MISMATCH` | ยอด/VAT ไม่ตรง | คำนวณใหม่และตรวจทุกบรรทัด |
| `CREDIT_CUSTOMER_REQUIRED` | ขายเชื่อไม่มีลูกค้า | เลือกลูกค้า |
| `PAYMENT_TOTAL_REQUIRED` | CASH ชำระไม่ครบ | เติม Payment Evidence ให้ครบ |
| `PAYMENT_EXCEEDS_TOTAL` | ยอดชำระเกิน | ลด Payment Item |
| `DEPOSIT_NOT_USABLE` | เงินมัดจำไม่ตรงลูกค้า/ร้าน | เลือกเงินมัดจำที่ถูกต้อง |
| `DEPOSIT_BALANCE_CONFLICT` | เงินมัดจำถูกใช้พร้อมกัน | โหลดข้อมูลล่าสุดและตรวจยอดคงเหลือ |
| `HELD_CART_VERSION_CONFLICT` | ใบพักถูกแก้จากอีกเครื่อง | เปิดใบพักล่าสุดอีกครั้ง |
| `HELD_CART_SNAPSHOT_CONFLICT` | ตะกร้าไม่ตรง snapshot | บันทึก/โหลดใหม่และตรวจรายการ |
| `STOCK_CONFLICT` | Stock เปลี่ยนระหว่างยืนยัน | โหลดสินค้าใหม่และแก้ตะกร้า |
| Idempotency conflict | Command เดิมใช้กับข้อมูลอื่น | ห้ามสุ่ม retry ด้วย payload ที่เปลี่ยน ให้เริ่มคำสั่งใหม่อย่างชัดเจน |
| Tax publication `PENDING_RETRY` | Sale สำเร็จ แต่ Tax Candidate ยังไม่ถูกลงทะเบียน | ตรวจ Sale ใน History แล้วใช้ Tax Retry/Reconciliation ห้ามสร้าง Sale ซ้ำ |

## 14. Operator Checklist

- [ ] อยู่ในร้านที่ถูกต้อง
- [ ] เลือก Customer ตาม Sale Mode
- [ ] เลือก Price Type ถูกต้อง
- [ ] ตรวจ Structured/SIMPLE/NON_STOCK ทุกบรรทัด
- [ ] ตรวจจำนวน ราคา ส่วนลด VAT และยอดสุทธิ
- [ ] CASH มี Payment Evidence ครบ
- [ ] CREDIT ไม่มี immediate payment
- [ ] Held Cart ผ่าน revalidation
- [ ] ตรวจ Receipt/Delivery Note option
- [ ] หลังสำเร็จ บันทึกรหัส Sale และเปิดเอกสารจากผลลัพธ์จริง
- [ ] หาก Tax Publication ไม่สำเร็จ ให้ยืนยัน Sale ใน History ก่อนดำเนินการ Retry/Reconcile

## 15. Acceptance Boundary

คู่มือนี้เป็น Draft Operational Guide สำหรับ Core Sale Completion เท่านั้น การยืนยันว่าหน้าจอ Production ทำงานครบต้องผ่าน Focused Contract, Production Build และ Human Operational Test แยกต่างหาก
