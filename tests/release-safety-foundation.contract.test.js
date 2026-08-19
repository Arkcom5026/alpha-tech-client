import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const ciWorkflow = readFileSync(new URL('../.github/workflows/frontend-ci.yml', import.meta.url), 'utf8')
const releaseWorkflow = readFileSync(new URL('../.github/workflows/production-release.yml', import.meta.url), 'utf8')
const generator = readFileSync(new URL('../scripts/generate-release-metadata.mjs', import.meta.url), 'utf8')
const nvmrc = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim()

assert.equal(nvmrc, '22', 'client Node authority must be Node 22')
assert.deepEqual(
  vercel.git?.deploymentEnabled,
  { main: true, '*': false },
  'automatic Vercel Git deployments must be enabled only for canonical main',
)
assert.equal(
  vercel.ignoreCommand,
  'if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi',
  'Vercel ignored-build gate must allow Production and skip Preview builds',
)
assert.match(vercel.buildCommand || '', /npm run build\s*&&\s*node scripts\/generate-release-metadata\.mjs/, 'Vercel build must publish release provenance after Vite build')
assert.match(ciWorkflow, /node-version:\s*22\b/, 'GitHub CI must use Node 22')
assert.match(ciWorkflow, /branches:\s*\[\s*"main"\s*\]/, 'GitHub CI must protect canonical main authority')
assert.doesNotMatch(ciWorkflow, /integration\/system-hardening-7-agendas/, 'retired integration branch must not remain CI authority')
assert.match(ciWorkflow, /generate-release-metadata\.mjs/, 'CI build must exercise release metadata generation')

// Keep the manual exact-SHA workflow as a controlled Production fallback.
assert.match(releaseWorkflow, /workflow_dispatch:/, 'manual Production release must require explicit workflow dispatch')
assert.match(releaseWorkflow, /expected_sha:/, 'manual Production release must require an approved SHA')
assert.match(releaseWorkflow, /git rev-parse origin\/main/, 'manual Production release must verify current main authority')
assert.match(releaseWorkflow, /vercel deploy --prod/, 'manual Production release must explicitly target Vercel Production')
assert.match(releaseWorkflow, /saduaksabuy\.com\/release\.json/, 'manual Production release must verify deployed provenance')
assert.doesNotMatch(releaseWorkflow, /^\s*push:\s*$/m, 'manual Production release workflow must not also trigger directly from Git push')

assert.match(generator, /VERCEL_GIT_COMMIT_SHA/, 'release metadata must capture Vercel provenance when present')
assert.match(generator, /GITHUB_SHA/, 'release metadata must capture GitHub provenance when present')
assert.match(generator, /path\.resolve\(process\.cwd\(\), 'dist'\)/, 'release metadata must be written into the deployed dist artifact')
assert.match(generator, /path\.join\(outputDir, 'release\.json'\)/, 'release metadata artifact must be named release.json')

console.log('Release Safety Foundation Contract: PASS')
