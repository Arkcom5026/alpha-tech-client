# Frontend Refactor Roadmap

Status: DRAFT / PLANNING
Scope: Frontend Auth/Login/Branch/Token stabilization
Repository: alpha-tech-client
Related Index: `docs/frontend/README.md`
Related Risk Register: `docs/frontend/Risk_Register.md`

---

## 1. Purpose

This roadmap defines the safe order for future frontend refactor work after architecture mapping.

ไฟล์นี้ใช้กำหนดลำดับการ Refactor ฝั่ง Frontend อย่างปลอดภัย หลังจากทำ Map และ Risk Register แล้ว

This roadmap is not yet authorization to change runtime code.

---

## 2. Current Position

Current phase:

```txt
Frontend Architecture Certification
```

Current implementation status:

```txt
READ-ONLY INVESTIGATION / NO AUTH REFACTOR YET
```

Backend status:

```txt
LOCKED until frontend rules are certified
```

---

## 3. Required Decisions Before Refactor

### Decision 1 — POS Branch Ownership

Question:

```txt
Should POS branch identity be anchored exclusively to authStore.employee.branchId?
```

Recommended direction:

```txt
Yes. authStore.employee.branchId should be canonical POS branch identity.
branchStore should hold loaded branch details for display/API convenience.
```

---

### Decision 2 — Online Branch Ownership

Question:

```txt
Should online selected branch remain separate from POS branch identity?
```

Recommended direction:

```txt
Yes. Online branch selection should stay in branchStore but must not override POS identity branch.
```

---

### Decision 3 — Route shopSlug Canonical Rule

Question:

```txt
Should URL shopSlug be validated against authStore.employee.branchSlug after bootstrap?
```

Recommended direction:

```txt
Yes, but only after bootstrap and branch identity are stable.
Do not add a guard until Auth Runtime is certified.
```

---

### Decision 4 — Logout Redirect Ownership

Question:

```txt
Should authStore own redirects, or should UI callers own redirects?
```

Recommended direction:

```txt
Prefer UI callers own navigation.
authStore should clear state/session only.
```

---

### Decision 5 — Refresh Failure Handling

Question:

```txt
Should apiClient reset auth state when refresh fails?
```

Recommended direction:

```txt
Decide after backend refresh behavior is reviewed.
Do not change apiClient behavior before BE review.
```

---

## 4. Proposed Refactor Phases

### Phase 0 — Certification Lock

Status:

```txt
CURRENT
```

Goal:

Finish evidence-based frontend certification.

Deliverables:

```txt
Runtime_Flow_Map.md
Data_Ownership_Map.md
Dependency_Map.md
Risk_Register.md
Refactor_Roadmap.md
```

Exit criteria:

- Branch ownership rule approved.
- Logout ownership rule approved.
- Route slug ownership rule approved.
- apiClient refresh chain reviewed.
- Backend review remains locked until these are done.

---

### Phase 1 — Logout Runtime Standardization

Goal:

Make logout behavior predictable without changing auth/refresh logic.

Candidate changes:

- Standardize `logout`, `logoutAction`, `logoutAllDevicesAction` semantics.
- Decide whether authStore or UI owns navigation.
- Ensure HeaderPos, UnifiedMainNav, LogoutButton, and SidebarSuperAdmin use one rule.

Risk:

```txt
HIGH
```

Why first:

Logout cleanup is smaller than full token/refresh refactor and removes current redirect ambiguity.

---

### Phase 2 — Branch Ownership Stabilization

Goal:

Separate POS identity branch from online selected branch by explicit rule.

Candidate changes:

- Ensure POS shell uses `authStore.employee.branchId` as canonical identity.
- Prevent HeaderPos from reloading POS branch from drifted selectedBranchId.
- Clarify currentBranch/selectedBranchId usage for online checkout.

Risk:

```txt
CRITICAL
```

Why after logout:

Branch ownership affects POS navigation, product pages, checkout, reports, and print pages.

---

### Phase 3 — Route Slug Stabilization

Goal:

Make `shopSlug` behavior safe and predictable.

Candidate changes:

- Decide whether `general-pos` fallback remains allowed.
- Decide whether catch-all should hardcode `/advancetech/pos/dashboard`.
- Decide whether POS routes should correct URL slug after bootstrap.

Risk:

```txt
HIGH
```

Why after branch ownership:

Canonical slug depends on canonical branch identity.

---

### Phase 4 — Auth Bootstrap / Token Runtime Stabilization

Goal:

Reduce repeated login/session interruption.

Candidate changes:

- Improve bootstrap loading behavior if needed.
- Clarify authChecked/isBootstrappingAuth semantics.
- Preserve online checkout behavior.
- Preserve apiClient refresh queue behavior unless BE alignment requires change.

Risk:

```txt
CRITICAL
```

Why later:

Token runtime touches app-wide transport and should be changed only after ownership rules are stable.

---

### Phase 5 — Route Guard Introduction

Goal:

Introduce route protection only after bootstrap/token/branch rules are stable.

Candidate changes:

- Mount ProtectedRoute or new guard around appropriate surfaces.
- Ensure guard waits for bootstrap.
- Ensure guard redirects to correct portal/login path.
- Avoid broad activation without test plan.

Risk:

```txt
HIGH
```

Why later:

Guard can affect every POS page at once.

---

### Phase 6 — RBAC / Permission Runtime

Goal:

Reintroduce permissions after Auth and Branch are stable.

Candidate changes:

- Migrate permission identity source away from employeeStore/customerStore if needed.
- Use authStore/certified capability runtime.
- Apply menu filtering only after permission ownership is certified.

Risk:

```txt
HIGH
```

Why last:

Authorization should not be mixed with authentication/session stabilization.

---

## 5. Regression Test Checklist

Each implementation phase must verify:

```txt
POS login
POS reload on dashboard
POS module navigation
POS logout
Superadmin login/logout
Online customer login
Online checkout cart merge
Online checkout submit
Cart sync with token
Refresh after reload
Refresh after idle if reproducible
Invalid token behavior
Branch display in HeaderPos
Sidebar links preserve correct shopSlug
```

---

## 6. Files That Must Be Treated Carefully

### Critical Files

```txt
src/features/auth/store/authStore.js
src/utils/apiClient.js
src/features/branch/store/branchStore.js
src/App.jsx
src/routes/AppRouter.jsx
src/features/auth/pages/LoginPage.jsx
src/features/pos/components/header/HeaderPos.jsx
```

### High-Impact Consumers

```txt
src/components/common/UnifiedMainNav.jsx
src/components/LogoutButton.jsx
src/features/superadmin/sidebar/SidebarSuperAdmin.jsx
src/features/online/order/components/LoginForm.jsx
src/features/online/order/pages/CheckoutPage.jsx
src/features/online/cart/store/cartStore.js
src/features/pos/components/sidebar/SidebarLoader.jsx
```

---

## 7. Implementation Rule

When implementation begins:

```txt
One file at a time.
Minimal patch only.
No multi-file rewrite.
Verify after each file.
Update maps and blueprint after each phase.
```

---

## 8. Current Recommendation

Do not start code refactor yet.

Next best action:

```txt
Review and approve the five required decisions in Section 3.
Then select Phase 1: Logout Runtime Standardization as the first implementation candidate.
```
