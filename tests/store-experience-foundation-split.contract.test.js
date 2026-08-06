import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const defaults = read('src/features/storeExperience/constants/storeExperienceDefaults.js');
const payloads = read('src/features/storeExperience/utils/storeExperiencePayloads.js');
const patch = read('scripts/apply-store-experience-foundation-split.js');

for (const marker of ['SECTION_OPTIONS', 'DEFAULT_CAPABILITY', 'PLATFORM_THEME_TOKENS', 'DEFAULT_CONTENT_CONFIGURATION', 'createDefaultDraft']) {
  assert.ok(defaults.includes(marker), `defaults contract missing: ${marker}`);
}
for (const marker of ['buildCapabilityPayload', 'buildDraftPayload', 'contentConfiguration']) {
  assert.ok(payloads.includes(marker), `payload contract missing: ${marker}`);
}
for (const marker of ['partial store experience foundation split detected', 'foundation split anchor missing', 'already applied']) {
  assert.ok(patch.includes(marker), `safe split guard missing: ${marker}`);
}
assert.doesNotMatch(payloads, /storefrontEnabled:\s*false/, 'payload builder must not silently close a live storefront');
assert.doesNotMatch(defaults, /themePreset:\s*['"](?!platform-default)/, 'merchant defaults must keep platform theme authority');

console.log('store experience foundation split contract: PASS');
