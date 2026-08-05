import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const workspace = read('src/features/storeExperience/components/StoreStudioWorkspace.jsx');
const script = read('scripts/apply-store-experience-workspace-composer.js');

for (const component of [
  'StoreIdentityPanel',
  'StoreMediaPanel',
  'StoreHomepageSectionsPanel',
  'StorefrontPreview',
]) {
  assert.ok(workspace.includes(component), `workspace composer missing ${component}`);
}

assert.doesNotMatch(workspace, /apiClient|saveStoreExperienceDraft|publishStoreExperience|unpublishStoreExperience/, 'workspace composer must remain presentational');
assert.ok(workspace.includes('onCapabilityChange'), 'capability callback contract missing');
assert.ok(workspace.includes('onIdentityChange'), 'identity callback contract missing');
assert.ok(workspace.includes('onHeroChange'), 'hero callback contract missing');
assert.ok(workspace.includes('onToggleSection'), 'section callback contract missing');
assert.ok(workspace.includes('onPreviewModeChange'), 'preview mode callback contract missing');

assert.ok(script.includes('partial state detected'), 'composer migration requires partial-state guard');
assert.ok(script.includes('already applied'), 'composer migration must be idempotent');
assert.ok(script.includes('must render exactly once'), 'composer migration requires duplicate-render guard');
assert.ok(script.includes('legacy workspace wrapper remains'), 'composer migration requires legacy-wrapper guard');

console.log('store experience page composition contract: PASS');
