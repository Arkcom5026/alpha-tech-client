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
