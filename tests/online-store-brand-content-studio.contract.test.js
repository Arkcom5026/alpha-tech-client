import fs from 'node:fs';
import assert from 'node:assert';

const page = fs.readFileSync('src/features/storeExperience/pages/StoreHomepageEditorPage.jsx', 'utf8');

assert.match(page, /PLATFORM_THEME_PRESET = 'platform-default'/, 'platform theme authority must be explicit');
assert.match(page, /PLATFORM_LAYOUT_PRESET = 'platform-default'/, 'platform layout authority must be explicit');
assert.doesNotMatch(page, /type="color"/, 'merchant studio must not expose theme-token editing');
assert.doesNotMatch(page, /<select[^>]*value=\{draft\.themePreset\}/, 'merchant studio must not expose theme preset selection');
assert.doesNotMatch(page, /<select[^>]*value=\{draft\.layoutPreset\}/, 'merchant studio must not expose layout preset selection');

for (const field of [
  'logoUrl',
  'coverImageUrl',
  'storeHeadline',
  'storeDescription',
  'heroImageUrl',
  'heroHeadline',
  'heroSupportingText',
  'promotionTitle',
  'promotionImageUrl',
  'promotionCtaLabel',
  'promotionCtaUrl',
]) {
  assert.match(page, new RegExp(field), `brand content field missing: ${field}`);
}

assert.match(page, /contentConfiguration: draft\.contentConfiguration/, 'draft payload must include merchant content configuration');
assert.match(page, /themePreset: PLATFORM_THEME_PRESET/, 'draft payload must preserve platform theme authority');
assert.match(page, /layoutPreset: PLATFORM_LAYOUT_PRESET/, 'draft payload must preserve platform layout authority');
assert.match(page, /ธีมหลักดูแลโดย Alpha-Tech Platform/, 'studio must explain locked platform theme authority');

console.log('online store brand content studio contract: PASS');
