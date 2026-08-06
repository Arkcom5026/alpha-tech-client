import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const media = read('src/features/storeExperience/components/StoreMediaPanel.jsx');
const sections = read('src/features/storeExperience/components/StoreHomepageSectionsPanel.jsx');
const preview = read('src/features/storeExperience/components/StorefrontPreview.jsx');
const patch = read('scripts/apply-store-experience-workspace-split.js');

assert.match(media, /const StoreMediaPanel/);
assert.match(sections, /onToggle/);
assert.match(sections, /sectionOptions/);
assert.match(preview, /enabledSections/);
assert.match(preview, /content\?\.hero/);
assert.match(preview, /onModeChange/);

for (const [label, source] of [['media', media], ['sections', sections], ['preview', preview]]) {
  assert.doesNotMatch(source, /apiClient|saveStoreExperienceDraft|publishStoreExperience|unpublishStoreExperience/, `${label} component must remain presentational`);
}

assert.match(patch, /partial workspace split detected/);
assert.match(patch, /workspace anchors are out of order/);
assert.match(patch, /legacy workspace JSX remains/);
assert.match(patch, /StoreMediaPanel/);
assert.match(patch, /StoreHomepageSectionsPanel/);
assert.match(patch, /StorefrontPreview/);

console.log('store experience workspace split contract: PASS');
