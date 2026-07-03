# ROLE-ARCH Assignment Workspace — Mission B

Status: ACTIVE
Purpose: Mission planning, assignment queue, architecture decisions, audit/certification preparation, and successor boot preparation for Mission B.

ROLE-ARCH owns coordination, not isolated implementation.

## Operating Rule

Role Boot is one-time initialization.

After a Role has completed Boot, ROLE-ARCH does not include Boot instructions in each new assignment.

ROLE-ARCH assignments should describe Mission work only:

```txt
Mission
Assigned Role
Objective
Scope
Deliverable path
Constraints
Completion response
```

Mission Coordinator notifies the Role to read the latest assignment in its own workspace.

ROLE-ARCH then waits for the Role report in that Role inbox before making the next Mission decision.

Typical files:

```txt
MISSION-PLAN.md
ASSIGNMENT-QUEUE.md
ARCH-ACTION-###.md
SUCCESSOR-BOOT-###.md
```