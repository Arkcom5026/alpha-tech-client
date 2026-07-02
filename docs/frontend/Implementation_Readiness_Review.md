# Implementation Readiness Review

Status: DRAFT / FRONTEND RUNTIME CERTIFICATION GATE
Scope: Final readiness gate before frontend runtime implementation begins
Repository: alpha-tech-client
Related Runtime Atlas: `docs/frontend/Frontend_Runtime_Atlas.md`
Related Runtime Certification: `docs/frontend/Frontend_Runtime_Certification.md`
Related Master Plan: `docs/frontend/Frontend_Upgrade_Master_Plan.md`

---

## 1. Purpose

This document is the final gate before implementation work begins on frontend Auth/Login/Branch/Token stabilization.

เอกสารนี้คือด่านตรวจสุดท้ายก่อนเริ่มแก้โค้ด Frontend Runtime จริง เพื่อให้มั่นใจว่าเราจะไม่เริ่ม Implementation โดยยังไม่เข้าใจ Runtime, Risk, Ownership, Event และ Recovery ครบพอ

---

## 2. Certification Status

```txt
Frontend Architecture Certification : COMPLETE / BASELINE CREATED
Frontend Runtime Certification      : COMPLETE / BASELINE CREATED
Implementation Readiness            : DRAFT / REVIEW REQUIRED
Backend Auth Refactor               : LOCKED
```

---

## 3. Completed Certification Documents

### Architecture Baseline

```txt
docs/frontend/README.md
docs/frontend/Frontend_Upgrade_Master_Plan.md
docs/frontend/Risk_Register.md
docs/frontend/Refactor_Roadmap.md
docs/frontend/Architecture_Decision_Log.md
```

### Architecture Maps

```txt
docs/map/Dependency_Map.md
docs/map/Runtime_Flow_Map.md
docs/map/Data_Ownership_Map.md
docs/map/Login_Checkout_Dependency_Verification.md
docs/map/Branch_Navigation_Cart_Dependency_Verification.md
docs/map/Permission_Identity_Dependency_Verification.md
```

### Frontend Certification Maps

```txt
docs/frontend/Legacy_Surface_Map.md
docs/frontend/API_Surface_Map.md
docs/frontend/State_Management_Map.md
docs/frontend/Component_Layer_Map.md
```

### Runtime Certification

```txt
docs/frontend/Frontend_Runtime_Certification.md
docs/frontend/Runtime_Sequence_Catalog.md
docs/frontend/Runtime_Dependency_Graph.md
docs/frontend/Runtime_Event_Catalog.md
docs/frontend/Error_Recovery_Catalog.md
docs/frontend/Frontend_Runtime_Atlas.md
```

---

## 4. Readiness Gate Checklist

### 4.1 Runtime Understanding

```txt
[x] Startup runtime mapped
[x] Auth bootstrap runtime mapped
[x] Refresh runtime mapped
[x] Verify session runtime mapped
[x] Login runtime mapped
[x] Logout runtime mapped
[x] Branch handoff runtime mapped
[x] POS shell runtime mapped
[x] Online checkout runtime mapped
[x] Cart runtime mapped
[x] Error recovery baseline mapped
```

Status:

```txt
PASS
```

---

### 4.2 Ownership Understanding

```txt
[x] AuthStore ownership mapped
[x] BranchStore ownership mapped
[x] apiClient ownership mapped
[x] CartStore ownership mapped
[x] orderOnlineStore ownership mapped
[x] employeeStore non-session role mapped
[x] POS branch ownership risk identified
[x] Online branch ownership risk identified
[x] Logout ownership risk identified
```

Status:

```txt
PASS WITH OPEN DECISIONS
```

---

### 4.3 Risk Understanding

```txt
[x] Branch ownership risk identified
[x] Logout ownership risk identified
[x] shopSlug/branchSlug drift risk identified
[x] Refresh chain risk identified
[x] LoginAction shared POS/Online risk identified
[x] Checkout currentBranch/selectedBranchId risk identified
[x] Dormant RBAC/guard risk identified
```

Status:

```txt
PASS
```

---

### 4.4 Dormant / Legacy Understanding

```txt
[x] ProtectedRoute marked dormant
[x] RequirePermission / IfPermission marked dormant
[x] RBAC capability filtering marked dormant
[x] employeeStore marked HR/management, not session owner
[x] rootStore marked legacy candidate
[x] branchHelpers marked legacy/online geo candidate
```

Status:

```txt
PASS
```

---

## 5. Required Decisions Before Code Change

These decisions must be approved before implementation starts:

```txt
1. POS branch identity is anchored to authStore.employee.branchId.
2. Online branch selection remains separate from POS branch identity.
3. UI caller owns logout navigation target; authStore owns session cleanup.
4. POS shopSlug must not be treated as branch truth by itself.
5. apiClient refresh behavior must not change before Backend Auth review.
```

Recommended status:

```txt
READY FOR APPROVAL
```

---

## 6. Implementation Phase Recommendation

Recommended first implementation phase:

```txt
Phase 1 — Logout Runtime Standardization
```

Reason:

- Smaller blast radius than AuthStore/BranchStore/apiClient refactor.
- Current logout behavior is inconsistent across surfaces.
- Standardizing logout clarifies cleanup vs navigation ownership before deeper Auth changes.

Candidate files for Phase 1, one file at a time:

```txt
src/features/auth/store/authStore.js
src/features/pos/components/header/HeaderPos.jsx
src/components/common/UnifiedMainNav.jsx
src/components/LogoutButton.jsx
src/features/superadmin/sidebar/SidebarSuperAdmin.jsx
```

Do not change all files at once.

---

## 7. Files That Are Not Ready For Direct Refactor Yet

```txt
src/utils/apiClient.js
src/features/branch/store/branchStore.js
src/routes/AppRouter.jsx
src/features/auth/components/ProtectedRoute.jsx
src/hooks/usePermission.js
src/components/auth/RequirePermission.jsx
src/components/auth/IfPermission.jsx
```

Reason:

These involve broader runtime/security/route implications and should wait until Phase 1 and ownership decisions are verified.

---

## 8. Regression Verification Required For Phase 1

After Logout Runtime Standardization, verify:

```txt
POS logout from HeaderPos
Shared/online logout from UnifiedMainNav
LogoutButton behavior if still used
SuperAdmin logout behavior
AuthStore state cleared
BranchStore state cleared where intended
CartStore state cleared only where intended
Redirect target is predictable
No double navigation or competing window.location/navigate behavior
```

---

## 9. Implementation Rules

```txt
1. One file at a time.
2. Minimal patch only.
3. No broad rewrite.
4. No Backend changes.
5. No route guard activation.
6. No RBAC activation.
7. Update ADR after decision.
8. Update Risk Register after implementation.
9. Update Runtime Atlas if behavior changes.
10. Verify after each file.
```

---

## 10. Readiness Verdict

Current verdict:

```txt
FRONTEND IS READY FOR IMPLEMENTATION PLANNING
FRONTEND IS NOT YET APPROVED FOR CODE CHANGE UNTIL REQUIRED DECISIONS ARE CONFIRMED
```

Recommended next action:

```txt
Approve the five required decisions in Section 5.
Then begin Phase 1: Logout Runtime Standardization.
```

---

## 11. Working Conclusion

Frontend has enough certified architecture/runtime documentation to begin implementation planning safely.

The safest first runtime cleanup is Logout Runtime Standardization.

AuthStore, BranchStore, apiClient, route guard, and RBAC should remain locked until logout ownership and branch ownership rules are approved and verified.
