import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const workflow = readFileSync(new URL('../.github/workflows/frontend-ci.yml', import.meta.url), 'utf8')
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const releaseWorkflow = readFileSync(new URL('../.github/workflows/production-release.yml', import.meta.url), 'utf8')

assert.doesNotMatch(workflow, /integration\/system-hardening-7-agendas/, 'legacy integration branch must not remain an execution authority')
assert.match(workflow, /branches:\s*\[\s*"main"\s*\]/, 'main must remain the frontend CI integration authority')
assert.equal(packageJson.scripts['test:e2e'], 'playwright test', 'Playwright must remain the browser E2E authority')
assert.match(packageJson.scripts['test:e2e:pos-sale'], /playwright test e2e\/pos-sale-cash-happy-path\.spec\.js/, 'POS browser E2E must use canonical Playwright path')
assert.match(packageJson.scripts['test:canonical-storefront'], /canonical-storefront-route\.contract\.test\.js/, 'storefront route authority must remain canonical')
assert.match(workflow, /npm run test:canonical-storefront/, 'CI must exercise canonical storefront authority')
assert.match(releaseWorkflow, /workflow_dispatch:/, 'production release must remain explicit and separate from E2E verification')
assert.doesNotMatch(releaseWorkflow, /^\s*push:\s*$/m, 'E2E cleanup must not reintroduce push-triggered production releases')

console.log('Frontend Canonical E2E Authority Cleanup Contract: PASS')
