import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const api = fs.readFileSync(
  path.join(root, 'src/features/storeExperience/api/storeExperienceApi.js'),
  'utf8'
);
const page = fs.readFileSync(
  path.join(root, 'src/features/storeExperience/pages/StoreHomepageEditorPage.jsx'),
  'utf8'
);

assert.match(
  api,
  /apiClient\.put\('\/partner-store\/capability', payload\)/,
  'capability API must forward the caller-owned storefrontEnabled state'
);
assert.doesNotMatch(
  api,
  /storefrontEnabled:\s*false/,
  'capability API must not silently unpublish the storefront'
);
assert.ok(
  page.includes('capabilityPayload(capability.storefrontEnabled)'),
  'draft save must preserve the current public storefront state'
);
assert.ok(
  page.includes('capabilityPayload(true)'),
  'publish must explicitly enable the public storefront'
);

console.log('storefront live capability preservation contract: PASS');
