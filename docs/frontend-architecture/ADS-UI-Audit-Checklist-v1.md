# ADS UI Audit Checklist v1

ใช้รายการนี้ตรวจหน้า CRUD/Master Data ก่อนรับรอง Repository Gate และก่อนปิด Runtime/Operational Gate

## 1. Architecture Boundary

- [ ] Feature module เป็นเจ้าของ business logic, permission, validation และ API orchestration
- [ ] ADS มีเฉพาะ primitive/composite ที่เป็นกลางจริง
- [ ] ไม่มี workflow-bound component ถูกย้ายเข้า shared/common โดยไม่มีเหตุผล
- [ ] ไม่มี business-specific naming หรือ rule อยู่ใน ADS

## 2. Page Layout

- [ ] ใช้ `CrudPage` หรือ layout authority ที่ ADS กำหนด
- [ ] Title และ Description มี hierarchy ชัดเจน
- [ ] มี Primary Action เพียงหนึ่งรายการต่อบริบท
- [ ] Header, Toolbar, Content และ Pagination มี spacing rhythm เดียวกัน
- [ ] Page width ไม่กำหนดเฉพาะหน้าโดยไม่มีเหตุผล

## 3. Toolbar

- [ ] ใช้ `CrudToolbar`
- [ ] Context selector อยู่ก่อน Search เมื่อมี
- [ ] Search อยู่ในตำแหน่งคาดเดาได้
- [ ] Filter อยู่หลัง Search
- [ ] Page Size อยู่ก่อน Refresh
- [ ] เปลี่ยน Filter/Page Size แล้วกลับหน้า 1
- [ ] Controls ถูก disabled ระหว่าง runtime state ที่ไม่ควรเปลี่ยนเงื่อนไข
- [ ] ไม่มี manual “แสดงข้อมูล” gate สำหรับ CRUD ปกติ

## 4. Table

- [ ] Header, row padding และ hover ใช้มาตรฐาน ADS
- [ ] Index column แคบและคงที่
- [ ] Primary text column ขยายได้
- [ ] Status column มี alignment สม่ำเสมอ
- [ ] Action column ชิดขวาและมีพื้นที่พอ
- [ ] Numeric values จัดแนวตามชนิดข้อมูล
- [ ] ปุ่มในแถวไม่ wrap บน Desktop โดยไม่จำเป็น
- [ ] ความสูงแถวไม่ถูกดันจาก Action Group
- [ ] ใช้ `CrudTableActions` และ `CrudTableAction` เมื่อเหมาะสม

## 5. Actions

- [ ] Primary action ใช้ visual hierarchy ถูกต้อง
- [ ] Secondary action ไม่แย่งความสนใจจาก Primary
- [ ] Destructive action ใช้ danger เฉพาะงาน destructive
- [ ] Restore/activate action แยกจาก destructive ชัดเจน
- [ ] ปุ่มมีข้อความตรงกับผลที่เกิดขึ้นจริง
- [ ] ระหว่าง submit ปุ่มแสดง loading และป้องกัน duplicate action

## 6. Pagination

- [ ] ใช้ Server Pagination เมื่อ API มี `total` หรือ `totalPages`
- [ ] ไม่มี client pagination ซ้ำบนข้อมูลที่แบ่งหน้าจาก Server แล้ว
- [ ] Summary แสดงช่วงรายการและจำนวนรวม
- [ ] Page Size อยู่ในชุดค่ามาตรฐาน
- [ ] Pagination disabled ระหว่าง state ที่เหมาะสม
- [ ] หมายเลขแถวคำนวณตาม page และ page size ถูกต้อง

## 7. Feedback States

### Loading

- [ ] Initial load ใช้ `LoadingState`
- [ ] Refresh ไม่ทำให้ layout กระโดดโดยไม่จำเป็น
- [ ] Busy state ไม่ทำให้ผู้ใช้กดซ้ำ

### Empty

- [ ] แยก “ยังไม่มีข้อมูล”
- [ ] แยก “ยังไม่ได้เลือกบริบท”
- [ ] แยก “ค้นหาหรือกรองแล้วไม่พบ”
- [ ] ข้อความ Empty State ตรงกับสาเหตุจริง

### Error

- [ ] ใช้ `ErrorState`
- [ ] มี Retry เมื่อทำซ้ำได้
- [ ] Error ไม่ถูกแสดงเป็น Empty State
- [ ] ข้อความไม่เปิดเผย technical detail ที่ไม่จำเป็นแก่ผู้ใช้

### Success/Warning

- [ ] หลัง success UI state ตรงกับข้อมูลจริง
- [ ] Warning ใช้เฉพาะกรณีที่ผู้ใช้ยังดำเนินการต่อได้

## 8. Dialog

- [ ] ใช้ `ConfirmActionDialog` สำหรับ destructive/irreversible action
- [ ] Title ระบุการกระทำชัดเจน
- [ ] Description ระบุ entity ที่ได้รับผลกระทบ
- [ ] Confirm label ตรงกับ action
- [ ] Loading label แสดงระหว่าง submit
- [ ] Dialog ปิดเมื่อสำเร็จหรือผู้ใช้ยกเลิก ไม่ปิดหลอกเมื่อ action ล้มเหลว

## 9. Runtime Behavior

- [ ] หน้าโหลดข้อมูลอัตโนมัติเมื่อไม่มีเหตุผลให้ manual query
- [ ] Search/Filter/Page/Page Size สะท้อนผลลัพธ์จริง
- [ ] Refresh ใช้ context ปัจจุบัน
- [ ] Save/Delete/Toggle synchronize list และ related options/mappings
- [ ] Action ล้มเหลวไม่ทำให้ UI ดูเหมือนสำเร็จ
- [ ] ป้องกัน race หรือ duplicate request ตามความเสี่ยง
- [ ] URL เก็บ state ที่จำเป็นต่อ reload/share เมื่อเหมาะสม

## 10. Responsive and Accessibility

- [ ] Toolbar ใช้งานได้บนมือถือ
- [ ] Table มี horizontal overflow อย่างปลอดภัย
- [ ] Action text ไม่ตัดบรรทัดจนความหมายเสีย
- [ ] Primary action responsive ตามมาตรฐาน
- [ ] Dialog scroll ภายในได้
- [ ] Control มี label/accessibility name
- [ ] Focus state มองเห็นได้
- [ ] สีไม่ใช่สื่อสถานะเพียงอย่างเดียว

## 11. Visual Consistency

- [ ] Typography ใช้ ADS role/scale
- [ ] Spacing ใช้ scale 4/8/12/16/24/32/48
- [ ] Radius, border และ shadow มาจาก ADS token
- [ ] Status language ใช้คำเดียวกันทั้งระบบ
- [ ] UI ไม่กระโดดเมื่อสลับระหว่าง Master Data pages
- [ ] ไม่มี local CSS override ที่ทำให้หน้าดูเป็นคนละผลิตภัณฑ์

## 12. Gate Decision

### Repository Gate

- [ ] Architecture PASS
- [ ] Domain PASS
- [ ] API Contract PASS
- [ ] Behavior PASS จาก code evidence
- [ ] UX/Visual PASS จาก code และ screenshot evidence
- [ ] Code Quality PASS

### Runtime Gate

- [ ] Lint PASS
- [ ] Build PASS
- [ ] Runtime smoke PASS

### Operational Gate

- [ ] Initial load PASS
- [ ] Search/Filter PASS
- [ ] Pagination PASS
- [ ] Create/Edit PASS ตาม scope
- [ ] Archive/Deactivate/Restore PASS ตาม scope
- [ ] Mapping/Relation PASS ตาม scope
- [ ] Error/Retry PASS
- [ ] Production หรือ staging evidence ถูกบันทึก

## Severity Guide

- P0: ระบบใช้ไม่ได้หรือข้อมูลเสียหาย
- P1: Business logic/permission/data correctness ผิด
- P2: UX regression ที่รบกวนการใช้งานหรือทำให้มาตรฐานแตก
- P3: Cosmetic polish ที่ไม่ขัดขวาง workflow

Wave 1 ต้องไม่มี P2 ขึ้นไปที่ยังเปิดอยู่ ส่วน P3 สามารถบันทึกเป็น Visual Polish Backlog ได้
