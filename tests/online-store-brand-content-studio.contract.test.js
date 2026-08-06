import fs from 'node:fs';
import assert from 'node:assert';

const page = fs.readFileSync('src/features/storeExperience/pages/StoreHomepageEditorPage.jsx', 'utf8');
const api = fs.readFileSync('src/features/storeExperience/api/storeExperienceApi.js', 'utf8');
const uploadField = fs.readFileSync('src/features/storeExperience/components/StorefrontMediaUploadField.jsx', 'utf8');
const publicPage = fs.readFileSync('src/features/storefront/pages/PublicStorefrontPage.jsx', 'utf8');

assert.match(page, /PLATFORM_THEME_PRESET = 'platform-default'/, 'platform theme authority must be explicit');
assert.match(page, /PLATFORM_LAYOUT_PRESET = 'platform-default'/, 'platform layout authority must be explicit');
assert.match(page, /type="color"[^>]*aria-label="สีหลักของร้าน"/, 'merchant studio must expose the governed primary brand color');
assert.match(page, /type="color"[^>]*aria-label="สีเน้นของร้าน"/, 'merchant studio must expose the governed accent brand color');
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

for (const purpose of ['STORE_LOGO', 'STORE_COVER', 'STORE_HERO', 'STORE_PROMOTION']) {
  assert.match(page, new RegExp(`purpose="${purpose}"`), `storefront media upload purpose missing: ${purpose}`);
}
assert.match(page, /upload=\{uploadStorefrontMedia\}/, 'media fields must use the authenticated upload authority');
assert.match(api, /apiClient\.post\('\/store-experience\/media\/upload', formData, \{/, 'client must call the branch-scoped storefront media endpoint');
assert.match(api, /headers:\s*\{\s*'Content-Type':\s*'multipart\/form-data'\s*\}/, 'storefront upload must preserve the multipart boundary contract');
assert.match(api, /formData\.append\('file', file\)/, 'upload request must send the selected file');
assert.match(api, /formData\.append\('purpose', purpose\)/, 'upload request must send only the media purpose');
assert.doesNotMatch(api, /branchId/, 'client media APIs must not submit authoritative branch ownership');
assert.match(api, /apiClient\.get\('\/store-experience\/media', \{ params \}\)/, 'client must call the branch-scoped media library endpoint');
assert.match(api, /if \(purpose\) params\.purpose = purpose/, 'media library must filter by the current slot purpose');
assert.match(api, /if \(nextCursor\) params\.nextCursor = nextCursor/, 'media library must support bounded cursor pagination');
assert.match(uploadField, /MAX_FILE_SIZE_BYTES = 5 \* 1024 \* 1024/, 'client must enforce the 5 MB storefront media limit');
assert.match(uploadField, /startsWith\('image\/'\)/, 'client must reject non-image files before upload');
assert.match(uploadField, /result\?\.secureUrl/, 'upload field must bind the normalized secure URL');
assert.match(uploadField, /เลือกจากคลัง/, 'media field must expose the store media library');
assert.match(uploadField, /listStorefrontMedia\(\{ purpose, pageSize: 24, nextCursor: cursor \}\)/, 'library requests must stay purpose scoped');
assert.match(uploadField, /onUploaded\(asset\.secureUrl, asset\)/, 'selecting an existing asset must update only the draft field');
assert.match(uploadField, /ยังไม่มีภาพประเภทนี้ในคลัง/, 'media library must have an empty state');
assert.match(uploadField, /โหลดคลังรูปภาพไม่สำเร็จ/, 'media library must have an error state');
assert.match(uploadField, /ลองใหม่/, 'media library must have a retry action');
assert.match(uploadField, /โหลดเพิ่มเติม/, 'media library must expose cursor pagination');
assert.doesNotMatch(uploadField, /delete|destroy/i, 'media library foundation must not expose destructive authority');

assert.match(page, /contentConfiguration: draft\.contentConfiguration/, 'draft payload must include merchant content configuration');
assert.match(page, /themePreset: PLATFORM_THEME_PRESET/, 'draft payload must preserve platform theme authority');
assert.match(page, /layoutPreset: PLATFORM_LAYOUT_PRESET/, 'draft payload must preserve platform layout authority');
assert.match(page, /brandPrimary: tokens\.brandPrimary/, 'draft payload must preserve the merchant primary brand token');
assert.match(page, /brandAccent: tokens\.brandAccent/, 'draft payload must preserve the merchant accent brand token');
assert.match(page, /surface: PLATFORM_TOKENS\.surface/, 'surface token must remain under platform authority');
assert.match(page, /text: PLATFORM_TOKENS\.text/, 'text token must remain under platform authority');
assert.match(page, /แพลตฟอร์มควบคุมโครงสร้าง ร้านเลือกสีแบรนด์/, 'studio must explain governed merchant color authority');
assert.match(page, /style=\{\{ background: tokens\.brandPrimary \}\}/, 'editor preview header must use the draft primary token');
assert.match(page, /style=\{\{ background: tokens\.brandAccent \}\}/, 'editor preview hero must use the draft accent token');

assert.doesNotMatch(page, /disabled=\{isPublished\}/, 'published stores must remain editable as draft');
assert.match(
  page,
  /savePartnerStoreCapability\(capabilityPayload\(capability\.storefrontEnabled\)\)/,
  'saving a live-store draft must preserve public storefront availability'
);
assert.match(
  api,
  /apiClient\.put\('\/partner-store\/capability', payload\)/,
  'capability API must forward the caller-provided storefrontEnabled value'
);
assert.doesNotMatch(
  api,
  /storefrontEnabled:\s*false/,
  'capability API must not force-disable the public storefront on every save'
);
assert.match(page, /บันทึกแบบร่าง/, 'save draft action must remain available');
assert.match(page, /เผยแพร่การเปลี่ยนแปลง/, 'live stores must expose an explicit republish action');
assert.match(
  page,
  /หน้าร้านสาธารณะยังใช้ฉบับที่เผยแพร่อยู่/,
  'live draft save must explain published snapshot isolation'
);

assert.match(
  publicPage,
  /const content = experience\.contentConfiguration \|\| \{\}/,
  'public storefront must read published contentConfiguration'
);
assert.match(
  publicPage,
  /content\.heroHeadline \|\| DEFAULT_CONTENT\.heroHeadline/,
  'public hero headline must bind to the published snapshot with a legacy fallback'
);
assert.match(
  publicPage,
  /content\.heroSupportingText \|\| DEFAULT_CONTENT\.heroSupportingText/,
  'public hero supporting text must bind to the published snapshot with a legacy fallback'
);
assert.match(publicPage, /content\.storeHeadline \|\| storefront\.name/, 'public header must bind merchant store headline');
assert.match(publicPage, /content\.logoUrl/, 'public header must support the published logo URL');
assert.match(publicPage, /content\.coverImageUrl/, 'public storefront must support the published cover image URL');
assert.match(publicPage, /content\.heroImageUrl/, 'public hero must support the published hero image URL');

assert.match(publicPage, /const PromotionBanner = \(\{ content, tokens \}\)/, 'public storefront must own a published promotion renderer');
assert.match(publicPage, /content\.promotionTitle/, 'public promotion must bind the published title');
assert.match(publicPage, /content\.promotionImageUrl/, 'public promotion must bind the published image');
assert.match(publicPage, /content\.promotionCtaLabel && content\.promotionCtaUrl/, 'public promotion CTA requires both label and destination');
assert.match(publicPage, /<PromotionBanner content=\{content\} tokens=\{tokens\} \/>/, 'public page must render the promotion banner');
assert.match(publicPage, /style=\{\{ background: tokens\.brandPrimary \}\}/, 'public actions and identity areas must follow the published primary brand token');
assert.match(publicPage, /style=\{\{ background: tokens\.brandAccent, color: tokens\.text \}\}/, 'public promotion CTA must follow the published accent token');

console.log('online store brand content studio contract: PASS');
