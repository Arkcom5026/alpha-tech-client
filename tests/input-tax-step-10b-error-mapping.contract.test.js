'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Input Tax Step 10B frontend handoff contract', () => {
  test('maps backend error codes to Thai actionable messages', () => {
    const source = read('src/features/tax/contracts/inputTaxErrorMessages.js');
    [
      'INPUT_TAX_FILING_RECONCILIATION_REQUIRED',
      'INPUT_TAX_DOCUMENT_ALREADY_IN_FILING',
      'INPUT_TAX_STALE_VERSION',
      'INPUT_TAX_REASON_REQUIRED',
      'INPUT_TAX_REPORT_RANGE_TOO_LARGE',
      'INPUT_TAX_REPORT_RESULT_TOO_LARGE',
      'TAX_PERIOD_STALE_VERSION',
    ].forEach((code) => expect(source).toContain(code));
    expect(source).toContain('getInputTaxErrorMessage');
    expect(source).toContain("error?.response?.data?.code");
  });

  test('Input VAT report does not render backend English error text as authority', () => {
    const page = read('src/features/tax/inputVatReport/pages/InputVatReportPage.jsx');
    expect(page).toContain('getInputTaxErrorMessage');
    expect(page).not.toContain('err?.response?.data?.message');
  });

  test('frontend mapping does not recreate VAT calculation policy', () => {
    const source = read('src/features/tax/contracts/inputTaxErrorMessages.js');
    expect(source).not.toMatch(/vat\s*[=*]\s*0\.07/i);
    expect(source).not.toMatch(/\*\s*7\s*\/\s*100/);
  });
});
