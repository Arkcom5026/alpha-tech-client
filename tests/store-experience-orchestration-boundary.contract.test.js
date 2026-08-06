import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const hook = read('src/features/storeExperience/hooks/useStoreExperienceStudio.js');
const script = read('scripts/apply-store-experience-orchestration-split.js');
const page = read('src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');

for (const token of [
  'getPartnerStoreCapability',
  'getStoreExperienceDraft',
  'savePartnerStoreCapability',
  'saveStoreExperienceDraft',
  'publishStoreExperience',
  'unpublishStoreExperience',
  'buildCapabilityPayload',
  'buildDraftPayload',
]) {
  assert.ok(hook.includes(token), `orchestration hook missing ${token}`);
}

for (const token of [
  'updateCapability',
  'updateContent',
  'toggleSection',
  'enabledSections',
  'hasDraftChanges',
]) {
  assert.ok(hook.includes(token), `studio state contract missing ${token}`);
}

assert.ok(hook.includes("buildCapabilityPayload(capability, capability.storefrontEnabled)"), 'save must preserve live capability state');
assert.ok(hook.includes("buildCapabilityPayload(capability, true)"), 'publish must explicitly enable storefront');
assert.ok(!hook.includes("status: 'DRAFT' }));\n    setState"), 'unpublish must not rewrite published snapshot lifecycle locally');

assert.ok(script.includes('orchestration split is partial'), 'partial split guard missing');
assert.ok(script.includes('business lifecycle remains in page'), 'page lifecycle leakage guard missing');
assert.ok(script.includes('useStoreExperienceStudio()'), 'hook integration missing');
assert.strictEqual((script.match(/writeFileSync\(/g) || []).length, 1, 'split script must write once');

assert.ok(!page.includes("../hooks/useStoreExperienceStudio") || page.includes('StoreHomepageEditorPage'), 'page source must remain valid before or after guarded patch');

console.log('store experience orchestration boundary contract: PASS');
