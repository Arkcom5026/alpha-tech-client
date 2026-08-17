const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const resolver = read('src/features/branch/documentHeader/documentHeaderConfig.js');
const settingsPage = read('src/features/settings/pages/ListBranchPage.jsx');
const workspace = read('src/features/branch/workspace/BranchListWorkspace.jsx');
const customerReceipt = read('src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx');

assert.match(resolver, /DEFAULT_DOCUMENT_HEADER_PROFILE/, 'shared document header defaults must exist');
assert.match(resolver, /documentHeaderConfig/, 'resolver must read store-scoped documentHeaderConfig');
assert.match(resolver, /config\?\.documents\?\.\[key\]/, 'resolver must support document-specific overrides');
assert.match(resolver, /buildStoreDocumentHeader/, 'shared print projection must exist');
assert.match(resolver, /profile\.showLogo \? logoUrl : null/, 'logo visibility must be honored');
assert.match(resolver, /profile\.showStoreName \? storeName : ''/, 'store-name visibility must be honored');

assert.match(settingsPage, /buildDocumentHeaderConfigFromForm/, 'branch settings must build the shared header payload');
assert.match(settingsPage, /documentHeaderConfig:/, 'branch settings must save documentHeaderConfig through branch authority');
assert.match(workspace, /รูปแบบหัวเอกสารของร้าน/, 'settings UI must expose document header customization');
assert.match(workspace, /headerLogoPosition/, 'settings UI must expose logo positioning');
assert.match(workspace, /headerTextAlign/, 'settings UI must expose header alignment');
assert.match(workspace, /headerShowTaxId/, 'settings UI must expose tax-id visibility');

assert.match(customerReceipt, /documentType: 'CUSTOMER_RECEIPT'/, 'customer receipt must use a document-specific header profile');
assert.match(customerReceipt, /store-document-header-logo-center/, 'customer receipt must render logo layout preferences');
assert.match(customerReceipt, /store-document-header-hide-address/, 'customer receipt must render field visibility preferences');
assert.match(customerReceipt, /--store-document-header-note/, 'customer receipt must render the optional header note');

console.log('Store Document Header Customization Contract: PASS');
