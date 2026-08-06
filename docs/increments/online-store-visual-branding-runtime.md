# Online Store Visual Branding Runtime

## Mission

ทำให้การตั้งค่าอัตลักษณ์ภาพของร้านใน Store Experience Editor ถูกบันทึกผ่าน Draft/Publish Contract และแสดงผลบน Public Storefront อย่างสอดคล้อง โดยยังรักษาโครงสร้าง การตอบสนองบนมือถือ ตัวอักษร และมาตรฐาน UX หลักไว้ภายใต้ Alpha-Tech Platform Design Authority

## Current Evidence

- Public Storefront อ่าน `experience.contentConfiguration` และแสดง `storeHeadline`, `storeDescription`, `logoUrl`, `coverImageUrl`, `heroImageUrl`, `heroHeadline` และ `heroSupportingText` แล้ว
- Public Storefront อ่าน `experience.themeTokens` อยู่แล้ว แต่ Store Experience Editor ยังคงเขียน `PLATFORM_TOKENS` คงที่ทุกครั้ง
- Promotion มีช่องแก้ไขและ Preview ใน Editor แต่ Public Storefront ยังไม่มี Promotion Runtime Section
- Preview ใช้สีน้ำเงิน/สีเหลืองแบบ hardcode จึงยังไม่สะท้อน Published Runtime Contract อย่างแท้จริง

## Increment Scope

### 1. Merchant Brand Color Boundary

ร้านปรับได้เฉพาะ:

- `themeTokens.brandPrimary`
- `themeTokens.brandAccent`

แพลตฟอร์มยังควบคุม:

- `themePreset`
- `layoutPreset`
- `themeTokens.surface`
- `themeTokens.text`
- Typography
- Spacing
- Responsive behavior
- Accessibility and sales interaction patterns

Draft payload ต้องรักษาค่าสีร้านที่เลือก และบังคับ `surface`/`text` ให้เป็นค่ามาตรฐานแพลตฟอร์ม

### 2. Preview and Public Visual Parity

Preview ต้องใช้:

- สีหลักจาก `draft.themeTokens.brandPrimary`
- สีเน้นจาก `draft.themeTokens.brandAccent`
- Logo, Cover และ Hero image จาก `contentConfiguration`
- Promotion configuration เดียวกับ Public Runtime

### 3. Public Promotion Runtime

Public Storefront แสดง Promotion เฉพาะเมื่อมี `promotionTitle` หรือ `promotionImageUrl`

รองรับ:

- `promotionTitle`
- `promotionImageUrl`
- `promotionCtaLabel`
- `promotionCtaUrl`

CTA ต้องใช้ลิงก์ที่ร้านกำหนด โดยไม่มี Promotion placeholder เมื่อไม่มีข้อมูล

### 4. Theme Runtime Coverage

Public Storefront ใช้ `brandPrimary` และ `brandAccent` กับองค์ประกอบสำคัญ ได้แก่:

- Store header
- Hero surface
- Primary search action
- Interactive links/accents
- Promotion CTA
- Contact section

## Out of Scope

- การเปลี่ยน Typography
- การเปลี่ยน Layout อิสระ
- การจัดลำดับ Section แบบ drag-and-drop
- Product image upload/management
- File upload service
- Cart/Checkout redesign
- Database หรือ Prisma migration
- Server API contract change

## Verification

- Contract test ยืนยัน merchant-editable brand color boundary
- Contract test ยืนยัน Draft payload ไม่เขียนทับสีร้านด้วยค่าคงที่
- Contract test ยืนยัน Preview และ Public ใช้ `brandPrimary`/`brandAccent`
- Contract test ยืนยัน Public Promotion Runtime binding
- `npm run test:online-store-brand-content-studio`
- `npm run typecheck`
- `npm run build`
- Local runtime: แก้สี/ภาพ/Promotion → Save Draft → Publish → Public Storefront แสดงค่าล่าสุด

## Handoff Target

`READY FOR VERIFICATION` เมื่อ Source และ Contract ครบ โดยยังไม่ Merge เข้า `main` และไม่ Push `main`
