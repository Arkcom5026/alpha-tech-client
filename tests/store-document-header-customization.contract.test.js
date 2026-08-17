import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const resolver = read('src/features/branch/documentHeader/documentHeaderConfig.js');
const scope = read('src/features/branch/documentHeader/StoreDocumentHeaderScope.jsx');
const documentFormatPage = read('src/features/settings/pages/DocumentFormatSettingsPage.jsx');
const branchSettingsPage = read('src/features/settings/pages/ListBranchPage.jsx');
const sidebar = read('src/config/sidebarSettingsItems.js');
const settingsDashboard = read('src/features/settings/workspaces/SettingsDashboardWorkspace.jsx');
const routes = read('src/routes/partner/posPartnerRoutes.jsx');
const customerReceiptLayout = read('src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx');
const fullTaxPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const mediaApi = read('src/features/storeExperience/api/storeExperienceApi.js');
const mediaField = read('src/features/storeExperience/components/StorefrontMediaUploadField.jsx');

assert.match(resolver, /DEFAULT_DOCUMENT_HEADER_PROFILE/, 'shared document header defaults must exist');
assert.match(resolver, /documentHeaderConfig/, 'resolver must read store-scoped documentHeaderConfig');
assert.match(resolver, /config\?\.documents\?\.\[key\]/, 'resolver must support document-specific overrides');
assert.match(resolver, /buildStoreDocumentHeader/, 'shared print projection must exist');
assert.match(resolver, /buildDocumentHeaderConfigFromForm/, 'settings payload builder must exist');
assert.match(resolver, /DOCUMENT_LOGO_SIZE_MIN = 24/, 'client logo size must have a safe lower bound');
assert.match(resolver, /DOCUMENT_LOGO_SIZE_MAX = 120/, 'client logo size must have a safe upper bound');
assert.match(resolver, /DOCUMENT_LOGO_SIZE_DEFAULT = 56/, 'client logo size must default to 56px');
assert.match(resolver, /LEGACY_LOGO_SIZE_PIXELS/, 'legacy logo size presets must remain supported');
assert.match(resolver, /sm: 40, md: 56, lg: 72, xl: 88/, 'legacy presets must preserve their original pixel sizes');
assert.match(resolver, /headerLogoSize: normalizeLogoSize\(profile\.logoSize\)/, 'settings projection must expose normalized pixel sizing');

assert.match(routes, /path: 'document-format'/, 'document format must have a dedicated settings route');
assert.match(routes, /path: 'tax-issuer'/, 'tax issuer settings must remain a separate route');
assert.match(sidebar, /label: 'รูปแบบเอกสาร'/, 'settings sidebar must expose document format');
assert.match(sidebar, /settings\/document-format/, 'document format sidebar item must target the dedicated route');
assert.match(settingsDashboard, /title="รูปแบบเอกสาร"/, 'settings dashboard must expose a document format tile');

assert.match(documentFormatPage, /employee\?\.branchId/, 'document format page must derive tenant authority from the authenticated employee');
assert.match(documentFormatPage, /updateBranch\(branchId, \{ documentHeaderConfig \}\)/, 'document format page must persist only the store-scoped document header config');
assert.match(documentFormatPage, /รูปแบบเอกสาร/, 'document format page must be clearly named');
assert.match(documentFormatPage, /ไม่เปลี่ยนข้อมูลทางกฎหมาย/, 'document format page must distinguish presentation from legal tax identity');
assert.doesNotMatch(documentFormatPage, /headerShowBranchLabel/, 'branch legal label must not be exposed as a visual toggle before renderer support');
assert.doesNotMatch(branchSettingsPage, /documentHeaderConfig/, 'branch profile settings must not duplicate document-format persistence');

assert.match(documentFormatPage, /StorefrontMediaUploadField/, 'document format page must reuse the canonical store media picker');
assert.match(documentFormatPage, /purpose="STORE_LOGO"/, 'document logos must use the existing store-logo media purpose');
assert.match(documentFormatPage, /upload=\{uploadStorefrontMedia\}/, 'document logo selection must use the authenticated media upload pipeline');
assert.match(documentFormatPage, /setValue\('headerLogoUrl', url/, 'uploaded logo URL must populate the document header form automatically');
assert.match(documentFormatPage, /setValue\('headerShowLogo', true/, 'selecting a logo must enable document logo rendering');
assert.match(documentFormatPage, /type="number"/, 'document format page must expose custom numeric logo sizing');
assert.match(documentFormatPage, /min=\{DOCUMENT_LOGO_SIZE_MIN\}/, 'custom logo input must expose the lower bound');
assert.match(documentFormatPage, /max=\{DOCUMENT_LOGO_SIZE_MAX\}/, 'custom logo input must expose the upper bound');
assert.match(documentFormatPage, /คืนค่ามาตรฐาน 56 px/, 'document format page must provide a one-click standard reset');
assert.match(mediaApi, /\/store-experience\/media\/upload/, 'canonical store media upload endpoint must remain available');
assert.match(mediaField, /type="file"/, 'canonical media field must support local file selection');
assert.match(mediaField, /เลือกจากคลัง/, 'canonical media field must support selecting an existing store asset');

assert.match(scope, /--store-document-header-logo-size/, 'shared A4 scope must pass custom logo size through a CSS variable');
assert.match(scope, /width: var\(--store-document-header-logo-size\) !important/, 'A4 logo width must use the custom pixel size');
assert.match(scope, /height: var\(--store-document-header-logo-size\) !important/, 'A4 logo height must use the custom pixel size');
assert.match(scope, /Math\.min\(120, Math\.max\(24/, 'A4 renderer must clamp custom logo size defensively');
assert.match(scope, /store-document-header-logo-center/, 'shared A4 scope must support logo positioning');
assert.match(scope, /store-document-header-hide-address/, 'shared A4 scope must support field visibility');
assert.match(scope, /--store-document-header-note/, 'shared A4 scope must render the optional header note');
assert.match(customerReceiptLayout, /buildStoreDocumentHeader/, 'customer receipt A4 layout must use the shared document header resolver');
assert.match(customerReceiptLayout, /StoreDocumentHeaderScope/, 'customer receipt A4 layout must use the shared visual scope');
assert.match(fullTaxPage, /buildStoreDocumentHeader/, 'full tax invoice A4 page must use the shared document header resolver');
assert.match(fullTaxPage, /StoreDocumentHeaderScope/, 'full tax invoice A4 page must use the shared visual scope');

console.log('Store Document Header Customization Contract: PASS');
