import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const script = read('scripts/apply-store-experience-component-integration.js');
const header = read('src/features/storeExperience/components/StoreStudioHeader.jsx');
const navigation = read('src/features/storeExperience/components/StoreStudioNavigation.jsx');
const identity = read('src/features/storeExperience/components/StoreIdentityPanel.jsx');

for (const value of [
  "StoreStudioHeader from '../components/StoreStudioHeader'",
  "StoreStudioNavigation from '../components/StoreStudioNavigation'",
  "StoreIdentityPanel from '../components/StoreIdentityPanel'",
  'partial integration detected',
  'header block anchors missing',
  'navigation block anchors missing',
  'identity block anchors missing',
  'legacy JSX remained after integration',
]) assert.ok(script.includes(value), `integration guard missing: ${value}`);

assert.ok(script.includes('<StoreStudioHeader'), 'header integration missing');
assert.ok(script.includes('<StoreStudioNavigation'), 'navigation integration missing');
assert.ok(script.includes('<StoreIdentityPanel'), 'identity integration missing');
assert.ok(script.includes('onContentChange={(contentConfiguration)'), 'content callback integration missing');
assert.strictEqual((script.match(/writeFileSync\(/g) || []).length, 1, 'integration script must write exactly once');

for (const [name, source] of [['header', header], ['navigation', navigation], ['identity', identity]]) {
  assert.doesNotMatch(source, /apiClient|saveStoreExperienceDraft|publishStoreExperience|unpublishStoreExperience/, `${name} component must remain presentational`);
}

console.log('store experience component integration contract: PASS');
