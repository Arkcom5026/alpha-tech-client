# SUCCESSOR-BOOT-001 — Mission B Next Task Boot

Intended next Role: FE-01 Runtime Owner
Prepared by: ROLE-ARCH
Status: READY

## Start Here

You are entering Mission B as:

```txt
FE-01 Runtime Owner
```

Your task is not to implement immediately.

Your first task is to design the missing QuickStock runtime flows.

## ROLE-ARCH Operating Model

Repository is the single source of truth.

ROLE-ARCH does not dispatch work directly to FE/BE roles through chat.

ROLE-ARCH responsibilities are:

```txt
Analyze Mission
Produce Decisions
Produce Assignments
Update Mission State
Perform Audit
Issue Certification
Prepare Successor Boot
```

ROLE-ARCH completes its responsibility by updating Git documentation in the correct workspace.

Mission Coordinator is responsible for notifying the next Role to boot and read its assignment from Git.

All Roles follow the same lifecycle:

```txt
Boot
↓
Read Git
↓
Perform Assignment
↓
Write Deliverable to Git
↓
Complete Role
```

This means chat instructions are coordination signals only. The durable instruction source is the repository.

## Mission B Current State

```txt
B-Flow 1: Template → Add/receive into branch
Status: Operationally working

B-Flow 2: Product already added to branch → edit/update from QuickStockPage
Status: FE runtime/design incomplete

B-Flow 3: Store-created local product without ProductTemplate
Status: Not designed yet
```

## Required Reading Order

Read:

```txt
docs/roles/README.md
docs/roles/frontend/FE-01-RUNTIME.md
docs/mission-b/WORKSPACE.md
docs/mission-b/BLACKBOARD.md
docs/mission-b/inbox/ROLE-ARCH/MISSION-STATUS.md
docs/mission-b/inbox/ROLE-ARCH/HANDOVER-001.md
docs/mission-b/assignments/FE-01/ASSIGNMENT-018.md
```

Also read relevant FE source files only after understanding the assignment.

Recommended files:

```txt
src/features/product/pages/QuickStockPage.jsx
src/features/product/components/quick-stock/ProductFinderPanel.jsx
src/features/product/components/quick-stock/ProductMasterPanel.jsx
src/features/product/components/quick-stock/CommitBar.jsx
src/features/product/api/productApi.js
src/features/product/store/productStore.js
```

## Current Decision Needed

Define canonical FE runtime flow for:

```txt
1. Product already exists in branch and operator wants to edit/update it from QuickStockPage.
2. Store wants to create a local product that has no ProductTemplate.
```

## Do Not Do Yet

```txt
Do not modify backend.
Do not refactor QuickStockPage broadly.
Do not create new backend endpoint assumptions.
Do not change UX language before runtime flow is clear.
Do not implement before FLOW-DESIGN-001 is complete unless assignment explicitly allows it.
```

## Expected Deliverable

```txt
docs/mission-b/inbox/FE-01/FLOW-DESIGN-001.md
```

## Next Handover

After FE-01 produces FLOW-DESIGN-001, ROLE-ARCH should decide:

```txt
A) FE-01 implementation assignment
B) FE-02 UX review assignment
C) BE-01 backend gap assignment
D) Mission B certification path
```