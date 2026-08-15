import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const workflow = readFileSync(new URL('../.github/workflows/frontend-ci.yml', import.meta.url), 'utf8')
const generator = readFileSync(new URL('../scripts/generate-release-metadata.mjs', import.meta.url), 'utf8')

assert.equal(pkg.engines?.node, '22.x', 'client Node authority must be 22.x')
assert.match(pkg.scripts?.build || '', /generate-release-metadata\.mjs/, 'build must emit release metadata before Vite')
assert.equal(vercel.git?.deploymentEnabled?.main, true, 'main must remain deployable on Vercel')
assert.equal(vercel.git?.deploymentEnabled?.['*'], false, 'non-main Vercel deployments must stay disabled')
assert.match(workflow, /node-version:\s*22\b/, 'GitHub CI must use Node 22')
assert.match(workflow, /integration\/system-hardening-7-agendas/, 'integration branch must be covered by CI')
assert.match(generator, /VERCEL_GIT_COMMIT_SHA/, 'release metadata must capture Vercel provenance')
assert.match(generator, /GITHUB_SHA/, 'release metadata must capture GitHub provenance')

console.log('Release Safety Foundation Contract: PASS')
