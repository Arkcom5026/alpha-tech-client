# Mission B Role Workspace Protocol

Status: ACTIVE BASELINE
Purpose: Separate Mission B workspaces by Responsibility Owner.

Mission B is workflow-centric. Roles may work on different implementation domains, but all work must advance the same operational workflow.

## Workspace Structure

Use role-specific workspaces for new Mission B assignments and reports:

```txt
docs/mission-b/
  assignments/
    FE-01/
    FE-02/
    BE-01/
    BE-02/
  inbox/
    FE-01/
    FE-02/
    BE-01/
    BE-02/
```

Historical shared paths remain valid for past reports:

```txt
docs/mission-b/ASSIGNMENT-###.md
docs/mission-b/inbox/*.md
```

New work should prefer role workspace paths.

## Active Mission B Roles

```txt
FE-01 Runtime Owner
FE-02 UX Owner
BE-01 Backend Runtime Owner
ROLE-ARCH Mission Architect
```

## Assignment Path Rule

New assignments should be created under:

```txt
docs/mission-b/assignments/<ROLE-ID>/ASSIGNMENT-###.md
```

Example:

```txt
docs/mission-b/assignments/FE-01/ASSIGNMENT-018.md
```

## Report Path Rule

Reports should be created under:

```txt
docs/mission-b/inbox/<ROLE-ID>/<REPORT-NAME>.md
```

Example:

```txt
docs/mission-b/inbox/FE-01/FLOW-DESIGN-001.md
```

## Role Boundary Rule

- FE-01 owns runtime flow and FE/BE integration behavior.
- FE-02 owns UX, operator language, and visual/operator clarity.
- BE-01 owns backend runtime behavior and verification.
- BE-02 remains PLANNED until ROLE-ARCH activates it.

A Role must not write reports or assignments into another Role workspace unless it is explicitly a handover note.

## Mission B Current Workflow State

Current understanding:

```txt
B-Flow 1: Template → Add/receive into branch
Status: Operationally working

B-Flow 2: Product already added to branch → Edit/update from QuickStockPage
Status: FE runtime/design incomplete

B-Flow 3: Store-created local product when no ProductTemplate exists
Status: Not designed yet
```

Current likely next assignment:

```txt
FE-01 / ASSIGNMENT-018
QuickStock existing product edit + local product creation flow design
```

Recommended report:

```txt
docs/mission-b/inbox/FE-01/FLOW-DESIGN-001.md
```

## Boot Rule

Any Task receiving a Mission B assignment must read:

```txt
docs/roles/README.md
assigned Role file
docs/mission-b/WORKSPACE.md
docs/mission-b/BLACKBOARD.md
assignment file
```

Backend roles must also read backend maps.
Frontend roles must also read frontend boot/certification documents.
