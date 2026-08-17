const assert = require('assert');
const fs = require('fs');
const path = require('path');

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

assert.match(resolver, /DEFAULT_DOCUMENT_HEADER_PROFILE/, 'shared document header defaults must exist');
assert.match(resolver, /documentHeaderConfig/, 'resolver must read store-scoped documentHeaderConfig');
assert.match(resolver, /config\?\.documents\?\.\[key\]/, 'resolver must support document-specific overrides');
assert.match(resolver, /buildStoreDocumentHeader/, 'shared print projection must exist');
assert.match(resolver, /buildDocumentHeaderConfigFromForm/, 'settings payload builder must exist');

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

assert.match(scope, /store-document-header-logo-center/, 'shared A4 scope must support logo positioning');
assert.match(scope, /store-document-header-hide-address/, 'shared A4 scope must support field visibility');
assert.match(scope, /--store-document-header-note/, 'shared A4 scope must render the optional header note');
assert.match(customerReceiptLayout, /buildStoreDocumentHeader/, 'customer receipt A4 layout must use the shared document header resolver');
assert.match(customerReceiptLayout, /StoreDocumentHeaderScope/, 'customer receipt A4 layout must use the shared visual scope');
assert.match(fullTaxPage, /buildStoreDocumentHeader/, 'full tax invoice A4 page must use the shared document header resolver');
assert.match(fullTaxPage, /StoreDocumentHeaderScope/, 'full tax invoice A4 page must use the shared visual scope');

console.log('Store Document Header Customization Contract: PASS');
