import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const script = read('scripts/retire-store-experience-migration-helpers.js');

for (const required of [
  'useStoreExperienceStudio',
  '<StoreStudioHeader',
  '<StoreStudioNavigation',
  '<StoreStudioWorkspace',
  'pageLines > 140',
  'fs.unlinkSync',
  'already retired',
]) {
  assert.ok(script.includes(required), `retirement guard missing: ${required}`);
}

for (const helper of [
  'apply-store-experience-foundation-split.js',
  'apply-store-identity-content-editor.js',
  'apply-store-experience-component-integration.js',
  'apply-store-experience-workspace-split.js',
  'apply-store-experience-orchestration-split.js',
  'apply-store-experience-workspace-composer.js',
]) {
  assert.ok(script.includes(helper), `retirement manifest missing: ${helper}`);
}

assert.ok(!script.includes('rm -rf'), 'retirement must not use recursive deletion');
assert.ok(!script.includes("fs.rmSync(path.join(root, 'scripts')"), 'retirement must not delete the scripts directory');
assert.ok(!script.includes("fs.rmdirSync(path.join(root, 'scripts')"), 'retirement must not remove the scripts directory');

console.log('store experience migration helper retirement contract: PASS');
