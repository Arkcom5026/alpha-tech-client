# Error & Recovery Catalog

Status: DRAFT / CERTIFICATION IN PROGRESS

## Purpose
Document frontend runtime failures, recovery paths, owners, risks, and required verification before implementation.

## Recovery Model
For every failure record:
- Trigger
- Owner
- Detection
- User Impact
- Recovery Path
- Fallback
- Related ADR
- Related Risk

---

## ER-001 Refresh Failure
Trigger: `/auth/refresh` fails.

Owner:
- apiClient
- authStore

Impact:
- Session cannot be restored after reload or 401.

Recovery:
- Clear invalid runtime state.
- Transition to authenticated=false.
- Allow controlled login flow.

Risk:
CRITICAL

---

## ER-002 Verify Session Failure
Trigger:
`GET /auth/me` fails.

Impact:
- Token may exist but identity is unknown.

Recovery:
- Prevent partial authenticated state.
- Require fresh authentication if verification cannot complete.

Risk:
HIGH

---

## ER-003 Branch Loading Failure
Trigger:
Branch lookup fails after login/verify.

Impact:
- Employee identity exists.
- Branch context unavailable.

Recovery:
- Keep identity.
- Surface branch loading failure.
- Avoid silently switching to another branch.

Risk:
CRITICAL

---

## ER-004 Checkout Branch Context Failure
Trigger:
Missing currentBranch or selectedBranchId.

Impact:
- Branch pricing/order submission may be incorrect.

Recovery:
- Block checkout until branch context is valid.

Risk:
HIGH

---

## ER-005 Logout Cleanup Failure
Trigger:
Only part of auth/cart/branch state is cleared.

Impact:
- Stale runtime remains.

Recovery:
- Standardize logout ownership.
- Verify authStore, branchStore and cartStore cleanup.

Risk:
HIGH

---

## ER-006 Network Failure
Trigger:
API unreachable.

Recovery:
- Preserve local runtime where appropriate.
- Retry only where safe.
- Avoid corrupting runtime state.

Risk:
MEDIUM

---

## Certification Goal
Every critical runtime failure must have a documented recovery path before Auth refactor begins.

## Next Step
Create:
`docs/frontend/Frontend_Runtime_Atlas.md`
