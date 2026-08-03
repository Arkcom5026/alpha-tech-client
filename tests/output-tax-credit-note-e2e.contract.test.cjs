const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const returnPage = read('src/features/sales/return/pages/CreateReturnPage.jsx');
const printPage = read('src/features/sales/return/pages/PrintCreditNotePage.jsx');
const api = read('src/features/sales/return/api/saleReturnApi.js');
const routes = read('src/routes/partner/salesRoutes.jsx');
const browserE2E = read('e2e/output-tax-credit-note-full-return.spec.js');

assert.match(api, /issueCreditNoteForSaleReturn/);
assert.match(api, /\/tax\/credit-notes\/from-sale-return\//);
assert.match(api, /getPrintableCreditNote/);
assert.doesNotMatch(returnPage, /eligibility\.sale\?\.isTaxInvoice === true/);
assert.match(returnPage, /fullRefundReturn/);
assert.match(returnPage, /TAX_CREDIT_NOTE_ORIGINAL_DOCUMENT_NOT_FOUND/);
assert.match(returnPage, /issueCreditNoteForSaleReturn/);
assert.match(returnPage, /credit-note\/print/);
assert.match(printPage, /ใบลดหนี้/);
assert.match(printPage, /window\.print\(\)/);
assert.match(printPage, /originalInvoice/);
assert.match(routes, /credit-note\/print\/:taxDocumentId/);
assert.match(browserE2E, /No request interception/);
assert.match(browserE2E, /candidates\/register-sale/);
assert.match(browserE2E, /taxInvoiceKind: 'FULL'/);
assert.match(browserE2E, /sale-return\/create/);
assert.match(browserE2E, /credit-notes\/from-sale-return/);
assert.match(browserE2E, /ใบลดหนี้/);

console.log('Output tax credit-note client E2E contract: PASS');
