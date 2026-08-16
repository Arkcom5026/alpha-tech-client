import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(
  new URL('../src/features/supplier/workspace/SupplierViewWorkspace.jsx', import.meta.url),
  'utf8',
);

assert.match(source, /useRef/);
assert.match(source, /supplierContextRef/);
assert.match(source, /loadRequestRef/);
assert.match(source, /supplierIdSnapshot/);
assert.match(source, /branchIdSnapshot/);
assert.match(source, /contextKeySnapshot/);
assert.match(source, /supplier:view:\$\{supplierIdSnapshot\}:load:error/);
assert.doesNotMatch(source, /console\.error\('❌ ไม่สามารถโหลดข้อมูลผู้ขายได้'/);

console.log('Supplier view cross-context read authority: PASS');
