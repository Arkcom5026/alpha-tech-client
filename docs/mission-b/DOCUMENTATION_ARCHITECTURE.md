# Mission B Documentation Architecture v1

Status: APPROVED
Owner: ROLE-ARCH

## Purpose

This document defines how Mission B documentation is organized.
Its goal is to keep each document focused, avoid duplicated status, and support multi-task work through Git.

## Document Roles

| Document | Owner | Responsibility |
|---|---|---|
| BLACKBOARD.md | ROLE-ARCH | Current mission status, task registry, active assignments, and operating rules |
| DOCUMENTATION_ARCHITECTURE.md | ROLE-ARCH | Documentation structure and governance |
| ARCHITECTURE_STATUS.md | ROLE-ARCH | Compact current-status dashboard when created |
| ROADMAP.md | ROLE-ARCH | Long-term Mission B phases and milestones when created |
| SERIES_INDEX.md | ROLE-ARCH | Series and patch index when created |
| CERTIFICATION_INDEX.md | ROLE-ARCH | Certified patch index |
| WP-* | ROLE-ARCH | Analysis and planning work packages |
| ASSIGNMENT-* | ROLE-ARCH | Execution orders for named tasks |
| inbox/* | Assigned task | Reports and evidence |
| certification/* | ROLE-ARCH | Certification records |

## Reading Order For New Tasks

1. BLACKBOARD.md
2. DOCUMENTATION_ARCHITECTURE.md
3. ARCHITECTURE_STATUS.md when available
4. SERIES_INDEX.md when available
5. Assigned WP or ASSIGNMENT file

## Rules

1. One document should have one main responsibility.
2. Do not duplicate current operational status across many files.
3. BLACKBOARD.md is the current operational source of truth.
4. Inbox files are evidence reports, not specifications.
5. Certification files summarize approved results.
6. New document types require ROLE-ARCH approval.

## Next Normalization Steps

1. Create ARCHITECTURE_STATUS.md.
2. Create SERIES_INDEX.md.
3. Create ROADMAP.md.
4. Continue Series S1 implementation.
