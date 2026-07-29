# Operational Status Badge Increment

## Mission

Expose the protected backend operational verification result directly in the authenticated POS/Superadmin header so an administrator can verify Production readiness without DevTools or Postman.

## Scope

- Superadmin/Admin-only badge in HeaderPos
- One read-only request after authenticated shell is ready
- Manual refresh by clicking the badge
- Compact details panel for READY / WARNING / FAILED
- No polling loop
- No business mutation
- No secrets or raw stack traces shown

## API Contract

GET /api/system/operational-verification

## Runtime Safety

- Uses the existing authenticated apiClient
- Hidden for unauthorized roles
- Network or server failure becomes UNKNOWN/FAILED UI state without affecting POS operation
- No navigation or auth lifecycle changes

## Verification

Repository contract coverage will assert endpoint ownership, role gating, one-shot load, manual refresh, and absence of interval polling.
