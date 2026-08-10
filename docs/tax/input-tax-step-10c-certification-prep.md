# ALPHA-TECH Input Tax 10/10 — Step 10C Client Certification Preparation

## Client authority

Branch: `feature/input-tax-step-10b-fe-gap-closure`

Baseline main SHA: `1771055bdbc5a09577d518438ad74fa776ed3c45`

Repository comparison at handoff: branch ahead of main, behind 0.

## Local gate sequence

Run from `D:\alpha-tech\client` after fetching the branch. Do not push to `origin/main` until every required gate passes.

```powershell
git fetch origin
git status --short
git switch main
git pull --ff-only origin main
git switch -c integration/input-tax-step-10b origin/feature/input-tax-step-10b-fe-gap-closure

git diff --check origin/main...HEAD
node tests/input-vat-report-authority-ui.contract.test.js
node tests/input-tax-step-10b-error-mapping.contract.test.js
npm run typecheck
npm run build
npm run lint
```

If targeted verification passes, run additional relevant client verification required by the repository before the final local-main push.

## Merge-to-local-main rule

After verification on the integration branch:

```powershell
git switch main
git merge --no-ff integration/input-tax-step-10b
```

Re-run targeted contract tests, typecheck, build and lint on merged local `main`. Push only after PASS.

## Step 10B scope note

The currently verified usable FE surface is Input VAT Report plus the shared Input Tax error-code-to-Thai-message contract. Missing dedicated Input Tax workspaces remain explicit gaps and are not represented by placeholder UI. Operational E2E certification must only claim surfaces that are actually present and usable.
