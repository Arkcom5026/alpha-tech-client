# Core Sales Operational User Guide (Draft)

## 1. Purpose

คู่มือนี้อธิบายการขายสินค้าตั้งแต่ค้นหาและเลือกลูกค้าของร้าน เพิ่มสินค้าเข้าตะกร้า รับชำระหรือขายเชื่อ ไปจนถึงเปิดเอกสารเริ่มต้น โดยอ้างอิง `CreateSalePage` และ Server Core Sale Completion authority

> Sale Return ไม่อยู่ในคู่มือนี้ และต้องใช้คู่มือ/Increment แยก

## 2. Main Screen Areas

1. Customer section — ช่องค้นหาลูกค้าเดียว รายการผลลัพธ์ เพิ่ม/แก้ไข และล้างลูกค้า
2. Price type and item search — ราคาปลีก ราคาช่าง ราคาส่ง และช่องยิง Barcode
3. Sale cart — Structured Stock Item และ SIMPLE product
4. Payment section — CASH/CREDIT วิธีชำระ และตัวเลือกเอกสาร
5. Held Cart panel — พักรายการ ค้นหา เปิดทำต่อ และยกเลิก
6. Completion handoff — เปิด Receipt หรือ Delivery Note หลังยืนยันสำเร็จ

## 3. Before Starting

- ตรวจว่าพนักงานอยู่ในร้านที่ถูกต้อง
- หากต้องเลือกลูกค้า ให้ค้นหาจากช่องเดียวและตรวจผลลัพธ์ก่อนเลือก
- หากเป็นขายเชื่อ ต้องเลือก Customer ก่อน
- เลือกประเภทราคาให้ตรงกับลูกค้า
- ตรวจว่าสินค้าเป็นของร้านปัจจุบัน
- ห้ามขาย Stock Item เดิมซ้ำในตะกร้าเดียวกัน

## 4. Customer Search and Selection

### ช่องค้นหาเดียว

พนักงานไม่ต้องเลือกโหมดชื่อหรือเบอร์โทร สามารถค้นหาด้วย:

- ชื่อหรือนามสกุล
- เบอร์โทรศัพท์
- บริษัทหรือหน่วยงาน
- อีเมล
- เลขผู้เสียภาษี

ระบบค้นหาเฉพาะลูกค้าที่มีความสัมพันธ์กับร้านปัจจุบัน และแสดงหลายผลลัพธ์ให้เลือกเมื่อมีชื่อหรือข้อมูลใกล้เคียงกัน ให้ตรวจชื่อ เบอร์โทร บริษัท และเลขผู้เสียภาษีก่อนเลือก

### ขอบเขตของช่องค้นหา Sale

ช่องนี้ค้นหาเฉพาะลูกค้า ไม่ค้นหา:

- สินค้าหรือรุ่น
- Barcode
- Serial Number
- IMEI
- Service Tag
- งานซ่อม งานเคลม หรือ Intake context

ข้อมูลอุปกรณ์ยังเป็นความรับผิดชอบของ Repair/Claim workflow

### ไม่พบลูกค้า

เมื่อไม่พบลูกค้าในร้าน พนักงานสามารถเพิ่มลูกค้าใหม่จากหน้าเดิมได้ ระบบออก first-association evidence แบบชั่วคราว ซึ่งผูกกับลูกค้า ร้าน พนักงาน และ session ปัจจุบัน เพื่อให้ทำ Sale แรกได้ เมื่อ Sale แรกสำเร็จ ตัว Sale จะเป็นหลักฐานความสัมพันธ์กับร้านถาวร

หากเบอร์โทรเป็นลูกค้าของร้านอื่น ระบบต้องไม่ดึงลูกค้ารายนั้นเข้ามาใช้และไม่ออก first-association evidence

### เงินมัดจำ

Customer Search เป็น authority แยกจาก Customer Deposit หลังเลือกลูกค้าแล้วจึงโหลดเงินมัดจำของลูกค้ารายนั้นในร้านปัจจุบัน ห้ามใช้เงินมัดจำของลูกค้าหรือร้านอื่น

## 5. Add Items to the Cart

### Structured Stock Item

- ยิง Barcode ของชิ้นสินค้าที่มีตัวตนเฉพาะ
- แต่ละ Stock Item มีจำนวน 1
- ต้องยังเป็น `IN_STOCK` ในร้านปัจจุบัน

### Tracked SIMPLE product

- เลือกสินค้าและระบุจำนวน
- ต้องมี Simple Lot ที่ตรงกับสินค้าและร้าน
- Lot และ Stock Balance ต้องเพียงพอ

### NON_STOCK SIMPLE / service-style product

- เพิ่มรายการและจำนวนได้โดยไม่ตัด Stock Balance
- สินค้าต้อง Active และอยู่ในขอบเขตร้าน

## 6. Customer and Sale Mode

### CASH

- เลือกลูกค้าหรือขายแบบไม่ระบุลูกค้าได้ตามนโยบายร้าน
- ต้องมี Payment Evidence ครบยอดสุทธิ
- รองรับ `CASH`, `TRANSFER`, `CARD`, `DEPOSIT`

### CREDIT

- ต้องเลือกลูกค้า
- ห้ามแนบ CASH, TRANSFER หรือ CARD ในคำสั่งปิดการขาย
- เอกสารเริ่มต้นคือ Delivery Note
- Due Date อาจคำนวณจาก Payment Terms

## 7. Totals, VAT, and Payment Evidence

ตรวจยอดก่อนส่วนลด ส่วนลดรวม ยอดสุทธิ VAT และ VAT Rate ให้ตรงกับทุกบรรทัด หากไม่ตรง ระบบตอบ `SALE_TOTAL_MISMATCH`

- CASH completion ต้องมียอด Payment Item รวมเท่ากับยอดสุทธิ
- ห้ามยอดชำระเกินยอดขาย
- `DEPOSIT` ต้องมี `customerDepositId`
- เงินมัดจำต้อง Active เป็นของลูกค้าและร้านเดียวกัน และมียอดเพียงพอ

## 8. Hold and Resume a Cart

### Save current cart

1. เปิด “ใบพักรายการขาย”
2. ตรวจว่ามีสินค้าอย่างน้อยหนึ่งรายการ
3. ระบุชื่อเรียก เบอร์โทร หรือหมายเหตุ
4. บันทึกและเปิดหน้าขายใหม่

### Resume

1. เปิด Held Cart panel
2. ค้นหาด้วยรหัส ชื่อ หรือเบอร์โทร
3. เปิดทำต่อ
4. ตรวจ revalidation
5. แก้ราคา สินค้า หรือลูกค้าก่อนยืนยันเมื่อข้อมูลเปลี่ยน

Held Cart เป็น snapshot ไม่ใช่ Inventory reservation authority

## 9. Confirm the Sale

ก่อนยืนยัน ให้ตรวจลูกค้า Sale Mode, Price Type, สินค้า จำนวน ราคา ส่วนลด Payment Evidence และเอกสาร

Server จะตรวจตามลำดับ:

1. Command identity และ safe replay
2. Customer branch access หรือ first-association evidence
3. Held Cart snapshot หากมี
4. Stock Item, Simple Lot และ Stock Balance
5. สร้าง Sale, items/simpleItems และตัด Stock ใน transaction
6. บันทึก Payment Evidence และสถานะชำระ
7. เปลี่ยน Held Cart เป็น `CONVERTED` เมื่อเกี่ยวข้อง
8. Commit Sale transaction
9. ส่ง Sale และ Document Defaults กลับ
10. เผยแพร่ Tax Candidate เป็น downstream step

หาก Server ตอบ `SALE_CUSTOMER_NOT_ACCESSIBLE_IN_BRANCH` ให้ค้นหาและเลือกลูกค้าของร้านอีกครั้ง ระบบต้องคงตะกร้าและข้อมูลการชำระไว้ ห้ามแก้ด้วยการส่ง Customer ID โดยตรง กรณีลูกค้าใหม่ที่หลักฐานหมดอายุหรือไม่ตรงกับร้าน/พนักงานจะใช้ error เดียวกันเพื่อไม่เปิดเผยข้อมูลลูกค้าข้ามร้าน

## 10. Document Defaults

- CASH ที่ชำระครบ: `RECEIPT`
- CREDIT: `DELIVERY_NOTE`
- ใบกำกับภาษีอย่างย่อและเต็มรูปออกได้เฉพาะ Sale สถานะ `PAID`
- `CREDIT`, `UNPAID`, `PARTIALLY_PAID` ใช้ได้เฉพาะ `DELIVERY_NOTE`

## 11. Tax Publication Result

ผลอาจเป็น `REGISTERED`, `REPLAYED`, `SKIPPED` หรือ `PENDING_RETRY` หาก Sale สำเร็จแล้วแต่ Tax Candidate ต้อง Retry ห้ามสร้าง Sale ใหม่ ให้ใช้ Tax Retry/Reconciliation แยก

## 12. History and Printable Recovery

ใช้ History/Printable เมื่อต้องพิมพ์เอกสารซ้ำ ค้นหาด้วยรหัส ลูกค้า บริษัท หรือช่วงวันที่ ตรวจยอดชำระ หรือยืนยัน Sale หลัง response ไม่แน่นอน ผลต้องจำกัดเฉพาะร้านปัจจุบันและไม่รวม `CANCELLED`

## 13. Common Errors and Recovery

| Error | Meaning | Recovery |
|---|---|---|
| `SALE_CUSTOMER_NOT_ACCESSIBLE_IN_BRANCH` | Customer ID ไม่มีสิทธิ์ใช้ในร้านนี้ หรือ first-association evidence ใช้ไม่ได้ | ค้นหาและเลือกลูกค้าของร้านใหม่ หรือสร้างลูกค้าใหม่อีกครั้งใน session ปัจจุบัน ตะกร้าและ Payment ต้องไม่ถูกล้าง |
| `CUSTOMER_PHONE_NOT_AVAILABLE_IN_BRANCH` | เบอร์นี้เป็นลูกค้าของร้านอื่น | ห้ามดึงข้อมูลข้ามร้าน ให้ตรวจเบอร์หรือสร้างความสัมพันธ์ผ่าน workflow ที่ได้รับอนุญาต |
| `CREDIT_CUSTOMER_REQUIRED` | ขายเชื่อไม่มีลูกค้า | เลือกลูกค้า |
| `SALE_ITEMS_REQUIRED` | ไม่มีสินค้า | เพิ่มสินค้าอย่างน้อยหนึ่งรายการ |
| `DUPLICATE_STOCK_ITEM` | Stock Item เดิมซ้ำ | ลบบรรทัดซ้ำ |
| `SALE_TOTAL_MISMATCH` | ยอด/VAT ไม่ตรง | คำนวณใหม่และตรวจทุกบรรทัด |
| `PAYMENT_TOTAL_REQUIRED` | CASH ชำระไม่ครบ | เติม Payment Evidence ให้ครบ |
| `PAYMENT_EXCEEDS_TOTAL` | ยอดชำระเกิน | ลด Payment Item |
| `DEPOSIT_NOT_USABLE` | เงินมัดจำไม่ตรงลูกค้า/ร้าน | เลือกเงินมัดจำที่ถูกต้อง |
| `DEPOSIT_BALANCE_CONFLICT` | เงินมัดจำถูกใช้พร้อมกัน | โหลดข้อมูลล่าสุด |
| `HELD_CART_VERSION_CONFLICT` | ใบพักถูกแก้จากอีกเครื่อง | เปิดใบพักล่าสุด |
| `HELD_CART_SNAPSHOT_CONFLICT` | ตะกร้าไม่ตรง snapshot | โหลดใหม่และตรวจรายการ |
| `STOCK_CONFLICT` | Stock เปลี่ยนระหว่างยืนยัน | โหลดสินค้าใหม่และแก้ตะกร้า |
| Idempotency conflict | Command เดิมใช้กับ payload อื่น | ห้าม retry ด้วย payload ที่เปลี่ยน |

## 14. Operator Checklist

- [ ] อยู่ในร้านที่ถูกต้อง
- [ ] ค้นหาลูกค้าจากช่องเดียวและตรวจผลลัพธ์ว่าเป็นของร้านปัจจุบัน
- [ ] หากเพิ่มลูกค้าใหม่ ทำ Sale แรกภายใน session ที่ได้รับ evidence
- [ ] เลือก Customer ตาม Sale Mode
- [ ] เลือก Price Type ถูกต้อง
- [ ] ตรวจ Structured/SIMPLE/NON_STOCK ทุกบรรทัด
- [ ] ตรวจจำนวน ราคา ส่วนลด VAT และยอดสุทธิ
- [ ] CASH มี Payment Evidence ครบ
- [ ] CREDIT ไม่มี immediate payment
- [ ] Held Cart ผ่าน revalidation
- [ ] ตรวจ Receipt/Delivery Note option
- [ ] หลังสำเร็จ บันทึกรหัส Sale และเปิดเอกสารจากผลลัพธ์จริง

## 15. Acceptance Boundary

คู่มือนี้เป็น Draft Operational Guide การยืนยัน runtime ต้องผ่าน Focused Contract, Build, Browser E2E, Test-DB post-condition และ Human Operational Test แยกต่างหาก
