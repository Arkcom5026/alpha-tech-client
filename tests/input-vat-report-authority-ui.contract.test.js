const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('input tax report route mounts the Input VAT authority page', () => {
  const source = read('src/routes/partner/posPartnerRoutes.jsx');
  assert.match(source, /import InputVatReportPage from '@\/features\/tax\/inputVatReport\/pages\/InputVatReportPage';/);
  assert.match(source, /path: 'inputtax', element: <InputVatReportPage \/>/);
  assert.doesNotMatch(source, /path: 'inputtax', element: <TempReportPage/);
});

test('input vat report api reads the server authority endpoint', () => {
  const source = read('src/features/tax/inputVatReport/api/inputVatReportApi.js');
  assert.match(source, /apiClient\.get\('\/input-tax-reports'/);
  assert.match(source, /month: Number\(month\)/);
  assert.match(source, /year: Number\(year\)/);
});

test('input vat report page exposes InputVatRecord authority rows and totals', () => {
  const source = read('src/features/tax/inputVatReport/pages/InputVatReportPage.jsx');
  assert.match(source, /INPUT_VAT_RECORD/);
  assert.match(source, /summary\.vatAmount/);
  assert.match(source, /supplierTaxInvoiceNumber/);
  assert.match(source, /row\.authority/);
  assert.match(source, /getInputVatReport\(\{ month, year \}\)/);
});
