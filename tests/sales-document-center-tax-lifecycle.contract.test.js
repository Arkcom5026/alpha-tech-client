import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/features/bill/pages/PrintBillListPage.jsx', 'utf8');
const table = fs.readFileSync('src/features/bill/components/workspace/BillResultTable.jsx', 'utf8');
const header = fs.readFileSync('src/features/bill/components/workspace/BillWorkspaceHeader.jsx', 'utf8');
const toolbar = fs.readFileSync('src/features/bill/components/workspace/BillSearchToolbar.jsx', 'utf8');
const taxIntake = fs.readFileSync('src/features/tax/intake/pages/TaxIntakeWorkspacePage.jsx', 'utf8');

assert.match(page, /TAX_DOCUMENT_SOURCE_TYPE\s*=\s*'TAX_DOCUMENT'/);
assert.match(page, /\.\.\/tax-document\/print\/\$\{sourceId\}/);
assert.match(page, /finance\/tax-intake\?taxDocumentId=/);
assert.match(page, /onManageTaxDocument=\{handleManageTaxDocument\}/);

assert.match(table, /OUTPUT_TAX_FULL/);
assert.match(table, /OUTPUT_TAX_SHORT/);
assert.match(table, /เลขที่เอกสาร/);
assert.match(table, /ประเภทเอกสาร/);
assert.match(table, /สถานะ/);
assert.match(table, /จัดการ \/ ออกใบกำกับภาษี/);
assert.match(table, /taxRegistered \?/);
assert.match(table, /isTaxDocument \?/);

assert.match(header, /ค้นหาและจัดการเอกสารขาย/);
assert.match(toolbar, /ตัวเลือกนี้ใช้กับรายการขาย\/ใบเสร็จเดิมเท่านั้น/);

assert.match(taxIntake, /searchParams\.get\('taxDocumentId'\)/);
assert.match(taxIntake, /documents\.find\(\(item\) => Number\(item\?\.id\) === focusedTaxDocumentId\)/);
assert.match(taxIntake, /openDocument\(document\)/);

console.log('Sales Document Center tax lifecycle client contract: PASS');
