# Storefront Media Upload Foundation

## Mission

ให้ผู้ดูแลร้านอัปโหลดโลโก้ ภาพปก ภาพ Hero และภาพโปรโมชั่นจาก Store Experience Editor ได้โดยตรง แทนการกรอก URL ด้วยมือ โดยยังคง Published Snapshot เป็น Runtime Authority และรักษาการแยกข้อมูลร้านตาม branchId

## Problem

ตัวแก้ไขหน้าร้านปัจจุบันรองรับ Visual Branding แล้ว แต่ช่องภาพยังรับเฉพาะ URL ภายนอก ทำให้ผู้ใช้ต้องพึ่งบริการฝากรูปเอง เสี่ยงต่อ URL หมดอายุ การตั้งค่า CORS/Hotlink ที่ไม่แน่นอน และการใช้ไฟล์ผิดร้าน

## Scope

### Client

- เพิ่มตัวเลือกไฟล์สำหรับ logoUrl, coverImageUrl, heroImageUrl และ promotionImageUrl
- แสดงสถานะกำลังอัปโหลด สำเร็จ และล้มเหลวแยกตามช่อง
- เมื่ออัปโหลดสำเร็จ ให้นำ URL ที่ Backend คืนมาใส่ใน Draft Content Configuration
- รักษาช่อง URL เดิมไว้เป็น Advanced/Fallback ในระยะแรก
- Preview ต้องอัปเดตทันทีจาก URL ที่อัปโหลดสำเร็จ
- ห้าม Publish ขณะไฟล์ใดกำลังอัปโหลด

### Server dependency

Increment นี้ต้องสำรวจ Upload Authority ที่มีอยู่จริงก่อนเลือกวิธีเชื่อมต่อ Client:

- ใช้ endpoint/provider เดิมของแพลตฟอร์มเมื่อรองรับ branch-scoped storefront media อยู่แล้ว
- หากยังไม่มี ให้เปิด Server increment แยกสำหรับ authenticated multipart upload
- Server ต้อง derive branchId จาก verified employee session เท่านั้น ห้ามรับ branchId จาก Client เป็น authority
- Response ต้องคืน URL/asset reference ที่ใช้กับ Published Snapshot ได้

## Security and data authority

- อนุญาตเฉพาะผู้มีสิทธิ์จัดการ Store Experience
- จำกัดชนิดไฟล์เป็น image/jpeg, image/png และ image/webp
- จำกัดขนาดไฟล์ตาม Upload Policy ของแพลตฟอร์ม
- ตรวจ MIME จากไฟล์จริง ไม่เชื่อเฉพาะนามสกุล
- ชื่อ object/path ต้องแยกตาม branchId และ media slot
- ห้ามให้ร้านหนึ่งเขียนทับหรือลบ asset ของอีกร้าน
- URL ภายนอกเดิมยังต้องถูก treat เป็น untrusted content ใน renderer

## Media slots

- STORE_LOGO
- STORE_COVER
- STORE_HERO
- STORE_PROMOTION

หนึ่ง slot อาจมี asset ปัจจุบันเพียงรายการเดียวใน Foundation นี้ การจัด Gallery, Carousel, Crop และ Asset Library เป็น Increment ภายหลัง

## Publish lifecycle

1. ผู้ใช้เลือกไฟล์
2. Client ตรวจชนิดและขนาดเบื้องต้น
3. Upload ไปยัง authenticated media endpoint
4. Backend ตรวจสิทธิ์และเก็บไฟล์ภายใต้ branch scope
5. Client รับ URL แล้วอัปเดต Draft
6. Save Draft ไม่กระทบ Published Snapshot
7. Publish จึงคัดลอก URL ใหม่เข้าสู่ Published Content Configuration
8. Public Storefront อ่านเฉพาะ Published Snapshot

## Non-goals

- ไม่เพิ่ม Image Crop Editor
- ไม่ทำหลายภาพต่อ slot
- ไม่ทำ Promotion Carousel
- ไม่ย้าย Product Image Management เข้ามาในวาระนี้
- ไม่เปลี่ยน Layout/Theme Preset
- ไม่ใช้ Prisma migration จนกว่าการสำรวจ Upload Authority จะพิสูจน์ว่าจำเป็น

## Acceptance gates

- Upload แต่ละ slot สำเร็จและ Preview แสดงภาพทันที
- Save Draft แล้ว Public Storefront ยังคงใช้ภาพฉบับเดิม
- Publish แล้ว Public Storefront ใช้ภาพใหม่
- Refresh Editor แล้ว Draft URL ยังคงอยู่
- ไฟล์ชนิดหรือขนาดไม่ผ่านถูกปฏิเสธพร้อมข้อความภาษาไทยที่ชัดเจน
- การ Upload ผูกกับ branch จาก token และไม่รับ branchId จาก payload
- Contract test, typecheck และ production build ผ่าน
- Local runtime verification ผ่านก่อน Merge เข้า main

## Workflow

- GitHub branch เป็น Virtual Workspace
- Assistant พัฒนาและ Push เฉพาะ feature branch
- ผู้ใช้ดึงลง Local เพื่อ Verification
- ผู้ใช้เป็นผู้ Merge เข้า Local main และ Push main
- ไม่รัน ALDE สำหรับทุก Increment ย่อย เว้นแต่ผู้ใช้กำหนดรอบรับรอง
