import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const ciWorkflow = readFileSync(new URL('../.github/workflows/frontend-ci.yml', import.meta.url), 'utf8')
const releaseWorkflow = readFileSync(new URL('../.github/workflows/production-release.yml', import.meta.url), 'utf8')
const generator = readFileSync(new URL('../scripts/generate-release-metadata.mjs', import.meta.url), 'utf8')
const nvmrc = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim()

assert.equal(nvmrc, '22', 'client Node authority must be Node 22')
assert.equal(vercel.git?.deploymentEnabled, false, 'automatic Vercel Git deployments must remain disabled')
assert.match(ciWorkflow, /node-version:\s*22\b/, 'GitHub CI must use Node 22')
assert.match(ciWorkflow, /branches:\s*\[\s*"main"\s*\]/, 'GitHub CI must protect canonical main authority')
assert.doesNotMatch(ciWorkflow, /integration\/system-hardening-7-agendas/, 'retired integration branch must not remain CI authority')
assert.match(ciWorkflow, /generate-release-metadata\.mjs/, 'CI build must exercise release metadata generation')
assert.match(releaseWorkflow, /workflow_dispatch:/, 'Production release must require explicit workflow dispatch')
assert.match(releaseWorkflow, /expected_sha:/, 'Production release must require an approved SHA')
assert.match(releaseWorkflow, /git rev-parse origin\/main/, 'Production release must verify current main authority')
assert.match(releaseWorkflow, /vercel deploy --prod/, 'Production release must explicitly target Vercel Production')
assert.match(releaseWorkflow, /saduaksabuy\.com\/release\.json/, 'Production release must verify deployed provenance')
assert.doesNotMatch(releaseWorkflow, /^\s*push:\s*$/m, 'Production release must not trigger directly from a Git push')
assert.match(generator, /VERCEL_GIT_COMMIT_SHA/, 'release metadata must capture Vercel provenance when present')
assert.match(generator, /GITHUB_SHA/, 'release metadata must capture GitHub provenance when present')

console.log('Release Safety Foundation Contract: PASS')
