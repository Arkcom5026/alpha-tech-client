# Frontend Upgrade Master Plan

Status: ACTIVE / MASTER PLAN
Scope: Frontend Architecture Certification → Standardization → Runtime Stabilization → Enterprise Architecture
Repository: alpha-tech-client
Related Blueprint: `docs/blueprint/Active_Blueprint.md`
Related Index: `docs/frontend/README.md`

---

## 1. Mission

Upgrade the frontend from a working application into a predictable, documented, maintainable production-grade architecture.

ยกระดับ Frontend จากระบบที่ใช้งานได้ ให้เป็นระบบที่เข้าใจได้ คาดการณ์ได้ ดูแลได้ และขยายต่อได้ในระดับ Production

The current Login/Token issue is treated as one symptom inside a larger runtime architecture system.

---

## 2. Current Strategy

Frontend first.

Backend remains locked until frontend runtime, ownership, dependency, and risk surfaces are sufficiently certified.

No major refactor without maps.

No implementation until the required frontend ownership decisions are approved.

---

## 3. Phase 1 — Frontend Architecture Certification

Status:

```txt
IN PROGRESS
```

Goal:

Understand and document the frontend runtime before changing Login/Auth behavior.

Completed / Started deliverables:

```txt
docs/map/Dependency_Map.md
docs/map/Runtime_Flow_Map.md
docs/map/Data_Ownership_Map.md
docs/map/Login_Checkout_Dependency_Verification.md
docs/map/Branch_Navigation_Cart_Dependency_Verification.md
docs/map/Permission_Identity_Dependency_Verification.md
docs/frontend/README.md
docs/frontend/Risk_Register.md
docs/frontend/Refactor_Roadmap.md
```

Remaining certification deliverables:

```txt
docs/frontend/Legacy_Surface_Map.md
docs/frontend/API_Surface_Map.md
docs/frontend/State_Management_Map.md
docs/frontend/Component_Layer_Map.md
docs/frontend/Architecture_Decision_Log.md
```

Exit criteria:

- Runtime Flow reviewed.
- Data Ownership reviewed.
- Dependency Map reviewed.
- Risk Register reviewed.
- Refactor Roadmap reviewed.
- Legacy / active / dormant surfaces classified.
- Required ownership decisions approved.

---

## 4. Phase 2 — Frontend Standardization

Status:

```txt
PLANNED
```

Goal:

Make all frontend runtime documents and stores follow a consistent architecture vocabulary.

Standard categories:

```txt
Owner
Consumer
Mutation
Lifecycle
Persistence
Risk
Evidence
Decision
```

Store classification:

```txt
Owner Store
Derived Store
Temporary Store
Legacy Store
Dormant Store
```

Initial classification:

```txt
authStore      → Owner Store / Auth Runtime
branchStore    → Owner Store / Branch Runtime, but ownership split needs decision
cartStore      → Owner Store / Online Cart Runtime, token consumer
orderOnlineStore → Owner Store / Online Order submit state, caller-owned identity payload
employeeStore  → HR Management Store / Legacy compatibility risk for session identity
rootStore      → Candidate legacy aggregate / needs verification
branchHelpers  → Candidate online geo helper / stale import risk
```

API classification:

```txt
Transport Owner
Domain API
Requires Token
Requires Branch
Requires Customer
Uses Refresh
Bypasses Refresh
```

Exit criteria:

- Stores classified.
- API surfaces classified.
- Legacy surfaces classified.
- Dormant surfaces explicitly marked.

---

## 5. Phase 3 — Runtime Cleanup

Status:

```txt
PLANNED / NO CODE YET
```

Goal:

Clean up the highest-risk runtime ambiguities using minimal patches.

Priority order:

```txt
1. Logout Runtime Standardization
2. Branch Ownership Stabilization
3. Route shopSlug / branchSlug Stabilization
4. Auth Bootstrap / Token Runtime Stabilization
5. Route Guard Introduction
6. RBAC / Permission Runtime
```

Rules:

- One file at a time.
- Minimal patch only.
- Verify after each file.
- Update map and blueprint after each phase.

---

## 6. Phase 4 — Component Architecture

Status:

```txt
PLANNED
```

Goal:

Separate high-impact shell components into clear runtime, action, and UI responsibilities.

Target components:

```txt
HeaderPos
SidebarLoader
UnifiedMainNav
LogoutButton
LoginPage
CheckoutPage
```

Candidate separation:

```txt
Header Runtime
Header UI
Header Actions
Header Hooks

Sidebar Engine
Sidebar Config
Sidebar Renderer

Login Form UI
Login Runtime Handler
Post-login Navigation Policy
```

Exit criteria:

- Shell components no longer mix too many runtime responsibilities.
- Navigation policy and data ownership are documented.
- Component refactor remains behavior-preserving.

---

## 7. Phase 5 — Enterprise Frontend Architecture

Status:

```txt
PLANNED
```

Goal:

Turn frontend documentation into a long-term engineering knowledge base.

Target structure:

```txt
docs/frontend/
  README.md
  Frontend_Upgrade_Master_Plan.md
  Risk_Register.md
  Refactor_Roadmap.md
  Architecture_Decision_Log.md
  Legacy_Surface_Map.md
  API_Surface_Map.md
  State_Management_Map.md
  Component_Layer_Map.md
```

Architecture Decision Records should explain why decisions were made, not only what was changed.

Examples:

```txt
ADR-001 — Why authStore owns active session
ADR-002 — Why employeeStore is not session source of truth
ADR-003 — Why POS branch identity must be separated from online branch selection
ADR-004 — Why apiClient owns refresh queue and retry
ADR-005 — Why RBAC remains dormant during Auth stabilization
```

---

## 8. Required Decisions Before Implementation

### Decision 1 — POS Branch Ownership

Recommendation:

```txt
authStore.employee.branchId is canonical POS branch identity.
branchStore provides branch detail/display for that branch.
```

---

### Decision 2 — Online Branch Ownership

Recommendation:

```txt
Online selected branch stays in branchStore.
It must not override POS logged-in branch identity.
```

---

### Decision 3 — Logout Redirect Ownership

Recommendation:

```txt
authStore clears session state.
UI callers own navigation target.
```

---

### Decision 4 — Route Slug Canonical Rule

Recommendation:

```txt
POS shopSlug should be validated or corrected after bootstrap.
Do not rely on arbitrary URL shopSlug as branch truth.
```

---

### Decision 5 — Refresh Failure Handling

Recommendation:

```txt
Do not change apiClient refresh failure behavior until Backend Auth is reviewed.
Frontend should document current chain and prepare test cases first.
```

---

## 9. Current Highest Risks

```txt
CRITICAL — Branch ownership is mixed between POS and Online concepts.
CRITICAL — Session recovery depends on refresh cookie + apiClient + authStore verify.
HIGH     — Logout redirect ownership is split.
HIGH     — URL shopSlug can drift from employee.branchSlug.
HIGH     — loginAction is shared by POS and online checkout.
HIGH     — Checkout uses currentBranch.id and selectedBranchId in different places.
HIGH     — Route guard / RBAC exist but must remain dormant for now.
```

---

## 10. Next Certification Work

Continue Frontend Architecture Certification with:

```txt
1. Legacy_Surface_Map.md
2. API_Surface_Map.md
3. State_Management_Map.md
4. Component_Layer_Map.md
5. Architecture_Decision_Log.md
```

Recommended next file:

```txt
docs/frontend/Legacy_Surface_Map.md
```

Reason:

We must classify active / legacy / dormant surfaces before code refactor starts.

---

## 11. Working Conclusion

The frontend should not be refactored as scattered bug fixes.

It should be upgraded through certification, standardization, and controlled runtime cleanup.

The immediate goal is not only to stop token interruptions, but to create a frontend runtime that is understandable, predictable, and safe to extend.
