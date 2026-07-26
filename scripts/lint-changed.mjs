import { execFileSync, spawnSync } from 'node:child_process'
import path from 'node:path'

const LINTABLE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs'])
const DEFAULT_BASE_REF = process.env.ALDE_LINT_BASE_REF || 'origin/main'

function runGit(args, options = {}) {
  return execFileSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function refExists(ref) {
  try {
    runGit(['rev-parse', '--verify', '--quiet', ref])
    return true
  } catch {
    return false
  }
}

function resolveComparisonBase() {
  if (refExists(DEFAULT_BASE_REF)) {
    return runGit(['merge-base', 'HEAD', DEFAULT_BASE_REF])
  }

  if (refExists('HEAD^')) {
    return 'HEAD^'
  }

  return null
}

function collectChangedFiles(base) {
  const files = new Set()

  if (base) {
    const committed = runGit([
      'diff',
      '--name-only',
      '--diff-filter=ACMR',
      `${base}...HEAD`,
    ])

    for (const file of committed.split(/\r?\n/u)) {
      if (file) files.add(file)
    }
  }

  const workingTree = runGit([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    'HEAD',
  ])

  for (const file of workingTree.split(/\r?\n/u)) {
    if (file) files.add(file)
  }

  const untracked = runGit(['ls-files', '--others', '--exclude-standard'])
  for (const file of untracked.split(/\r?\n/u)) {
    if (file) files.add(file)
  }

  return [...files]
    .filter((file) => LINTABLE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()
}

const base = resolveComparisonBase()
const files = collectChangedFiles(base)

console.log(`[lint-ratchet] base=${base ?? 'none'} ref=${DEFAULT_BASE_REF}`)

if (files.length === 0) {
  console.log('[lint-ratchet] No changed JavaScript files. PASS')
  process.exit(0)
}

console.log(`[lint-ratchet] Checking ${files.length} changed file(s):`)
for (const file of files) {
  console.log(`  - ${file}`)
}

const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(executable, ['eslint', '--max-warnings=0', ...files], {
  cwd: process.cwd(),
  encoding: 'utf8',
  stdio: 'inherit',
})

if (result.error) {
  console.error(`[lint-ratchet] Unable to start ESLint: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
