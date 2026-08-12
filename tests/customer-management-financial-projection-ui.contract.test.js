import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

const table = read('src/features/customer/components/workspace/CustomerResultTable.jsx');
const detail = read('src/features/customer/components/workspace/CustomerDetailWorkspace.jsx');

for (const text of ['หน่วยงานหลัก', 'บัญชีการเงินร่วม', 'ลูกหนี้แผนก', 'เงินพร้อมใช้กลุ่ม', 'ลูกหนี้รวมองค์กร', 'บัญชีเดี่ยว']) assert.match(table, new RegExp(text));
assert.match(table, /memberOutstandingDebt \?\? customer\.outstandingDebt/);
assert.match(table, /financialGroupStatus === 'MEMBER'[\s\S]*ใช้ร่วมกับหน่วยงานหลัก/);
assert.doesNotMatch(table, /financialGroupStatus === 'MEMBER'[\s\S]{0,250}money\(customer\.groupAvailableCustomerMoney\)/);
for (const text of ['Financial Owner', 'Customer Money ใช้ร่วมกับหน่วยงานหลัก', 'ลูกหนี้เฉพาะแผนกนี้', 'Customer Money พร้อมใช้รวม']) assert.match(detail, new RegExp(text));
console.log('customer-management-financial-projection-ui.contract: PASS');
