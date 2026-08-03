const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const returnPage = fs.readFileSync(
  path.join(root, 'src/features/sales/return/pages/CreateReturnPage.jsx'),
  'utf8',
);
const printPage = fs.readFileSync(
  path.join(root, 'src/features/sales/return/pages/PrintCreditNotePage.jsx'),
  'utf8',
);
const api = fs.readFileSync(
  path.join(root, 'src/features/sales/return/api/saleReturnApi.js'),
  'utf8',
);
const browserE2E = fs.readFileSync(\n  path.join(root, 'e2e/output-tax-credit-note-full-return.spec.js'),\n  'utf8',\n);\nconst routes = fs.readFileSync(
  path.join(root, 'src/routes/partner/salesRoutes.jsx'),
  'utf8',
);

assert.match(api, /issueCreditNoteForSaleReturn/);
assert.match(api, /\/tax\/credit-notes\/from-sale-return\//);
assert.match(api, /getPrintableCreditNote/);
assert.match(returnPage, /eligibility\.sale\?\.isTaxInvoice === true/);
assert.match(returnPage, /issueCreditNoteForSaleReturn/);
assert.match(returnPage, /credit-note\/print/);
assert.match(printPage, /ใบลดหนี้/);
assert.match(printPage, /window\.print\(\)/);
assert.match(printPage, /originalInvoice/);
assert.match(routes, /credit-note\/print\/:taxDocumentId/);

console.log('Output tax credit-note client E2E contract: PASS');
