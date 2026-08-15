# ADS Action Feedback Contract v1

## Purpose

กำหนดมาตรฐาน feedback สำหรับ action ที่เปลี่ยนข้อมูลหรือสถานะถาวร เพื่อให้ทุก feature ของ ALPHA-TECH ตอบสนองต่อผู้ใช้ด้วยรูปแบบเดียวกัน

## Scope

Contract นี้ใช้กับ action ที่ persist ข้อมูลหรือเปลี่ยน workflow state เช่น:

- Create / Save / Update
- Delete / Remove / Disable / Void
- Approve / Reject / Activate / Suspend / Restore
- Receive / Complete / Close / Submit
- Payment / Refund / Deposit / Settlement
- Bulk update ที่มีผลกับข้อมูลถาวร

ไม่บังคับ toast สำหรับ interaction ชั่วคราวที่ผลลัพธ์มองเห็นได้ทันทีและยังไม่ persist เช่น เพิ่ม/ลบ row ใน draft cart, เปิด dialog, เปลี่ยน tab หรือ filter

## Standard Lifecycle

Persistent action ทุกตัวต้องมี:

1. ป้องกัน duplicate action ระหว่าง request
2. loading/busy state ที่มองเห็นได้
3. success feedback เมื่อ Server ยืนยันผลสำเร็จ
4. error feedback เมื่อ request ล้มเหลว
5. confirmation ก่อน destructive action เมื่อย้อนกลับยากหรือมีผลกระทบสูง

## Feedback Authority

Feature ต้องใช้ `feedback` จาก `@/design-system` เท่านั้น

- `feedback.actionSuccess(message, eventKey)` สำหรับ persistent success
- `feedback.actionError(error, fallbackMessage, eventKey)` สำหรับ persistent failure
- `feedback.warning(...)` สำหรับ validation หรือ business warning
- `feedback.info(...)` สำหรับ informational state

ห้าม import `react-toastify` โดยตรงจาก feature

## Error Message Authority

`actionError` ต้องรองรับ error shape ที่ใช้อยู่ทั้ง legacy และ Server operational envelope:

- `response.data.error.message`
- `response.data.message`
- string `response.data.error`
- `error.message`
- fallback message ของ action

Inline error สามารถคงไว้ได้เมื่อผู้ใช้ต้องอ่านรายละเอียดใน context แต่ไม่ควรใช้แทน action outcome toast สำหรับ persistent action

## Message Rules

Success message ต้องสื่อว่าสิ่งใดเสร็จแล้ว เช่น:

- `เพิ่มหน่วยนับเรียบร้อยแล้ว`
- `บันทึกการเปลี่ยนราคาสินค้าเรียบร้อยแล้ว`
- `ระงับการใช้งานพนักงานเรียบร้อยแล้ว`

Error fallback ต้องสื่อว่าสิ่งใดไม่สำเร็จ เช่น:

- `ลบหน่วยนับไม่สำเร็จ`
- `บันทึกการแก้ไขสินค้าไม่สำเร็จ`

## Navigation Rule

ถ้า action สำเร็จแล้วต้อง navigate ออกจากหน้า ให้ emit success feedback ก่อน navigate

## Destructive Rule

Persistent destructive action ต้องมี confirmation + loading + success/error feedback

## Architecture Boundary

- API layer: transport only
- Store/controller: orchestration/state
- UI action owner: user-facing action outcome
- ADS: feedback primitive และ error normalization

ห้ามใช้ `console.error()` หรือ `alert()` เป็น user feedback
