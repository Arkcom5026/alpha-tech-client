# ADS Experience Contract v1

## Purpose

เอกสารนี้กำหนดมาตรฐานประสบการณ์ผู้ใช้ของ Alpha-Tech Design System (ADS) สำหรับหน้า CRUD และ Master Data เพื่อให้ทุกหน้ารู้สึกว่าเป็นผลิตภัณฑ์เดียวกัน แม้แต่ละโมดูลจะมี Business Logic และ Workflow ของตนเอง

เป้าหมายหลักคือ:

- ลด UI jump และความรู้สึกสะดุดระหว่างหน้า
- ให้ผู้ใช้คาดเดาตำแหน่ง การทำงาน และผลตอบสนองของระบบได้
- รักษา Module Ownership โดยแชร์เฉพาะ Primitive และ Composite ที่เป็นกลางจริง
- ทำให้หน้าใหม่เริ่มจากมาตรฐานที่ใช้งานจริงแล้ว ไม่ใช่เริ่มจากหน้าว่าง

## Architecture Boundary

ADS เป็นเจ้าของ:

- Visual primitives
- Layout primitives
- Neutral CRUD composites
- Feedback states
- Interaction conventions ที่ไม่ผูกกับ Business Workflow

Feature module เป็นเจ้าของ:

- Domain rules
- Data mapping
- Validation
- Permission
- API orchestration
- Workflow-bound UI
- Business-specific columns, filters and actions

ห้ามย้าย Business Logic เข้า ADS เพียงเพื่อให้ reuse ได้

## CRUD Page Contract

หน้า CRUD มาตรฐานควรเรียงโครงสร้างดังนี้:

1. Page Header
2. Page Description
3. Primary Action
4. Toolbar
5. Optional relation/mapping panel
6. Result summary
7. Table or list
8. Pagination
9. Confirm dialog or secondary overlays

### Page Header

- Title ต้องอธิบายงานของหน้าโดยตรง
- Description ต้องสั้น ชัด และบอกขอบเขตของข้อมูล
- Primary Action อยู่ในตำแหน่งเดียวกันของทุกหน้า
- ห้ามมี Primary Action มากกว่าหนึ่งรายการโดยไม่มีเหตุผลด้าน workflow

### Page Width

- ใช้ `CrudPage` เป็น layout authority ของหน้า CRUD
- ความกว้างต้องเลือกจาก scale ที่ ADS รองรับ
- ห้ามกำหนด max-width แบบเฉพาะหน้าโดยไม่มีเหตุผลด้านข้อมูล

## Spacing Contract

ใช้ spacing scale เดียวกันทั้งระบบ:

- 4px: micro spacing
- 8px: compact control spacing
- 12px: dense content spacing
- 16px: standard internal spacing
- 24px: section spacing
- 32px: major section spacing
- 48px: page-level separation

กฎหลัก:

- Header ถึง Toolbar: 24px โดยประมาณ
- Toolbar ถึง content card: 16px
- ระหว่าง major sections: 16–24px
- ภายใน Card: 16px เป็นค่าเริ่มต้น
- ห้ามใช้ spacing แบบสุ่ม เช่น 18px, 22px หรือ 27px เว้นแต่ ADS token รองรับ

## Typography Contract

บทบาทข้อความมาตรฐาน:

- Page Title: หัวข้อหลักของหน้า
- Page Description: คำอธิบายสั้นใต้หัวข้อ
- Section Title: หัวข้อย่อยของกลุ่มข้อมูล
- Field Label: ชื่อ input/filter
- Helper Text: คำอธิบายเพิ่มเติม
- Caption: metadata, summary, pagination
- Table Header: ชื่อ column
- Table Body: ข้อมูลหลัก

กฎหลัก:

- ห้ามใช้ขนาดตัวอักษรตามความรู้สึกเฉพาะหน้า
- สีข้อความต้องมาจาก ADS token
- หัวข้อและคำอธิบายต้องมี hierarchy ชัดเจน
- ข้อความสถานะต้องใช้คำเดียวกันทั้งระบบ เช่น `ใช้งาน`, `ปิดใช้งาน`, `กำลังโหลด...`

## Action Contract

### Primary

ใช้กับการกระทำหลักของหน้า เช่น:

- เพิ่มสินค้า
- เพิ่มแบรนด์
- บันทึก

ข้อกำหนด:

- ใช้ `CrudPrimaryAction` หรือ Button variant ที่ ADS กำหนด
- มีเพียงหนึ่ง Primary Action ต่อบริบท

### Secondary

ใช้กับการกระทำสนับสนุน เช่น:

- รีเฟรช
- แก้ไข
- ยกเลิก

### Destructive

ใช้กับการกระทำที่ลดสถานะหรือลบข้อมูล เช่น:

- ลบ
- ปิดใช้งาน
- ถอดความสัมพันธ์

ข้อกำหนด:

- ต้องใช้ Confirm Dialog เมื่อผลกระทบย้อนกลับยากหรือกระทบความสัมพันธ์
- ห้ามใช้สี danger กับ action ที่ไม่ destructive

### Restore

ใช้กับ:

- เปิดใช้งาน
- กู้คืน

### Table Actions

- ใช้ `CrudTableActions`
- บน Desktop ควรอยู่บรรทัดเดียว
- ห้าม wrap โดยไม่จำเป็น
- ปุ่มต้องมีความสูงเท่ากันและไม่หดจนข้อความตัดบรรทัด
- Action column ต้องมีพื้นที่เพียงพอและ padding สม่ำเสมอ

## Toolbar Contract

Toolbar มาตรฐานเรียงตามลำดับ:

1. Primary context selector หรือ scope selector
2. Search
3. Filter
4. Page size
5. Refresh

ข้อกำหนด:

- ใช้ `CrudToolbar`
- Search ต้องอยู่ในตำแหน่งคาดเดาได้
- Filter หรือ Page Size เปลี่ยนแล้วต้องกลับหน้า 1
- Controls ต้อง disabled ระหว่าง state ที่ห้ามผู้ใช้เปลี่ยนเงื่อนไข
- หลีกเลี่ยง manual “แสดงข้อมูล” สำหรับ CRUD ปกติ

## Table Contract

### Structure

- Header ชัดเจน
- Body ใช้ row rhythm เดียวกัน
- Hover behavior สม่ำเสมอ
- Number alignment ชิดขวาหรือกึ่งกลางตามชนิดข้อมูล
- Text alignment ชิดซ้าย
- Status alignment กึ่งกลาง
- Action alignment ชิดขวา

### Row Density

- ความสูงของแถวต้องเกิดจาก content ไม่ใช่ปุ่มที่ wrap
- Cell padding ใช้มาตรฐานเดียวกัน
- ห้ามกำหนด row height เฉพาะหน้าโดยไม่มีเหตุผล

### Column Roles

- Index column: แคบและคงที่
- Primary text column: ขยายได้
- Status column: คงที่
- Action column: คงที่และพอสำหรับ action group

### Pagination

- ใช้ Server Pagination เมื่อ API มี `total` หรือ `totalPages`
- ห้ามแบ่งหน้าซ้ำที่ Client
- Summary ต้องบอกช่วงรายการและจำนวนรวม
- ใช้ `CrudPagination`

## Feedback Contract

### Loading

- Initial load: ใช้ `LoadingState`
- Refresh ที่มีข้อมูลเดิม: คงข้อมูลไว้และแสดง busy state แบบไม่ทำให้ layout กระโดด
- ปุ่ม submit ต้องแสดง loading และ disabled
- ป้องกัน duplicate action

### Empty

แยกอย่างน้อย 3 กรณี:

1. ยังไม่มีข้อมูล
2. ยังไม่ได้เลือกบริบทที่จำเป็น
3. ค้นหาหรือกรองแล้วไม่พบ

ต้องใช้ข้อความที่ตรงกับสาเหตุจริง

### Error

- ใช้ `ErrorState`
- แสดงข้อความที่ผู้ใช้เข้าใจได้
- มี Retry เมื่อดำเนินการซ้ำได้
- ห้ามซ่อน error แล้วปล่อยหน้าเป็น empty state

### Success

- หลังบันทึกสำเร็จ state ต้องสอดคล้องกับข้อมูลจริง
- หลีกเลี่ยงการรีโหลดทั้งหน้าโดยไม่จำเป็น
- Feedback ต้องไม่แย่งความสนใจจากงานหลัก

### Warning

- ใช้เมื่อผู้ใช้ยังดำเนินการต่อได้ แต่ต้องรับรู้ข้อจำกัด
- ห้ามใช้ Warning แทน Error

## Dialog Contract

ใช้ `ConfirmActionDialog` สำหรับ destructive หรือ irreversible action

ข้อกำหนด:

- Title ต้องบอกการกระทำ
- Description ต้องระบุ entity ที่ได้รับผลกระทบ
- Confirm label ต้องตรงกับการกระทำจริง
- Danger action ใช้ danger variant
- ระหว่าง submit ต้องปิดการกดซ้ำและเปลี่ยน loading label
- ปิด dialog เฉพาะเมื่อ action สำเร็จ หรือผู้ใช้ยกเลิก

## Runtime Behavior Contract

- หน้า CRUD โหลดข้อมูลอัตโนมัติ เว้นแต่ query มีต้นทุนสูงหรือมีเงื่อนไขบังคับ
- Search, Filter, Page, Page Size ต้องสะท้อนผลลัพธ์โดยตรง
- เปลี่ยน Filter หรือ Page Size แล้วกลับหน้า 1
- State ที่จำเป็นต่อ reload/share ควรสะท้อนใน URL
- Refresh ต้องโหลดข้อมูลตาม context ปัจจุบัน
- Save/Delete/Toggle สำเร็จแล้วต้อง synchronize list, mapping และ options ที่เกี่ยวข้อง
- Action ล้มเหลวต้องไม่สร้าง UI state ที่ดูเหมือนสำเร็จ

## Responsive Contract

- Desktop table actions อยู่บรรทัดเดียวเมื่อพื้นที่เพียงพอ
- Mobile controls wrap ได้โดยไม่ตัดข้อความ
- Toolbar controls เรียงแนวตั้งได้บนหน้าจอเล็ก
- Dialog ต้อง scroll ภายในได้
- Primary action กว้างเต็มบนมือถือได้ แต่ไม่ควรกว้างเต็มบน Desktop

## Accessibility Contract

- ทุก control ต้องมี label หรือ accessible name
- Focus state ต้องมองเห็นได้
- Disabled state ต้องแยกจาก active state ชัดเจน
- สีอย่างเดียวไม่ควรเป็นตัวสื่อสถานะเพียงอย่างเดียว
- Action ที่เป็น icon ต้องมี title หรือ aria-label

## Governance

ความแตกต่างจาก Contract นี้ทำได้เมื่อ:

- มีเหตุผลด้าน Business Requirement
- มีข้อจำกัดด้านข้อมูลหรือ performance
- มี Workflow เฉพาะที่มาตรฐาน CRUD ปกติไม่รองรับ

ทุกข้อยกเว้นต้องอธิบายได้ และไม่ควรเกิดจาก technical debt หรือความสะดวกเฉพาะหน้า

## Wave 1 Closure Rule

Wave 1 ปิดได้เมื่อ:

- ADS primitives และ composites ที่ใช้ใน Master Data มี authority ชัดเจน
- Master Data ทั้ง 7 โมดูลใช้ Experience Contract เดียวกัน
- ไม่พบ UX regression ระดับ P2 ขึ้นไป
- มี Runtime evidence จาก Production หรือ Local smoke test
- Checklist ผ่านในระดับที่เหมาะสมกับความเสี่ยง

เอกสารนี้เป็นฐานของ Wave 2 สำหรับ Product, Inventory, Repair, Claim, Purchase และ POS โดยให้แต่ละโมดูลรักษา Business Ownership ของตนเองภายใต้ Shared Experience เดียวกัน
