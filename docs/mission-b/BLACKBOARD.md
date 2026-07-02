# Mission B Blackboard

Status: ACTIVE
Mission: Product Platform Certification
Current Objective: Restore Complete Product Onboarding Flow
Mission Controller: User
Architect Role: This task / ROLE-ARCH
Implementation: LOCKED

---

## 1. Purpose

This file is the shared blackboard for Mission B.

Any new task assigned to Mission B should read this file first to understand the current mission, scope, rules, and assigned work.

Tasks do not communicate with each other. The user coordinates all task reports. ROLE-ARCH defines mission packages and reviews results.

---

## 2. Mission Statement

Restore the complete product onboarding workflow so every branch can:

1. Search Product Templates.
2. Clone a Template into an Operational Product.
3. Create BranchPrice for the branch.
4. Make the product operational immediately.
5. Create a branch-specific product when no suitable Template exists.

---

## 3. Current Phase

Phase ID: B1
Phase Name: Product Flow Discovery
Status: ACTIVE

Goal:
Understand the Product Onboarding Runtime before implementation.

Implementation remains locked until discovery reports are reviewed and approved.

---

## 4. Active Roles

### ROLE-ARCH

Status: ACTIVE

Responsibilities:
- Define mission packages.
- Define scope and deliverables.
- Review reports.
- Identify risks.
- Decide next mission package.
- Keep implementation locked until approved.

Restrictions:
- Do not implement code unless explicitly approved by the user.

---

### ROLE-RUNTIME

Status: ACTIVE

Responsibilities:
- Inspect only assigned runtime files.
- Map runtime flow.
- Identify entry points and exit points.
- Identify API calls and store mutations.
- Identify missing runtime behavior.
- Report findings back to the user.

Restrictions:
- Do not edit code.
- Do not propose patches unless asked.
- Do not expand scope without approval.

---

### ROLE-DOC

Status: ON-DEMAND

Responsibilities:
- Update blueprint, ADR, risk, and certification documents after a phase is reviewed.

Restrictions:
- Not active as a standing role yet.

---

## 5. Reserved Future Roles

These roles are not active yet:

- ROLE-UI
- ROLE-DATA
- ROLE-RECOVERY

Activation rule:
Open only when evidence from B1 shows the role is needed.

---

## 6. Mission Package B1-001

Mission ID: B1-001
Mission Name: Product Onboarding Flow Discovery
Assigned Role: ROLE-RUNTIME
Implementation: LOCKED

Objective:
Understand the current product onboarding runtime from Template Search to Operational Product readiness.

Files to inspect:

```txt
QuickStockPage
ProductFinderPanel
productStore
productApi
```

Search targets:

```txt
template/search
runtimeSearchProducts
ProductFinderPanel
QuickStockPage
clone
BranchPrice
branchPrice
productStore
productApi
```

Questions to answer:

1. Where does product onboarding start?
2. Which component owns Template Search?
3. Which API endpoint is used for Template Search?
4. Where does clone or create-from-template happen?
5. When is Operational Product created?
6. When is BranchPrice created?
7. Is Stock created or only prepared for receiving?
8. Why can a branch not create its own product yet?
9. Which runtime path is missing or incomplete?
10. What files are likely affected if this flow is completed?

Expected report:

```txt
RT-001 Report

1. Runtime Flow
2. Entry Point
3. Exit Point
4. API Calls
5. Store Updates
6. Missing Runtime
7. Risks
8. Next Recommended Inspection
```

Exit criteria:
ROLE-RUNTIME can explain the product onboarding flow from Template Search to branch operational readiness without guessing.

---

## 7. Current Working Rules

1. Product Template is for search and clone source only.
2. Operational Product is the store runtime source of truth.
3. Product detail, BranchPrice, stock, barcode, serial, warranty, cost, retail price, and documents must use Operational Product, not Template Product.
4. Do not activate unrelated Login/Auth work during Mission B.
5. Do not edit implementation before B1 discovery is complete.
6. One file at a time for future implementation.
7. Minimal patch only when implementation is approved.

---

## 8. Current Success Criteria

Mission B succeeds when a branch can:

```txt
Template exists:
Template Search
  ↓
Clone to Operational Product
  ↓
Create BranchPrice
  ↓
Ready for branch operation

Template missing:
Create branch-specific Operational Product
  ↓
Create BranchPrice
  ↓
Ready for branch operation
```

---

## 9. Handoff Instruction For New Tasks

New Mission B tasks should start with:

```txt
Read docs/mission-b/BLACKBOARD.md
Then report your role, assigned mission package, implementation lock status, files in scope, and expected deliverables.
```

Do not begin implementation unless the blackboard explicitly says Implementation: APPROVED.
