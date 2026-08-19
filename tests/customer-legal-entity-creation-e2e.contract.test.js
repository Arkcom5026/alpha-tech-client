import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const editor = read('src/features/sales/create/customer/hooks/useSaleCustomerEditor.js');
const form = read('src/features/sales/create/customer/components/SaleCustomerDetailsForm.jsx');
const section = read('src/features/sales/create/customer/SaleCustomerSection.jsx');
const api = read('src/features/customer/api/customerApi.js');

assert.match(editor, /LEGAL_ENTITY_TYPES = new Set\(\['ORGANIZATION', 'GOVERNMENT'\]\)/);
assert.match(editor, /if \(!editor\.companyName\.trim\(\)\) return 'กรุณากรอกชื่อบริษัทหรือหน่วยงาน'/);
assert.match(editor, /else if \(!editor\.name\.trim\(\)\)/);
assert.match(editor, /companyName: editor\.companyName\.trim\(\)/);
assert.match(editor, /departmentName: editor\.customerType === 'INDIVIDUAL' \? '' : editor\.departmentName\.trim\(\)/);
assert.match(editor, /\^\[0-9\]\{9,10\}\$/);

assert.match(form, /ชื่อผู้ติดต่อ \(ถ้ามี\)/);
assert.match(form, /type\.value === 'INDIVIDUAL'/);
assert.match(form, /companyName: '', departmentName: ''/);

assert.match(section, /const validationError = editor\.validateForSave\(\)/);
assert.match(section, /const created = await createCustomer\(payloadSnapshot\)/);
assert.match(api, /apiClient\.post\('\/customers', data\)/);

assert.doesNotMatch(editor, /if \(!editor\.name\.trim\(\)\) return 'กรุณากรอกชื่อลูกค้า';\s*const phone/);

console.log('Customer Legal Entity Creation E2E Client Contract: PASS');
