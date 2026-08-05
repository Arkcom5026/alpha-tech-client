import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const header = read('src/features/storeExperience/components/StoreStudioHeader.jsx');
const navigation = read('src/features/storeExperience/components/StoreStudioNavigation.jsx');
const identity = read('src/features/storeExperience/components/StoreIdentityPanel.jsx');

assert.match(header, /onPreview/);
assert.match(header, /onSave/);
assert.match(header, /onPublish/);
assert.doesNotMatch(header, /savePartnerStoreCapability|saveStoreExperienceDraft|publishStoreExperience/);

assert.match(navigation, /onSelectPanel/);
assert.match(navigation, /onUnpublish/);
assert.doesNotMatch(navigation, /unpublishStoreExperience|apiClient/);

assert.match(identity, /onCapabilityChange/);
assert.match(identity, /onIdentityChange/);
assert.match(identity, /onHeroChange/);
assert.match(identity, /identity\.tagline/);
assert.match(identity, /hero\.title/);
assert.doesNotMatch(identity, /themePreset|themeTokens|brandPrimary|apiClient/);

console.log('store experience component boundaries contract: PASS');
