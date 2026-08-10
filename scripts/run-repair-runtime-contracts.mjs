import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const testsDir = path.join(root, 'tests');
const files = fs.readdirSync(testsDir)
  .filter((name) => /^repair-.*\.contract\.test\.js$/.test(name))
  .sort()
  .map((name) => path.join('tests', name));

if (!files.length) {
  console.error('[repair-runtime] no repair contract tests found');
  process.exit(1);
}

const vitest = path.join(root, 'node_modules', 'vitest', 'vitest.mjs');
if (!fs.existsSync(vitest)) {
  console.error('[repair-runtime] vitest is not installed; run npm install first');
  process.exit(1);
}

console.log(`[repair-runtime] running ${files.length} client repair contracts`);
const result = spawnSync(process.execPath, [vitest, 'run', ...files], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
