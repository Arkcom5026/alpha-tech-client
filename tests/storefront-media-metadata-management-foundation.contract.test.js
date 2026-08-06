import fs from 'node:fs';
import assert from 'node:assert';

const api = fs.readFileSync('src/features/storeExperience/api/storeExperienceApi.js', 'utf8');
const field = fs.readFileSync('src/features/storeExperience/components/StorefrontMediaUploadField.jsx', 'utf8');

assert.match(api, /params\.search\s*=\s*String\(search\)\.trim\(\)\.slice\(0, 120\)/, 'media search must be normalized and bounded before transport');
assert.match(api, /apiClient\.get\('\/store-experience\/media', \{ params \}\)/, 'metadata management must use branch-scoped server authority');
assert.doesNotMatch(api, /branchId/, 'client must not submit authoritative branch ownership');

assert.match(field, /USAGE_LABELS/, 'media management must render usage classification');
for (const usage of ['DRAFT', 'PUBLISHED', 'DRAFT_AND_PUBLISHED', 'UNUSED']) {
  assert.match(field, new RegExp(usage), `usage label missing: ${usage}`);
}
assert.match(field, /formatBytes\(asset\.bytes\)/, 'asset bytes must be human readable');
assert.match(field, /formatCreatedAt\(asset\.createdAt\)/, 'asset created time must be visible');
assert.match(field, /asset\.provider/, 'provider metadata must be visible');
assert.match(field, /asset\.publicId/, 'public id metadata must be visible');
assert.match(field, /maxLength=\{120\}/, 'search field must enforce the server search bound');
assert.match(field, /search:\s*searchValue/, 'search query must be forwarded to listing authority');
assert.match(field, /จัดการคลัง/, 'merchant must be able to open the media management experience');
assert.match(field, /ใช้ในแบบร่าง/, 'merchant must be able to reuse an asset in draft');
assert.match(field, /disabled title="ยังไม่เปิดสิทธิ์ลบใน Foundation นี้"/, 'destructive action must remain explicitly disabled');
assert.doesNotMatch(field, /destroy|deleteStorefrontMedia|apiClient\.delete/, 'client must not expose destructive provider authority');

console.log('storefront media metadata management foundation contract: PASS');
