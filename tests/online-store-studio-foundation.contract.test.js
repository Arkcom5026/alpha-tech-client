import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(
  path.join(root, 'src/features/storeExperience/pages/StoreHomepageEditorPage.jsx'),
  'utf8'
);

const includes = (value, label) => assert.ok(page.includes(value), `${label} missing: ${value}`);

includes('Online Store Studio', 'studio identity');
includes('จัดการภาพลักษณ์และเนื้อหาหน้าร้าน', 'merchant-facing title');
includes('สื่อและแบนเนอร์', 'media workspace');
includes('เนื้อหาหน้าหลัก', 'homepage workspace');
includes('Alpha-Tech Platform Theme', 'platform theme authority');
includes("savePartnerStoreCapability(capabilityPayload(capability.storefrontEnabled))", 'safe live draft save');
includes("themePreset: 'platform-default'", 'platform-owned theme preset');
includes("layoutPreset: 'platform-default'", 'platform-owned layout preset');
includes('เผยแพร่การเปลี่ยนแปลง', 'live publish action');
includes('Desktop', 'preview contract placeholder');

assert.doesNotMatch(page, /<select[^>]*themePreset/, 'merchant must not receive theme selector');
assert.doesNotMatch(page, /type="color"/, 'merchant must not receive platform color controls');
assert.doesNotMatch(page, />brandPrimary</, 'technical theme tokens must not be exposed');
assert.doesNotMatch(page, /disabled=\{isPublished\}/, 'live storefront editing must not lock merchant content');

console.log('online store studio foundation contract: PASS');
