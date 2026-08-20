const assert = require('assert');
const fs = require('fs');
const path = require('path');

const apiPath = path.join(
  __dirname,
  '..',
  'src',
  'features',
  'tax',
  'intake',
  'api',
  'taxIntakeApi.js',
);

const source = fs.readFileSync(apiPath, 'utf8');
const saveStart = source.indexOf('const buildTaxIssuerProfileSavePayload');
const saveEnd = source.indexOf('export const getTaxIntakeErrorDetails');
assert.ok(saveStart >= 0 && saveEnd > saveStart, 'issuer profile save payload builder must exist');

const saveSection = source.slice(saveStart, saveEnd);

for (const field of [
  'branchId',
  'legalName',
  'taxId',
  'registeredAddress',
  'branchCode',
  'isHeadOffice',
  'shortTaxInvoicePrefix',
  'fullTaxInvoicePrefix',
  'creditNotePrefix',
  'status',
]) {
  assert.match(saveSection, new RegExp(`\\b${field}\\b`), `mutable field ${field} must be explicitly allowed`);
}

assert.doesNotMatch(saveSection, /\.\.\.profile\b/, 'server-owned issuer profile fields must never be spread into save payload');
assert.doesNotMatch(saveSection, /\bid\s*[,}:]/, 'immutable profile id must not be serialized by the save payload builder');
assert.match(saveSection, /buildTaxIssuerProfileSavePayload\(profile\)/, 'save API must pass through the whitelist builder');

console.log('Tax issuer profile save payload contract: PASS');
