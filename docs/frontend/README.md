# Frontend Architecture Certification

Status: ACTIVE / CERTIFICATION IN PROGRESS
Scope: Frontend only
Repository: alpha-tech-client
Command Center: `docs/blueprint/Active_Blueprint.md`

---

## 1. Purpose

This folder is the standard entry point for Frontend Architecture Certification.

โฟลเดอร์นี้คือจุดเข้าอ่านมาตรฐานสำหรับการรับรองสถาปัตยกรรม Frontend ก่อน Refactor ระบบใหญ่

The goal is to make frontend runtime decisions evidence-based rather than assumption-based.

---

## 2. Certification Principle

```txt
No Major Refactor Without Maps
```

For Auth/Login/Branch/Token work, implementation must not begin until the related runtime, ownership, dependency, and risk documents are reviewed.

---

## 3. Current Certification Scope

Current active agenda:

```txt
STEP P1-FE-AUTH-CERT-01 — Frontend Authentication Architecture Certification
```

Primary problem:

```txt
Employees experience repeated login/session interruptions during real store operation.
```

Current policy:

```txt
Frontend first.
Backend locked until frontend runtime is sufficiently mapped.
```

---

## 4. Core Architecture Documents

### Runtime Flow

```txt
docs/map/Runtime_Flow_Map.md
```

Defines:

- Browser startup
- main.jsx
- App bootstrap
- authStore bootstrap
- apiClient refresh
- RouterProvider
- POS layout
- Login flow
- Checkout flow

---

### Data Ownership

```txt
docs/map/Data_Ownership_Map.md
```

Defines:

- authStore ownership
- branchStore ownership
- employee identity ownership
- customer identity ownership
- apiClient transport ownership
- cart/order ownership
- logout ownership issues

---

### Dependency Map

```txt
docs/map/Dependency_Map.md
```

Defines:

- AuthStore consumers
- BranchStore consumers
- apiClient consumers
- route guard surface
- permission/RBAC surface
- legacy/compatibility risk

---

## 5. Focused Verification Documents

```txt
docs/map/Login_Checkout_Dependency_Verification.md
docs/map/Branch_Navigation_Cart_Dependency_Verification.md
docs/map/Permission_Identity_Dependency_Verification.md
```

These documents record focused evidence passes for specific runtime surfaces.

---

## 6. Frontend Certification Documents In This Folder

```txt
docs/frontend/README.md
docs/frontend/Risk_Register.md
docs/frontend/Refactor_Roadmap.md
```

Future certified summaries may be added here after the map documents are reviewed and locked.

---

## 7. Current High-Risk Areas

### Branch Runtime

POS branch identity and online branch selection currently share branchStore fields.

### Logout Runtime

Redirect ownership is split between authStore actions and UI callers.

### Route Slug Runtime

URL `shopSlug` is used widely and may drift from authenticated employee branchSlug.

### Transport Runtime

Session continuity depends on refresh cookie, withCredentials, `/auth/refresh`, token update, and `/auth/me` verification.

---

## 8. Current Certification Status

```txt
Auth Runtime: DRAFT / MAPPED
Branch Runtime: DRAFT / RISK IDENTIFIED
Transport Runtime: DRAFT / MAPPED
Router Runtime: DRAFT / MAPPED
Login Runtime: DRAFT / MAPPED
Checkout Runtime: DRAFT / MAPPED
Permission Runtime: DORMANT / OUT OF SCOPE
RBAC Runtime: DORMANT / OUT OF SCOPE
```

---

## 9. Working Rules

1. Do not activate route guards during current Auth stabilization.
2. Do not activate RBAC or menu capability filtering during current Auth stabilization.
3. Do not change apiClient refresh behavior without a test plan.
4. Do not change authStore token fields without checking apiClient and cartStore.
5. Do not change branchStore ownership until POS branch vs online branch rule is decided.
6. Do not change LoginPage navigation until canonical branchSlug/shopSlug rule is decided.
7. Do not standardize logout until redirect ownership is decided.

---

## 10. Next Step

Use:

```txt
docs/frontend/Risk_Register.md
docs/frontend/Refactor_Roadmap.md
```

as the planning bridge between mapping and implementation.
