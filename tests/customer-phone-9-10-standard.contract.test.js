const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '../src/features/sales/create/customer/hooks/useSaleCustomerEditor.js'),
  'utf8',
);

assert.match(source, /if \(!phone\) return 'กรุณากรอกเบอร์โทร';/);
assert.match(source, /\^\[0-9\]\{9,10\}\$/);
assert.match(source, /กรุณากรอกเบอร์โทร 9 หรือ 10 หลัก/);

console.log('Customer Phone 9/10 Standard Contract: PASS');
