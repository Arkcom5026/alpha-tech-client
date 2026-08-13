# Frontend Runtime + Design System Risk Analysis

Status: ACTIVE

## 1. Purpose

This document defines how migration risk is classified, reviewed and reduced. It does not declare any module's actual risk level until repository and runtime evidence support that classification.

## 2. Risk Dimensions

Every candidate change is assessed across these dimensions:

| Dimension | Question |
|---|---|
| Workflow criticality | Can failure block or corrupt a real business operation? |
| Data mutation | Does the surface create, update, delete, approve, close, pay, receive or move stock? |
| Dependency reach | How many pages, features or modules consume the changed foundation? |
| State complexity | Does the flow combine local, global, server and persisted state? |
| Async complexity | Are retries, duplicate clicks, stale responses or race conditions possible? |
| Permission sensitivity | Can visual or runtime changes expose an action to the wrong role? |
| Responsive sensitivity | Is the surface heavily used on phones, tablets or constrained dialogs? |
| Accessibility sensitivity | Does the change affect focus, keyboard use, labels or modal trapping? |
| Rollback difficulty | Can the increment be reverted without reverting unrelated work? |
| Evidence quality | Is current behavior verified, partially known or inferred? |

## 3. Classification

### LOW

Typical characteristics:

- documentation-only change
- new unused token or primitive foundation
- isolated presentational surface
- no data mutation
- narrow dependency reach
- simple rollback
- current behavior well understood

Required minimum:

- repository review
- focused build/typecheck when code changes
- visual smoke check for affected surface

### MEDIUM

Typical characteristics:

- shared component used by several non-transactional pages
- form presentation change with preserved submit handler
- loading, empty-state or error normalization change
- dialog or table behavior used across multiple features
- moderate responsive or accessibility impact

Required minimum:

- changed-path and dependency review
- build, typecheck and relevant tests
- desktop and mobile verification
- success and failure-path smoke evidence

### HIGH

Typical characteristics:

- sales/POS, payment, stock movement, purchase receiving, repair handoff, claim transition or other transactional workflow
- destructive or irreversible state transition
- authentication, permission or routing surface
- shared runtime adapter with repository-wide reach
- change affecting duplicate-submit, retries, stale responses or confirmation semantics
- unclear current behavior or weak rollback boundary

Required minimum:

- explicit architecture review before implementation
- narrow representative-first increment
- build, typecheck and tests
- operational evidence for success, validation failure and API failure
- permission and responsive verification where applicable
- rollback plan recorded before expansion

## 4. High-impact Dependency Policy

A component or runtime utility is high impact when repository evidence shows one or more of the following:

- imported across multiple business modules
- mounted near an application root, router or provider boundary
- wraps form submission, API requests, notifications or dialogs
- controls global theme, layout, authentication or permissions
- participates in transactional workflows

High-impact does not automatically mean defective. It means migration must proceed through compatibility and representative proof rather than direct mass replacement.

## 5. Known Risk Categories to Audit

The inventory must explicitly check for:

- multiple UI libraries representing the same primitive
- native `alert` or `confirm` mixed with custom dialogs
- direct third-party toast imports across modules
- duplicated API error extraction
- local loading flags with inconsistent duplicate-submit behavior
- hardcoded colors and dimensions embedded in workflow components
- shared components containing module-specific branching
- form controls that do not consistently connect labels and errors
- modal implementations without reliable focus or mobile overflow behavior
- table actions that change layout or availability by screen width
- local CSS overrides that bypass theme or tokens

These are audit targets, not claims that the repository contains each pattern.

## 6. Migration Risk Controls

### Preserve behavior before improving appearance

The first migration pass keeps the same route, API call, validation rule, permission check, workflow order and post-success result.

### Separate foundation from adoption

Create and verify tokens, primitives and adapters before replacing all consumers.

### Prefer compatibility over big-bang replacement

Allow temporary adapters where they reduce transactional risk, with an explicit retirement condition.

### Migrate from low to high criticality

Prove patterns on simple surfaces before applying them to sales, payment, stock, repair or claim workflows.

### Keep module ownership visible

Shared code may represent a button, field, dialog or runtime policy. The module still decides when and why it is used.

### Require evidence at the correct gate

Repository inspection cannot certify runtime behavior. Build output cannot certify an end-to-end business operation. Operational claims require observed execution.

## 7. Risk Register Template

The verified inventory should populate entries using this format:

| ID | Path/Foundation | Consumers | Risk | Evidence | Failure Impact | Migration Strategy | Required Gate | Status |
|---|---|---:|---|---|---|---|---|---|
| R-XXX | Verified path | Verified count/list | LOW/MEDIUM/HIGH | Repository/runtime reference | Concrete impact | Isolate/adapter/replace | A/B/C | Pending |

Do not enter guessed consumer counts or assumed module impact.

## 8. Escalation Conditions

Escalate for architecture review when:

- a neutral primitive needs business-domain props
- a runtime adapter begins deciding redirects, resets, printing or workflow continuation
- one migration requires route or API contract changes
- a design token is named for a single module workflow
- a shared abstraction increases conditional branching instead of reducing duplication
- removal of legacy code cannot be proven safe from repository references
- a high-risk workflow lacks reproducible runtime evidence

## 9. Retirement Risk

Legacy code is removed only when:

1. all verified consumers have migrated,
2. repository search shows no runtime references,
3. replacement behavior has passed required gates,
4. rollback no longer depends on the legacy path,
5. exports, tests and documentation are updated together.

A file being old, duplicated or visually inconsistent is not sufficient evidence for deletion.

## 10. Current Conclusion

Wave 1 architecture and governance work is low risk because it is documentation-only. Actual component, runtime and module risk classifications remain pending verified repository inventory and must not be inferred from architecture documents alone.
