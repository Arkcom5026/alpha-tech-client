# ADS Wave 1 Certification Report

## Scope

เอกสารนี้สรุปผลการตรวจหน้า Master Data CRUD จำนวน 7 โมดูลตาม `ADS Experience Contract v1` และ `ADS UI Audit Checklist v1`

โมดูลในขอบเขต:

1. Product Type
2. Position
3. Bank
4. Category
5. Supplier
6. Unit
7. Brand

## Evidence Basis

การรับรองรอบนี้อ้างอิงจาก:

- โครงสร้างและโค้ดบน `main`
- การใช้ ADS primitives/composites ในแต่ละหน้า
- พฤติกรรมที่ปรากฏจาก production screenshots ที่ตรวจร่วมกัน
- การแก้ regression ของ `CrudTableActions` ให้ action group อยู่บรรทัดเดียว

ข้อจำกัด:

- รอบนี้เป็น Repository + Visual/Operational Evidence Review
- ไม่มีการรัน local build, lint, test หรือ browser automation จาก connector
- ดังนั้น Runtime Gate ยังต้องอาศัย production evidence และ human verification ที่มีอยู่

## Certification Summary

| Module | Architecture | Behavior | UX/Visual | Feedback | Table/Actions | Runtime Evidence | Result |
|---|---|---|---|---|---|---|---|
| Product Type | PASS | PASS | PASS | PASS | PASS | PASS with evidence | CERTIFIED |
| Position | PASS | PASS | PASS | PASS | PASS | PASS with evidence | CERTIFIED |
| Bank | PASS | PASS | PASS | PASS | PASS | PASS with evidence | CERTIFIED |
| Category | PASS | PASS | PASS | PASS | PASS | PASS with evidence | CERTIFIED |
| Supplier | PASS | PASS | PASS | PASS | PASS | PASS with evidence | CERTIFIED |
| Unit | PASS | PASS | PASS | PASS | PASS | PASS with evidence | CERTIFIED |
| Brand | PASS | PASS | PASS | PASS | PASS | PASS with evidence | REFERENCE CERTIFIED |

## Findings by Severity

### P0 — Critical

ไม่มี

### P1 — Functional

ไม่มี

### P2 — UX Regression

ปิดทั้งหมดในขอบเขต Wave 1

- Brand action buttons เคย wrap เป็นแนวตั้ง
- แก้ที่ ADS shared composite `CrudTableActions`
- ผลลัพธ์: action group บน desktop อยู่บรรทัดเดียวและ row height กลับสู่มาตรฐาน

### P3 — Visual Polish

รายการต่อไปนี้ไม่ขวางการรับรอง และเลื่อนไป Wave 2:

- ทำ table primitive/composite กลางเพื่อลดการประกาศ `<table>` ซ้ำ
- ทำ toolbar field-label primitive ให้ label rhythm เหมือนกันทุกหน้า
- ทำ URL-state helper สำหรับหน้า CRUD ที่ยังเก็บ filter state ใน local/store เท่านั้น
- ทำ shared result-summary pattern ให้ข้อความและตำแหน่งเหมือนกันทั้งหมด
- เพิ่ม automated visual regression เมื่อ infrastructure พร้อม

## Module Notes

### Product Type

- โหลดรายการอัตโนมัติแล้ว
- Search, include inactive, page และ page size เชื่อมกับ URL state
- ใช้ server pagination metadata
- เป็น reference สำหรับ URL-preserved CRUD state

### Position

- มี search, status filter, page size, pagination และ confirm dialog
- แยก loading/error/empty state ชัดเจน
- table actions ใช้ ADS composite

### Bank

- Permission-aware primary/action controls
- แยก active/inactive state ชัดเจน
- confirm dialog และ pagination อยู่ใน ADS pattern

### Category

- ใช้ ADS shell, toolbar, feedback states และ pagination ครบ
- table ownership อยู่ภายใน feature module ผ่าน `CategoryTable`

### Supplier

- รองรับ branch context และ warning state เมื่อยังไม่เลือกสาขา
- คง module-owned workflow และใช้ ADS เป็น neutral experience layer
- responsive width กว้างขึ้นตามลักษณะข้อมูล ไม่ถือเป็น UI divergence

### Unit

- search และ pagination ทำ client-side บนรายการทั้งหมด เนื่องจาก API contract ปัจจุบันยังไม่ส่ง server pagination metadata
- พฤติกรรมนี้ยอมรับได้ใน Wave 1 แต่ถ้า API เพิ่ม `total/totalPages` ต้องย้ายไป server pagination ตาม contract
- loading, error, empty, confirm delete และ table action ผ่านมาตรฐาน

### Brand

- เป็นโมดูลซับซ้อนที่สุดใน Wave 1 เพราะมี relation/mapping panel
- ใช้ scope selector, search, inactive filter, page size และ refresh ตามลำดับ toolbar contract
- mapping UI อยู่ใน feature module ไม่ย้าย business logic เข้า ADS
- ผ่าน visual QC หลังแก้ `CrudTableActions`
- รับรองเป็น Final Complex Reference ของ Wave 1

## Wave 1 Freeze Decision

สถานะ:

`ADS WAVE 1 — CERTIFIED AND FROZEN`

สิ่งที่ Freeze:

- CRUD page shell
- primary action placement
- toolbar ordering
- loading/empty/error patterns
- table action behavior
- pagination placement
- confirm dialog behavior
- responsive desktop action-group behavior

การเปลี่ยนแปลงหลังจากนี้ต้องเป็นอย่างใดอย่างหนึ่ง:

1. แก้ defect ที่พิสูจน์ได้
2. เพิ่ม capability แบบ backward-compatible
3. ยกระดับ ADS ทั้งระบบใน Wave 2
4. มี business requirement ที่ชัดเจนและบันทึก exception

ห้าม patch เฉพาะหน้าเพื่อเปลี่ยน visual/behavior โดยไม่ตรวจผลกระทบต่อ ADS standard

## Reference Authority

ลำดับ authority หลังปิด Wave 1:

1. `ADS-Experience-Contract-v1.md`
2. `ADS-UI-Audit-Checklist-v1.md`
3. `ADS-Wave-1-Reference-Certification.md`
4. `ADS-Wave-1-Certification-Report.md`
5. Brand เป็น Final Complex Reference
6. Product Type เป็น URL-State Reference
7. หน้าทั้ง 7 โมดูลเป็น Master Data Reference Set

## Final Decision

Wave 1 บรรลุเป้าหมายหลักแล้ว:

- ทุกหน้าให้ความรู้สึกว่าอยู่ในผลิตภัณฑ์เดียวกัน
- UI ไม่กระโดดจาก pattern หลักโดยไม่มีเหตุผลทางธุรกิจ
- ADS ทำหน้าที่เป็น shared experience โดยไม่ดูด business workflow ออกจาก module
- ไม่มี P0, P1 หรือ P2 ค้างในขอบเขตที่ตรวจ

โมดูล Product, Inventory, Purchase, Repair, Claim และ POS ที่พัฒนาต่อจากนี้ต้องใช้ Wave 1 เป็นฐาน แต่ยังคงเป็นเจ้าของ workflow-bound UI ของตนเอง
