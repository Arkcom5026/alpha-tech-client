# P1 Runtime Migration Doctrine — หลักการย้าย Runtime ของ P1

Status: APPROVED / BLUEPRINT ADDENDUM — สถานะ: อนุมัติและใช้เป็นส่วนขยายของ Blueprint

Scope: Mission B and future runtime migrations — ขอบเขต: Mission B และการย้าย Runtime ในอนาคต

---

## Core Doctrine — หลักการหลัก

P1 does not rewrite proven workflows from zero. — P1 ไม่เขียน workflow ที่พิสูจน์แล้วใหม่จากศูนย์

P1 migrates by preserving the existing user workflow first, then improving internal responsibility separation. — P1 ย้ายระบบโดยรักษา workflow เดิมของผู้ใช้ก่อน แล้วค่อยปรับการแยกหน้าที่ภายในให้ชัดเจนขึ้น

Migration follows workflow truth, not file shape. — การย้ายระบบยึดความจริงของ workflow ไม่ใช่รูปทรงไฟล์เดิม

Legacy code is retired only after the equivalent runtime flow is safely replaced and verified. — โค้ดเก่าจะถูกปลดออกหลังจาก flow runtime ใหม่ทำงานแทนได้อย่างปลอดภัยและผ่านการตรวจสอบแล้วเท่านั้น

---

## Standard Migration Sequence — ลำดับมาตรฐานในการย้าย

Existing workflow is inspected first. — ตรวจสอบ workflow เดิมก่อนเสมอ

Responsibility of each step is identified before implementation. — ระบุหน้าที่รับผิดชอบของแต่ละขั้นก่อนลงมือแก้โค้ด

Reusable logic is preserved where safe. — เก็บ logic เดิมที่ใช้ต่อได้อย่างปลอดภัยไว้

Backend is migrated into the new module structure. — ฝั่ง Backend ย้ายเข้าโครงสร้าง module ใหม่

Frontend keeps the existing correct flow and route shape. — ฝั่ง Frontend รักษา flow และ route เดิมที่ออกแบบถูกต้องไว้

Frontend files are split by responsibility, not rewritten as a new experience. — ฝั่ง Frontend แตกไฟล์ตามหน้าที่รับผิดชอบ ไม่ rewrite เป็นประสบการณ์ใหม่

Legacy code is removed only after runtime parity is confirmed. — ลบ legacy หลังยืนยันว่า runtime ใหม่ทำงานเทียบเท่าแล้วเท่านั้น

---

## Backend Migration Rule — กฎสำหรับ Backend

Backend should move toward controller / service / repository / route separation. — Backend ควรย้ายไปสู่การแยก controller / service / repository / route ให้ชัดเจน

Backend migration is structural because backend responsibilities must be isolated. — Backend ต้องย้ายเชิงโครงสร้าง เพราะหน้าที่รับผิดชอบของ backend ต้องแยกชัดเจน

Backend should avoid keeping business logic in legacy controllers once module services are ready. — Backend ควรหลีกเลี่ยงการเก็บ business logic ใน controller เก่าเมื่อ module service พร้อมแล้ว

---

## Backend Service Extraction Doctrine — หลักการแยก Service จาก Legacy Controller

During runtime migration, do not move or rewrite a legacy controller as a whole unless the workflow has already reached runtime parity. — ระหว่างการย้าย runtime ห้ามย้ายหรือ rewrite legacy controller ทั้งก้อน จนกว่า workflow นั้นจะยืนยัน runtime parity แล้ว

Legacy controllers should first become adapters. — ให้ legacy controller ค่อย ๆ กลายเป็น adapter ก่อน

A legacy controller adapter should mainly handle request/response concerns: read req, call module service, return res, and normalize errors. — legacy controller ในสถานะ adapter ควรทำหน้าที่หลักแค่รับ req, เรียก module service, ส่ง res และ normalize error

Business logic should be extracted from legacy controllers into `src/modules/<domain>/services`. — business logic ควรถูกแยกออกจาก legacy controller ไปไว้ใน `src/modules/<domain>/services`

Repository extraction should happen only when service logic needs a stable database access boundary. — การแยก repository ควรเกิดเมื่อ service ต้องการขอบเขตการเข้าถึงฐานข้อมูลที่ชัดเจนแล้วเท่านั้น

Controller migration into the module should happen only after the old controller is already thin and the workflow has been verified. — การย้าย controller เข้า module ควรเกิดหลังจาก controller เก่าเบาลงแล้ว และ workflow ผ่านการตรวจสอบแล้ว

Default backend migration order: Service Extraction → Repository Extraction when needed → Controller Migration → Legacy Removal. — ลำดับมาตรฐานคือ แยก Service → แยก Repository เมื่อจำเป็น → ย้าย Controller → ปลด Legacy

Do not introduce extra structural folders such as `mappers/` unless the existing route/controller/service/repository structure is no longer sufficient. — ไม่เพิ่มโครงสร้างใหม่ เช่น `mappers/` หากโครงสร้าง route/controller/service/repository เดิมยังรองรับได้เพียงพอ

Response shaping may live inside service-level helpers first. Extract a separate mapper only when multiple services reuse the same runtime shape and the extraction reduces confusion. — การจัดรูป response ให้อยู่ใน service-level helper ก่อนได้ และค่อยแยก mapper เมื่อหลาย service ใช้ runtime shape เดียวกันจริงและการแยกช่วยลดความสับสน

---

## Backend Capability Migration Pattern — รูปแบบการย้ายตามความสามารถของระบบ

Migrate by business capability, not by legacy file name. — ให้ย้ายตามความสามารถของระบบ ไม่ใช่ตามชื่อไฟล์ legacy

A service should be named after the responsibility it owns, not after the controller that used to contain it. — Service ควรตั้งชื่อตามความรับผิดชอบที่ถือครอง ไม่ใช่ตามชื่อ controller เดิม

Preferred names describe runtime capability, for example `OperationalProductRuntimeService`, `LocalOperationalProductService`, `ProductReceiveService`, or `CandidateProductService`. — ชื่อที่เหมาะควรบอก capability เช่น `OperationalProductRuntimeService`, `LocalOperationalProductService`, `ProductReceiveService`, หรือ `CandidateProductService`

Avoid names that mirror transport or implementation details, such as `ProductControllerService`, `ProductApiService`, or temporary endpoint names. — หลีกเลี่ยงชื่อที่ผูกกับ transport หรือ implementation เช่น `ProductControllerService`, `ProductApiService`, หรือชื่อ endpoint ชั่วคราว

The first extraction target should be the highest-value capability that reduces legacy complexity without changing API contract. — จุดเริ่มควรเป็น capability ที่ลดความซับซ้อนของ legacy ได้มากที่สุดโดยไม่เปลี่ยน API contract

---

## Proven Mission B Backend Migration Process — กระบวนการที่พิสูจน์แล้วจาก Mission B

Mission B used the following safe migration sequence for Product Runtime. This process should be reused for future backend module migrations unless a specific workflow requires otherwise. — Mission B ใช้ลำดับการย้าย Product Runtime ตามนี้ และควรใช้ซ้ำกับ backend module อื่น เว้นแต่ workflow นั้นมีเหตุผลเฉพาะที่ต้องต่างออกไป

### Phase 0 — Boot and Scope Lock

Read the active Blueprint, Mission workspace, blackboard, assignment, and runtime migration doctrine before implementation. — อ่าน Blueprint, workspace, blackboard, assignment และ runtime migration doctrine ก่อน implementation

Lock the role scope before editing. — ล็อกขอบเขตบทบาทก่อนแก้ไข

For BE migration, focus only on backend runtime responsibility. — สำหรับการย้าย BE ให้โฟกัสเฉพาะ backend runtime responsibility

Do not expand into FE, UX, DB migration, or governance unless explicitly assigned. — ไม่ขยายไป FE, UX, DB migration หรือ governance หากไม่ได้รับมอบหมายชัดเจน

### Phase 1 — Legacy Runtime Scan

Scan the old route/controller to identify which workflow responsibilities are still inside legacy files. — สแกน route/controller เก่าเพื่อหา responsibility ที่ยังอยู่ใน legacy

Classify findings into capability groups, not file groups. — จัดกลุ่มตาม capability ไม่ใช่ตามไฟล์

For Mission B, the important capability groups were: — สำหรับ Mission B กลุ่มสำคัญคือ

- Operational Product Search — การค้นหา Operational Product
- Operational Product Detail — รายละเอียด Operational Product
- Runtime Lookup by Template — การหา runtime product จาก template
- Local Operational Product Create — การสร้างสินค้าสาขาเอง
- Template Clone to Operational Product — การ clone template เป็น operational product
- Ready-to-Sell Runtime — runtime การแสดงสินค้าพร้อมขาย
- Barcode / Serial Runtime Lookup — runtime lookup ด้วย barcode / serial

### Phase 2 — Service Extraction First

Create a module service before moving controller or route. — สร้าง module service ก่อนย้าย controller หรือ route

Keep the legacy controller/route as adapter. — ให้ legacy controller/route เป็น adapter ไปก่อน

Move business logic, Prisma query, validation, transaction, and response shaping into the service one capability at a time. — ย้าย business logic, Prisma query, validation, transaction และ response shaping เข้า service ทีละ capability

Preserve the public API response shape exactly unless there is an explicit contract change. — รักษา API response shape เดิมให้เหมือนเดิม เว้นแต่มีการเปลี่ยน contract อย่างชัดเจน

For Mission B, `OperationalProductRuntimeService` became the central runtime service before repository extraction. — สำหรับ Mission B ใช้ `OperationalProductRuntimeService` เป็น service กลางก่อนแยก repository

### Phase 3 — Route and Controller Adapter Conversion

After service extraction, convert old route/controller functions into thin adapters. — หลังแยก service ให้เปลี่ยน route/controller เดิมเป็น adapter บาง ๆ

An adapter may read `req`, pass normalized input to service, choose HTTP status, return JSON, and normalize known errors. — Adapter ทำได้เพียงอ่าน `req`, ส่ง input ไป service, เลือก HTTP status, ส่ง JSON และ normalize error ที่รู้จัก

An adapter must not contain Prisma query, transaction, runtime mapping, or business decision logic. — Adapter ต้องไม่ถือ Prisma query, transaction, runtime mapping หรือ business decision logic

### Phase 4 — Cleanup Legacy Helpers

After a capability has moved into service, remove duplicated helper logic from the route/controller. — หลัง capability ถูกย้ายเข้า service แล้ว ให้ลบ helper ซ้ำจาก route/controller

Do not remove helper logic until no active endpoint uses it. — ห้ามลบ helper จนกว่าจะยืนยันว่าไม่มี endpoint ใช้งานแล้ว

Mission B cleanup removed route-level runtime helpers after `create-local` and `create-from-template` had moved into service. — Mission B ลบ route-level runtime helpers หลัง `create-local` และ `create-from-template` ย้ายเข้า service แล้ว

### Phase 5 — Checkpoint and Audit

Create a Git checkpoint after meaningful migration phases. — สร้าง Git checkpoint หลัง phase สำคัญ

Before pushing, verify that only intended files are staged. — ก่อน push ต้องตรวจว่า staged เฉพาะไฟล์ที่ตั้งใจ

Use `git diff --cached --stat` or equivalent before commit. — ใช้ `git diff --cached --stat` หรือเทียบเท่าก่อน commit

Avoid committing database backups, scratch files, generated temporary files, or unrelated feature files. — หลีกเลี่ยงการ commit database backup, scratch file, generated temporary file หรือไฟล์ feature ที่ไม่เกี่ยวข้อง

If an accidental broad commit is created, reset before push and recommit only scoped files. — ถ้า commit กว้างผิดพลาด ให้ reset ก่อน push แล้ว commit ใหม่เฉพาะไฟล์ใน scope

### Phase 6 — Repository Extraction

Repository extraction starts only after the service has stabilized and the capability boundary is clear. — เริ่มแยก repository หลัง service นิ่งและขอบเขต capability ชัดแล้ว

Repository owns Prisma access, select/include definitions, persistence, and transaction helpers. — Repository ถือ Prisma access, select/include, persistence และ transaction helpers

Service owns validation, business rule, runtime decision, orchestration, and response-level meaning. — Service ถือ validation, business rule, runtime decision, orchestration และความหมายระดับ response

Do not create repository too early if the service boundary is still moving. — อย่าแยก repository เร็วเกินไปถ้าขอบเขต service ยังเปลี่ยนอยู่

### Phase 7 — Module Controller and Route Migration

Move controller into `src/modules/<domain>/controllers` only after the legacy controller is already thin. — ย้าย controller เข้า `src/modules/<domain>/controllers` หลัง legacy controller บางแล้วเท่านั้น

Move route into `src/modules/<domain>/routes` only after route-level business logic is gone. — ย้าย route เข้า `src/modules/<domain>/routes` หลัง route-level business logic หมดแล้ว

When this phase starts, migration should be mostly structural rather than behavioral. — เมื่อเริ่ม phase นี้ การย้ายควรเป็นเชิงโครงสร้างมากกว่าการเปลี่ยนพฤติกรรม

---

## Mission B Runtime Migration Checkpoints — จุดตรวจจาก Mission B

Mission B Product Runtime migration established the following practical checkpoints. — การย้าย Product Runtime ใน Mission B สร้าง checkpoint ที่ใช้จริงดังนี้

1. Runtime lookup extraction — แยก runtime lookup
2. Operational product search/detail extraction — แยก search/detail ของ operational product
3. Local Operational Product create extraction — แยกการสร้าง operational product ของสาขา
4. Template clone extraction — แยกการ clone template เป็น operational product
5. Product route cleanup — cleanup route หลังย้าย capability แล้ว
6. Ready-to-sell runtime extraction — แยก ready-to-sell runtime
7. Repository extraction readiness audit — audit ก่อนแยก repository
8. Module controller/route migration — ย้าย controller/route เข้า module เมื่อ adapter บางพอ

Each checkpoint should be committed separately where possible. — ควร commit แยกตาม checkpoint เมื่อเป็นไปได้

Each checkpoint should preserve API contract and frontend behavior. — แต่ละ checkpoint ต้องรักษา API contract และ frontend behavior

---

## Runtime Migration Verification Checklist — Checklist ตรวจสอบหลังย้าย

Before accepting a runtime migration checkpoint, verify: — ก่อนรับ checkpoint ให้ตรวจสอบว่า

- Existing route path is unchanged unless explicitly assigned. — route path เดิมไม่เปลี่ยน เว้นแต่ได้รับมอบหมาย
- Existing HTTP status behavior is preserved. — HTTP status เดิมยังเหมือนเดิม
- Existing response keys are preserved. — response keys เดิมยังคงอยู่
- Branch scoping is preserved. — branch scoping ยังถูกบังคับ
- Template Catalog is not exposed to Operational Runtime surfaces. — Template Catalog ไม่หลุดไปแสดงใน Operational Runtime
- Runtime service owns business decisions. — runtime service ถือ business decisions
- Legacy adapter does not contain Prisma query. — legacy adapter ไม่มี Prisma query
- No unrelated files are staged. — ไม่มีไฟล์นอก scope ถูก staged
- Rollback point exists before the next capability migration. — มี rollback point ก่อนย้าย capability ถัดไป

---

## Frontend Migration Rule — กฎสำหรับ Frontend

Frontend should not be rewritten if the existing workflow is already correct. — Frontend ไม่ควรถูก rewrite หาก workflow เดิมถูกต้องอยู่แล้ว

Frontend should keep user flow, route behavior, and screen intent stable. — Frontend ควรรักษา user flow, route behavior และเจตนาของหน้าจอให้คงเดิม

Frontend migration should split large files by responsibility. — การย้าย Frontend ควรแตกไฟล์ใหญ่ตามหน้าที่รับผิดชอบ

Recommended frontend split for Product Create flow: ProductCreatePage, ProductForm, ProductBasicInfoSection, ProductStockBehaviorSection, ProductPriceSection, ProductImageSection, ProductSubmitBar. — โครงสร้างแนะนำสำหรับ Product Create คือแยกเป็น ProductCreatePage, ProductForm, ProductBasicInfoSection, ProductStockBehaviorSection, ProductPriceSection, ProductImageSection, ProductSubmitBar

---

## Mission B Application — การใช้กับ Mission B

Mission B closes only when branches can create their own Operational Product. — Mission B จะปิดได้เมื่อสาขาสามารถสร้าง Operational Product ของตัวเองได้จริง

Branch-created product belongs to Operational Runtime, not Template Catalog. — สินค้าที่ร้านสร้างเองเป็นของ Operational Runtime ไม่ใช่ Template Catalog

Branch Product Create Flow should create Operational Product, BranchPrice, and runtime readiness for stock or receive. — Flow การเพิ่มสินค้าของร้านควรสร้าง Operational Product, BranchPrice และความพร้อมสำหรับ stock หรือ receive

Promotion to Candidate is Mission C, not Mission B. — การส่งสินค้าเข้า Candidate เป็นหน้าที่ของ Mission C ไม่ใช่ Mission B

Mission B must not depend on Candidate or Template approval to complete branch operation. — Mission B ต้องไม่พึ่ง Candidate หรือการอนุมัติ Template เพื่อให้ร้านใช้งานสินค้าได้

---

## Mission C Boundary — ขอบเขตของ Mission C

Mission C starts after Operational Product exists. — Mission C เริ่มหลังจาก Operational Product มีอยู่แล้ว

Mission C promotes branch-created Operational Product into Candidate. — Mission C ยกระดับ Operational Product ที่ร้านสร้างเองให้เป็น Candidate

Candidate and Governance decide whether the product becomes Template. — Candidate และ Governance เป็นผู้ตัดสินว่าสินค้าจะกลายเป็น Template หรือไม่

Template Catalog is canonical knowledge, not branch runtime. — Template Catalog คือความรู้กลาง ไม่ใช่ runtime ของร้าน

---

## Migration Philosophy — ปรัชญาการย้ายระบบ

P1 evolves workflows instead of destroying them. — P1 วิวัฒน์ workflow แทนการทำลายแล้วสร้างใหม่

Small safe migrations are preferred over large rewrites. — การย้ายทีละส่วนอย่างปลอดภัยดีกว่า rewrite ใหญ่ครั้งเดียว

One workflow at a time is the preferred execution pattern. — รูปแบบการทำงานที่เหมาะสมคือย้ายทีละ workflow

Architecture improves underneath stable user behavior. — สถาปัตยกรรมควรดีขึ้นภายใต้พฤติกรรมผู้ใช้ที่ยังนิ่งและต่อเนื่อง
