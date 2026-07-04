# Mission B Blackboard

Status: ACTIVE
Mission: Product Platform Certification
Current Objective: Restore Complete Product Onboarding Flow
Mission Controller: User
Architect Role: User-directed runtime planning with AI execution support
Implementation: CONTROLLED BY MISSION CONTROLLER

---

## 1. Purpose

This file is the shared blackboard for Mission B.

Any new task assigned to Mission B should read this file first to understand the current mission, scope, rules, and assigned work.

Tasks do not communicate with each other. The user coordinates all task reports and acts as Mission Controller. Runtime planning, implementation analysis, and verification should follow the active Blueprint doctrine and the Mission Controller's direct instruction.

---

## 1.1 Runtime Migration Doctrine Reference

Mission B must follow:

```txt
docs/blueprint/P1-RUNTIME-MIGRATION-DOCTRINE.md
```

Doctrine status:

```txt
APPROVED / BLUEPRINT ADDENDUM
```

Mission B interpretation:

```txt
P1 does not rewrite proven workflows from zero.
Mission B preserves the existing correct user workflow first, then improves internal responsibility separation.
Frontend must keep user flow, route behavior, and screen intent stable when the workflow is already correct.
Backend migration may be structural when responsibilities must be isolated.
Legacy code is removed only after equivalent runtime flow is safely replaced and verified.
Mission B closes only when branches can create branch-owned Operational Product without requiring Candidate or Template approval.
Promotion to Candidate belongs to Mission C, not Mission B.
```

Execution rule:

```txt
Use small safe migrations, one workflow at a time.
Architecture improves underneath stable user behavior.
```

---

## 2. Mission Statement

Restore the complete product onboarding workflow so every branch can:

1. Search Product Templates.
2. Clone a Template into an Operational Product.
3. Create BranchPrice for the branch.
4. Make the product operational immediately.
5. Create a branch-specific product when no suitable Template exists.

Mission B closes only when branch users can create branch-owned Operational Product without requiring Candidate or Template approval.

---

## 3. Current Phase

Phase ID: B1
Phase Name: Product Flow Discovery / Runtime Migration
Status: ACTIVE

Goal:
Restore and harden the Product Onboarding Runtime using the P1 Runtime Migration Doctrine.

Implementation is allowed only when explicitly directed by the Mission Controller and must stay within the approved workflow scope.

---

## 4. Task Registry

### MISSION-CONTROLLER

Task Name: Mission Controller / Architecture Decision Owner
Status: ACTIVE
Current Work: Directing Mission B runtime migration
Responsibility:
- Mission priority
- Scope approval
- Architecture decision when trade-off is real
- Final acceptance
- Blueprint / doctrine direction

---

### FE-01

Task Name: Frontend Runtime Owner
Role: FE-RUNTIME
Status: ACTIVE
Last Completed Work: OPERATIONAL-FIRST-DISCOVERY-001
Last Report: docs/mission-b/inbox/FE-01/OPERATIONAL-FIRST-DISCOVERY-001.md
Responsibility:
- QuickStock runtime behavior
- Product Discovery runtime UI
- Product List / Detail operational-only behavior
- Store-owned frontend runtime actions
- Frontend migration by responsibility while preserving existing user workflow

Not responsible for:
- Backend contract changes
- Database migration
- Candidate / Template governance

---

### BE-01

Task Name: Backend Runtime Owner
Role: BE-RUNTIME
Status: ACTIVE AS ASSIGNED
Last Completed Work: Backend create-from-template / runtime contract support
Responsibility:
- Backend route/controller/service/repository migration
- Operational Product creation contracts
- BranchPrice readiness contracts
- Backend runtime verification

Not responsible for:
- Frontend UX behavior
- Candidate promotion

---

### LEGACY TASK-01

Task Name: Runtime Analysis Squad
Role: ROLE-RUNTIME
Status: RETIRED / REPLACED BY DIRECT FE-01 / BE-01 EXECUTION
Last Completed Work: WP-001 Runtime Discovery
Last Report: docs/mission-b/inbox/RT-001.md
Responsibility:
- Historical runtime discovery reference

---

### LEGACY TASK-02

Task Name: User Journey Squad
Role: ROLE-RUNTIME
Status: RETIRED / REPLACED BY DIRECT MISSION CONTROLLER REVIEW
Last Completed Work: WP-002 User Flow Discovery
Last Report: docs/mission-b/inbox/UI-001.md
Responsibility:
- Historical user journey discovery reference

---

## 5. Active Roles

### MISSION-CONTROLLER

Status: ACTIVE

Responsibilities:
- Define mission goal and priority.
- Approve major architecture direction.
- Decide when a real Architecture Decision Point appears.
- Accept or redirect completed work.

Restrictions:
- None. Mission Controller is the final authority for Mission B direction.

---

### FE-01 / BE-01 RUNTIME EXECUTION

Status: ACTIVE AS DIRECTED

Responsibilities:
- Analyze before implementation.
- Work one workflow at a time.
- Use minimal safe patches.
- Preserve existing correct user workflow.
- Avoid broad refactor unless explicitly approved.
- Verify Product Discovery and Receive Flow regressions when relevant.
- Submit concise Git inbox reports for completed implementation.

Restrictions:
- Do not change backend from FE scope.
- Do not change frontend from BE scope unless explicitly approved.
- Do not implement Candidate promotion in Mission B.
- Do not rewrite proven workflow from zero.

---

### ROLE-DOC

Status: ON-DEMAND

Responsibilities:
- Update blueprint, doctrine, ADR, risk, and certification documents when directed.

Restrictions:
- Not active as a standing role unless explicitly assigned.

---

## 6. Reserved Future Roles
