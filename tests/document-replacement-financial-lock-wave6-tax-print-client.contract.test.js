import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx');
const api = read('src/features/tax/intake/api/taxIntakeApi.js');

assert.match(api, /getOutputTaxPrintable/);
assert.match(api, /documents\/\$\{requirePositiveId\(taxDocumentId, 'taxDocumentId'\)\}\/printable/);

assert.match(page, /const TaxReplacementNotice/);
assert.match(page, /data\.replacementProjection/);
assert.match(page, /กำลังแสดงรายการเอกสารฉบับทดแทน/);
assert.match(page, /ยอดก่อนภาษี ภาษีมูลค่าเพิ่ม ยอดรวม ชนิดใบกำกับ เลขที่เอกสาร และรอบภาษี/);
assert.match(page, /print:hidden/);
assert.match(page, /unit: line\.unitName \|\| 'ชิ้น'/);

assert.match(page, /totalAmount: data\.document\.totalAmount/);
assert.match(page, /vat: data\.document\.taxAmount/);
assert.match(page, /code: data\.document\.number/);
assert.match(page, /amount: data\.document\.totalAmount/);
assert.doesNotMatch(page, /replacementProjection\?\.totalAmount/);
assert.doesNotMatch(page, /replacementProjection\?\.taxAmount/);
assert.doesNotMatch(page, /replacementProjection\?\.subtotalAmount/);

console.log('Document replacement financial lock Wave 6 client tax print contract: PASS');
