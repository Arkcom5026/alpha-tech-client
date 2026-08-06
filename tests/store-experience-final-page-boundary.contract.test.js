import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');
const hook = read('src/features/storeExperience/hooks/useStoreExperienceStudio.js');
const workspace = read('src/features/storeExperience/components/StoreStudioWorkspace.jsx');

const pageLines = page.split(/\r?\n/).length;
assert.ok(pageLines <= 140, `StoreHomepageEditorPage must stay thin (<= 140 lines), received ${pageLines}`);

for (const value of [
  'useStoreExperienceStudio',
  '<StoreStudioHeader',
  '<StoreStudioNavigation',
  '<StoreStudioWorkspace',
]) {
  assert.ok(page.includes(value), `page composition missing: ${value}`);
}

for (const forbidden of [
  'getPartnerStoreCapability(',
  'getStoreExperienceDraft(',
  'savePartnerStoreCapability(',
  'saveStoreExperienceDraft(',
  'publishStoreExperience(',
  'unpublishStoreExperience(',
  'SECTION_OPTIONS.map(',
  'themeTokens:',
]) {
  assert.ok(!page.includes(forbidden), `thin page boundary violated by: ${forbidden}`);
}

for (const required of [
  'saveStoreExperienceDraft',
  'publishStoreExperience',
  'unpublishStoreExperience',
  'buildCapabilityPayload',
  'buildDraftPayload',
]) {
  assert.ok(hook.includes(required), `orchestration hook missing: ${required}`);
}

assert.ok(workspace.includes('StoreIdentityPanel'), 'workspace must compose identity panel');
assert.ok(workspace.includes('StoreMediaPanel'), 'workspace must compose media panel');
assert.ok(workspace.includes('StoreHomepageSectionsPanel'), 'workspace must compose homepage sections panel');
assert.ok(workspace.includes('StorefrontPreview'), 'workspace must compose storefront preview');
assert.ok(!workspace.includes('apiClient'), 'workspace must not call API directly');

console.log('store experience final page boundary contract: PASS');
