import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Input Tax Step 10B maps backend error codes to Thai actionable messages', () => {
  const source = read('src/features/tax/contracts/inputTaxErrorMessages.js');
  [
    'INPUT_TAX_FILING_RECONCILIATION_REQUIRED',
    'INPUT_TAX_FILING_VAT_AUTHORITY_REQUIRED',
    'INPUT_TAX_FILING_VAT_AUTHORITY_CONFLICT',
    'INPUT_TAX_DOCUMENT_ALREADY_IN_FILING',
    'INPUT_TAX_STALE_VERSION',
    'INPUT_TAX_REASON_REQUIRED',
    'INPUT_TAX_REPORT_RANGE_TOO_LARGE',
    'INPUT_TAX_REPORT_RESULT_TOO_LARGE',
    'TAX_PERIOD_STALE_VERSION',
    'TAX_PERIOD_INPUT_FILING_INCOMPLETE',
    'TAX_PERIOD_INPUT_FILING_NOT_SUBMITTED',
  ].forEach((code) => assert.match(source, new RegExp(code)));
  assert.match(source, /getInputTaxErrorMessage/);
  assert.match(source, /error\?\.response\?\.data\?\.code/);
});

test('Input VAT report does not render backend English error text as authority', () => {
  const page = read('src/features/tax/inputVatReport/pages/InputVatReportPage.jsx');
  assert.match(page, /getInputTaxErrorMessage/);
  assert.doesNotMatch(page, /err\?\.response\?\.data\?\.message/);
});

test('frontend mapping does not recreate VAT calculation policy', () => {
  const source = read('src/features/tax/contracts/inputTaxErrorMessages.js');
  assert.doesNotMatch(source, /vat\s*[=*]\s*0\.07/i);
  assert.doesNotMatch(source, /\*\s*7\s*\/\s*100/);
});
