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

Tasks do not communicate with each other. The user coordinates all task reports. ROLE-ARCH defines work packages and reviews results.

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

## 4. Task Registry

### ROLE-ARCH

Task Name: Architect / Mission Controller Support
Status: ACTIVE
Current Work: WP-003 Product Onboarding Gap Analysis
Responsibility:
- Mission planning
- Work package creation
- Review
- Decision
- Certification
- Blackboard updates

---

### TASK-01

Task Name: Runtime Analysis Squad
Role: ROLE-RUNTIME
Status: WAITING
Last Completed Work: WP-001 Runtime Discovery
Last Report: docs/mission-b/inbox/RT-001.md
Responsibility:
- Runtime Flow
- API Flow
- Store Flow
- State Flow
- Component Runtime
- Frontend Runtime behavior

Not responsible for:
- UX
- User Journey
- UI Review

---

### TASK-02

Task Name: User Journey Squad
Role: ROLE-RUNTIME
Status: WAITING
Last Completed Work: WP-002 User Flow Discovery
Last Report: docs/mission-b/inbox/UI-001.md
Responsibility:
- User Journey
- Screen Flow
- Navigation
- User Decision
- UX risk
- User expectation

Not responsible for:
- API
- Store
- Backend

---

## 5. Active Roles

### ROLE-ARCH

Status: ACTIVE

Responsibilities:
- Define work packages.
- Define scope and deliverables.
- Review reports from Git inbox.
- Identify risks.
- Decide next work package.
- Keep implementation locked until approved.

Restrictions:
- Do not implement code unless explicitly approved by the user.

---

### ROLE-RUNTIME

Status: ACTIVE

Responsibilities:
- Inspect only assigned runtime files.
- Map runtime flow or user journey according to assigned squad responsibility.
- Identify entry points and exit points.
- Identify missing runtime or missing user flow.
- Submit findings to Git inbox.

Restrictions:
- Do not edit application code.
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

## 6. Reserved Future Roles

These roles are not active yet:

- ROLE-UI
- ROLE-DATA
- ROLE-RECOVERY

Activation rule:
Open only when evidence from B1 shows the role is needed.

---

## 7. Current Work Package Status

| Work Package | Owner | Status | Report |
|---|---|---|---|
| WP-001 Runtime Discovery | TASK-01 Runtime Analysis Squad | COMPLETE / APPROVED | docs/mission-b/inbox/RT-001.md |
| WP-002 User Flow Discovery | TASK-02 User Journey Squad | COMPLETE / APPROVED | docs/mission-b/inbox/UI-001.md |
| WP-003 Product Onboarding Gap Analysis | ROLE-ARCH | ACTIVE | docs/mission-b/inbox/GAP-001.md |

Current assignment:

```txt
No new assignment for TASK-01 or TASK-02.
ROLE-ARCH is responsible for WP-003 synthesis.
```

---

## 8. Mission Inbox Workflow

Goal:
Allow tasks to send reports through Git so the user does not need to copy/paste reports between tasks.

Workflow:

```txt
ROLE-ARCH updates BLACKBOARD.md
  ↓
User sends assignment to the named task
  ↓
Assigned task reads BLACKBOARD.md and assigned WP file
  ↓
Assigned task performs discovery
  ↓
Assigned task writes report to docs/mission-b/inbox/<REPORT-ID>.md
  ↓
User tells ROLE-ARCH to read that report path
  ↓
ROLE-ARCH reviews report and updates BLACKBOARD.md / next decision
```

Inbox rules:

1. Inbox files are reports, not implementation patches.
2. Inbox reports must not modify runtime source code.
3. Inbox reports must include mission ID, role, scope, findings, risks, and next recommended inspection.
4. ROLE-ARCH reviews reports from inbox; reports are not automatically approved.

---

## 9. Current Working Rules

1. Product Template is for search and clone source only.
2. Operational Product is the store runtime source of truth.
3. Product detail, BranchPrice, stock, barcode, serial, warranty, cost, retail price, and documents must use Operational Product, not Template Product.
4. Do not activate unrelated Login/Auth work during Mission B.
5. Do not edit implementation before B1 discovery is complete.
6. One file at a time for future implementation.
7. Minimal patch only when implementation is approved.
8. Task reports should be sent through Git inbox when possible.
9. Task assignment must name the exact task owner: TASK-01, TASK-02, or ROLE-ARCH.

---

## 10. Current Success Criteria

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

## 11. Handoff Instruction For New Tasks

New Mission B tasks should start with:

```txt
Read docs/mission-b/BLACKBOARD.md
Then report your task name, role, current assignment, implementation lock status, files in scope, expected deliverables, and report destination.
```

Do not begin implementation unless the blackboard explicitly says Implementation: APPROVED.