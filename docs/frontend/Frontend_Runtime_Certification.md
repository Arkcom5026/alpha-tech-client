# Frontend Runtime Certification

Status: APPROVED / CERTIFICATION IN PROGRESS
Scope: Frontend runtime sequence, dependency graph, event flow, error recovery, and runtime atlas
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Master Plan: `docs/frontend/Frontend_Upgrade_Master_Plan.md`
Related Architecture Index: `docs/frontend/README.md`

---

## 1. Mission

Certify the frontend runtime end-to-end before implementation refactor begins.

รับรอง Runtime ของ Frontend แบบครบเส้นทาง ก่อนเริ่มแก้โค้ดจริง เพื่อให้การยกระดับ Auth/Login/Branch/Token ปลอดภัยและเชื่อถือได้

---

## 2. Policy

```txt
Frontend remains first.
Backend remains locked until frontend runtime is certified and implementation-ready.
```

Certification and implementation are separate phases.

```txt
Certification = understand and document runtime.
Implementation = change runtime behavior.
```

---

## 3. Certification Badge

```txt
Status          : APPROVED / IN PROGRESS
Coverage        : TARGET 100% before Auth refactor
Evidence        : FILE-READ BASED
Risk Review     : REQUIRED
Blueprint       : LINKED
ADR             : LINKED
Implementation  : NOT STARTED
```

---

## 4. Runtime Certification Deliverables

### 4.1 Runtime Sequence Catalog

Target file:

```txt
docs/frontend/Runtime_Sequence_Catalog.md
```

Purpose:

Document end-to-end runtime sequences such as startup, bootstrap, login, refresh, verify, branch handoff, POS navigation, checkout, and logout.

---

### 4.2 Runtime Dependency Graph

Target file:

```txt
docs/frontend/Runtime_Dependency_Graph.md
```

Purpose:

Show how stores, APIs, components, router, and runtime owners depend on each other.

---

### 4.3 Runtime Event Catalog

Target file:

```txt
docs/frontend/Runtime_Event_Catalog.md
```

Purpose:

Document important runtime events and their side effects.

Examples:

```txt
Login event
Logout event
Refresh event
Verify session event
Branch handoff event
Checkout submit event
Cart merge event
```

---

### 4.4 Error & Recovery Catalog

Target file:

```txt
docs/frontend/Error_Recovery_Catalog.md
```

Purpose:

Document how frontend runtime handles failure and recovery.

Examples:

```txt
401
refresh failure
network failure
missing branchId
missing branchSlug
missing customer
invalid role
expired session
```

---

### 4.5 Frontend Runtime Atlas

Target file:

```txt
docs/frontend/Frontend_Runtime_Atlas.md
```

Purpose:

Provide a master index of all frontend runtime areas and link to each map, catalog, ADR, and risk section.

---

## 5. Runtime Certification Scope

Runtime areas to certify:

```txt
Application Startup Runtime
Auth Bootstrap Runtime
Session Refresh Runtime
Verify Session Runtime
Login Runtime
Logout Runtime
Branch Handoff Runtime
POS Route Runtime
POS Shell Runtime
Online Checkout Runtime
Cart Runtime
Online Order Runtime
Error Recovery Runtime
Dormant Guard / RBAC Runtime
```

---

## 6. Required Evidence Sources

Primary evidence files already reviewed:

```txt
src/main.jsx
src/App.jsx
src/routes/AppRouter.jsx
src/routes/partner/posPartnerRoutes.jsx
src/features/auth/store/authStore.js
src/features/branch/store/branchStore.js
src/utils/apiClient.js
src/features/auth/pages/LoginPage.jsx
src/features/pos/components/header/HeaderPos.jsx
src/features/pos/components/sidebar/SidebarLoader.jsx
src/features/online/order/components/LoginForm.jsx
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/cart/store/cartStore.js
src/features/online/order/store/orderOnlineStore.js
```

Supporting evidence docs:

```txt
docs/map/Runtime_Flow_Map.md
docs/map/Data_Ownership_Map.md
docs/map/Dependency_Map.md
docs/frontend/Risk_Register.md
docs/frontend/Architecture_Decision_Log.md
docs/frontend/State_Management_Map.md
docs/frontend/API_Surface_Map.md
docs/frontend/Component_Layer_Map.md
```

---

## 7. Certification Exit Criteria

Frontend Runtime Certification can be marked complete only when:

```txt
1. Runtime Sequence Catalog is created.
2. Runtime Dependency Graph is created.
3. Runtime Event Catalog is created.
4. Error & Recovery Catalog is created.
5. Frontend Runtime Atlas is created.
6. Risk Register reflects runtime certification risks.
7. ADR proposed decisions are reviewed and approved or deferred.
8. Implementation Readiness Review confirms first safe refactor phase.
```

---

## 8. Implementation Lock

Until this certification completes:

```txt
No AuthStore refactor.
No BranchStore refactor.
No apiClient refactor.
No HeaderPos runtime cleanup.
No route guard activation.
No RBAC activation.
No Backend Auth changes.
```

---

## 9. Recommended Execution Order

```txt
1. Runtime_Sequence_Catalog.md
2. Runtime_Dependency_Graph.md
3. Runtime_Event_Catalog.md
4. Error_Recovery_Catalog.md
5. Frontend_Runtime_Atlas.md
6. Implementation_Readiness_Review.md
```

---

## 10. Working Conclusion

Frontend Architecture Certification created the structural baseline.

Frontend Runtime Certification is the final safety layer before implementation begins.

The goal is not only to fix repeated login interruptions, but to make frontend runtime behavior observable, predictable, and safe to change.
