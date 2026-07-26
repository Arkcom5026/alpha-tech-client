# ADS Wave 1 Reference Certification

## Mission

ยกระดับ Master Data ทั้ง 7 โมดูลให้เป็นมาตรฐานอ้างอิงเดียวกันของ Alpha-Tech ก่อนขยายไปยังโมดูลที่ซับซ้อนกว่า

โมดูลในขอบเขต:

1. Position
2. Bank
3. Category
4. Supplier
5. Brand
6. Product Type
7. Unit

งานนี้ไม่ใช่เพียง Visual Standardization แต่เป็น Architecture, Behavior, Runtime และ Code Audit ไปพร้อมกัน

## Core Rule

ทุกความแตกต่างระหว่างโมดูลต้องจำแนกได้ว่าเป็นอย่างใดอย่างหนึ่ง:

- ความแตกต่างที่จำเป็นจาก Business Requirement
- Technical Debt จากการพัฒนาในช่วงที่มาตรฐานยังไม่ชัด

ความแตกต่างประเภทที่สองต้องถูกยกระดับเข้าสู่มาตรฐานเดียวกัน

## Reference Behavior v1

สำหรับหน้า Master Data CRUD ที่ไม่มีเหตุผลทางธุรกิจหรือข้อจำกัดด้านข้อมูลเป็นกรณีพิเศษ:

- เปิดหน้าแล้วโหลดรายการอัตโนมัติ
- ไม่ต้องกดปุ่ม “แสดงข้อมูล” ก่อน
- Search, Filter, Include Inactive, Page และ Page Size ต้องสะท้อนผลลัพธ์โดยตรง
- เปลี่ยน Filter หรือ Page Size แล้วกลับไปหน้า 1
- URL Query String ต้องรักษาสถานะที่จำเป็นต่อการ Reload/Share หน้า
- ใช้ Pagination จาก API เมื่อ API มีข้อมูล `total` และ `totalPages`
- ไม่แบ่งหน้าซ้ำที่ Client บนข้อมูลซึ่งถูกแบ่งหน้าจาก Server แล้ว
- Loading, Empty, Error และ Retry ต้องมีพฤติกรรมคาดเดาได้เหมือนกัน

ข้อยกเว้นสำหรับ Manual Query ต้องมีเหตุผลชัดเจน เช่น Query มีต้นทุนสูงมาก, ต้องกรอกเงื่อนไขบังคับก่อน หรือเป็นรายงาน/งานวิเคราะห์ ไม่ใช่ CRUD พื้นฐาน

## Audit Dimensions

### 1. Architecture

- Feature และ ADS ownership ชัดเจน
- Business logic ไม่หลุดเข้า Design System
- Workflow-bound UI อยู่ภายในโมดูล
- Shared component มีเฉพาะ primitive/composite ที่เป็นกลางจริง

### 2. Domain

- Naming และสถานะของ Entity สอดคล้องกัน
- Create, Edit, Archive/Deactivate และ Restore ครบตามนโยบาย
- Relation และ Mapping สะท้อนความต้องการธุรกิจจริง

### 3. API Contract

- Parameter naming และชนิดข้อมูลสม่ำเสมอ
- Response รองรับ items, total และ totalPages อย่างชัดเจน
- Search, Filter, Pagination และ Error contract มีพฤติกรรมเดียวกัน

### 4. Behavior and Workflow

- Initial load
- Search trigger
- Filter and reset
- Pagination
- Save and refresh
- Archive/restore
- Dialog lifecycle
- Focus and keyboard behavior
- URL state

### 5. UX and Visual

- Page width and spacing
- Header and primary action
- Toolbar layout
- Input, Select and Checkbox alignment
- Table header, row and action column
- Badge and status language
- Dialog and responsive behavior

### 6. Runtime

- Loading
- Empty
- Error and retry
- Disabled/submitting state
- Race and duplicate request prevention
- State after navigation and reload

### 7. Code Quality

- Naming and file layout
- Effects and state ownership
- Duplicate/dead code
- Client/server pagination correctness
- Maintainability and testability

## Certification Gate

แต่ละโมดูลต้องมีสถานะต่อไปนี้ก่อนรับรอง:

- Architecture: PASS
- Domain: PASS
- API Contract: PASS
- Behavior: PASS
- UX/Visual: PASS
- Runtime: PASS
- Code Quality: PASS

Wave 1 จะถือว่าเสร็จเมื่อทั้ง 7 โมดูลผ่านเกณฑ์เดียวกัน และ Runtime evidence ยืนยันว่าการทำงานจริงสอดคล้องกับมาตรฐาน

## First Audit Finding

Product Type เคยบังคับให้ผู้ใช้กด “แสดงข้อมูล” ก่อน ขณะที่ Master Data อื่นโหลดอัตโนมัติ ทั้งที่ไม่มีเหตุผลด้านธุรกิจหรือ Query cost รองรับพฤติกรรมที่แตกต่าง

มติ:

- Product Type ต้องโหลดอัตโนมัติ
- ถอด Manual “แสดงข้อมูล” gate
- ใช้ Server pagination จาก `total` และ `totalPages`
- เพิ่ม Search control ที่เชื่อมกับ state และ URL

การปรับนี้เป็นการแก้ Behavior และ Pagination debt ไม่ใช่เพียงปรับหน้าตา
