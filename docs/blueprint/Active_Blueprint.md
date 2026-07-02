# P1 Active Blueprint — Frontend Architecture Certification

Status: ACTIVE
Scope: Frontend only
Backend status: LOCKED until Frontend mapping is sufficiently complete
Repository: alpha-tech-client

---

## 1. Mission

Certify the frontend architecture before modifying Login/Auth behavior.

เป้าหมายคือทำความเข้าใจ Frontend ให้ครบก่อนแก้ Login/Auth เพื่อป้องกัน Regression และลดความเสี่ยงต่อระบบที่ใช้งานจริง

---

## 2. Human Reality

Employees are experiencing repeated login/session interruptions during real store operation.

พนักงานต้อง Login ซ้ำระหว่างใช้งานจริง ทำให้การทำงานหน้าร้านสะดุด

The root cause must not be guessed.

ห้ามเดาสาเหตุหรือรีบแก้ก่อนเข้าใจผลกระทบของ Frontend Runtime

---

## 3. Current Working Policy

Frontend must be reviewed and mapped first.

ต้องทำความเข้าใจและทำ Map ฝั่ง Frontend ให้เรียบร้อยก่อน

Backend review is intentionally deferred.

ยังไม่ไปฝั่ง Backend จนกว่า Frontend จะผ่านการสำรวจและประเมินผลกระทบเพียงพอ

No major refactor without maps.

ห้าม Refactor ระบบใหญ่หากยังไม่มี Map ของระบบนั้น

Documentation is part of the source of truth.

เอกสาร Blueprint และ Map ถือเป็นส่วนหนึ่งของ Source of Truth ของระบบ

---

## 4. Current Active Agenda

### STEP P1-FE-AUTH-CERT-01 — Frontend Authentication Architecture Certification

Status: ACTIVE

Mission:
Understand the entire frontend authentication, routing, branch context, and runtime dependency surface before modifying Login/Auth behavior.

เป้าหมายคือเข้าใจ Auth, Routing, Branch Context และ Dependency ของ Frontend ให้ครบก่อนแก้ระบบ Login/Auth

---

## 5. Deliverables

### Completed / Started

- Auth Runtime Map — started
- Navigation Route Surface Map — created

### Required Before Any Auth Refactor

- Dependency Map
- Runtime Flow Map
- Ownership Map
- State Management Map
- API Surface Map
- Component Map
- Data Flow Map
- Risk Map
- Frontend Architecture Index

---

## 6. Current Findings

Auth bootstrap starts at the App root.

การ Bootstrap Auth เริ่มจากระดับ App

AuthStore is the current owner of identity/session runtime.

AuthStore เป็นเจ้าของข้อมูล Identity และ Session Runtime ฝั่ง Frontend ในปัจจุบัน

BranchStore owns branch runtime details.

BranchStore เป็นเจ้าของรายละเอียดของ Branch Runtime

apiClient owns transport-level refresh and retry behavior.

apiClient เป็นเจ้าของพฤติกรรมระดับ Transport เช่น refresh และ retry

Header and Sidebar are mostly runtime consumers.

Header และ Sidebar ส่วนใหญ่เป็น Consumer ของ Runtime ไม่ใช่ Owner

No confirmed route-level Auth Guard has been found yet.

ยังไม่พบ Route-level Auth Guard ที่ยืนยันได้ในไฟล์ที่อ่านแล้ว

RBAC exists as candidate code but is not in current runtime scope.

RBAC มีโครงอยู่แต่ยังไม่รวมใน Scope ของ Runtime ปัจจุบัน

---

## 7. Current Risks

Changing authStore before dependency mapping may break unknown consumers.

การแก้ authStore ก่อนรู้ Dependency อาจกระทบไฟล์ที่ยังไม่ได้สำรวจ

Adding a route guard too early may redirect users before bootstrap or refresh completes.

การใส่ Route Guard เร็วเกินไปอาจทำให้ผู้ใช้ถูกเด้งก่อน Bootstrap หรือ Refresh เสร็จ

URL shopSlug and authStore employee.branchSlug may become two sources of truth.

URL shopSlug และ employee.branchSlug อาจกลายเป็นสองความจริงที่ขัดกัน

BranchStore selectedBranchId may drift from POS identity branchId.

selectedBranchId ใน BranchStore อาจหลุดจาก branchId ของพนักงานที่ Login อยู่

---

## 8. Out of Scope For Current Agenda

Backend auth controller changes are out of scope.

ยังไม่แก้ Backend Auth Controller

Cookie/session config changes are out of scope.

ยังไม่แก้ Cookie หรือ Session Config

RBAC activation is out of scope.

ยังไม่เปิดใช้ RBAC

Permission-based menu filtering is out of scope.

ยังไม่ทำ Permission-based Menu Filtering

Multi-branch switching is out of scope.

ยังไม่ทำระบบสลับสาขา

---

## 9. Definition of Done

Frontend Architecture Certification can be considered complete when:

- All major Auth Runtime consumers are identified.
- All major Branch Runtime consumers are identified.
- The presence or absence of route guard behavior is confirmed.
- Login, Bootstrap, Refresh, Verify, Reload, and Logout flows are mapped.
- POS branch ownership rules are documented.
- Route shopSlug ownership rules are documented.
- Impact risks are documented before implementation.

---

## 10. Next Step

Create and maintain Dependency Map.

สร้างและดูแล `docs/map/Dependency_Map.md`

Initial search targets:

- useAuthStore
- useBranchStore
- logoutAction
- verifySessionAction
- bootstrapAuthAction
- employee.branchId
- employee.branchSlug
- selectedBranchId
- shopSlug
- ProtectRoute
- RequireAuth
- AuthGate
- PrivateRoute

---

## 11. Related Documents

- docs/map/Auth_Runtime_Map.md
- docs/map/Navigation_Route_Map.md
- docs/map/Dependency_Map.md
- docs/map/Runtime_Flow_Map.md
- docs/map/Ownership_Map.md

Note: map filenames should not include Frontend or Backend prefixes because frontend and backend are separated by repository.

---

## 12. Current Blueprint Rule

This file is the active agenda command center.

ไฟล์นี้คือศูนย์กลางวาระที่กำลังดำเนินการอยู่

Large historical knowledge should be moved into domain blueprints, discovery logs, lessons, maps, or archives over time.

องค์ความรู้ขนาดใหญ่ใน Blueprint เดิมควรถูกทยอยแยกไปยัง Domain Blueprint, Discovery Log, Lessons, Maps หรือ Archive ตามความเหมาะสม
