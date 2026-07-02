# Legacy Surface Map

Status: DRAFT / CERTIFICATION IN PROGRESS

## Purpose
Classify frontend surfaces into ACTIVE, LEGACY, DORMANT, and CANDIDATE before any major refactor.

## ACTIVE (verified)
- authStore
- branchStore
- apiClient
- LoginPage
- CheckoutPage
- HeaderPos
- SidebarLoader
- cartStore
- orderOnlineStore
- App.jsx
- AppRouter

These are production runtime owners or critical consumers.

## LEGACY / COMPATIBILITY
- employeeStore compatibility session fields
- rootStore (requires final usage verification)
- branchHelpers (requires import/path verification)

Rule:
Do not delete. Verify remaining consumers before migration.

## DORMANT
- ProtectedRoute (exists but not mounted in reviewed POS routes)
- RequirePermission
- IfPermission
- Sidebar capability filtering
- Current RBAC runtime

Rule:
Keep frozen during Auth stabilization.

## CANDIDATE FOR FUTURE
- Architecture Decision Records (ADR)
- Runtime capability layer
- Unified logout runtime
- Unified branch ownership runtime
- Unified session runtime

## Certification Exit Criteria
- Every legacy surface classified.
- Every dormant surface confirmed.
- No implementation depends on undocumented legacy behavior.
