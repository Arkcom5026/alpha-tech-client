# WORKSPACE-TRANSITION-001

Mission: Mission B
Owner: ROLE-ARCH
Status: ACTIVE NOTICE

## Purpose

Mission B is moving from shared workspace usage to role-specific workspaces.

This notice is the operating reference for the transition.

## Repository Rule

The Git repository is the durable source of Mission instructions and reports.

Chat messages are coordination signals only.

## Role Workspace Rule

Each role works in its own Mission B workspace.

Assignment path:

```txt
docs/mission-b/assignments/<ROLE>/
```

Report path:

```txt
docs/mission-b/inbox/<ROLE>/
```

## Standard Role Flow

```txt
Boot
Read role documents
Read Mission B workspace protocol
Read the role assignment
Perform the assigned work
Write the report into the role inbox
Stop and wait for the next assignment
```

## Boundaries

A role reads its own assignment and writes its own report.

A role does not write reports into another role inbox.

A role does not create assignments for other roles.

If work outside the role scope is found, record it as a finding in the role report.

## Historical Shared Workspace

Older Mission B documents in shared paths are historical references.

New Mission B work should use role-specific workspaces.

## Coordinator Note

Mission Coordinator can share this file link with each role before asking that role to boot.