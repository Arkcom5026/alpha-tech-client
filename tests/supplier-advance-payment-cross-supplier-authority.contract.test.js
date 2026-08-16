import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx', 'utf8');

assert.match(source, /advancePaymentsBySupplier\?\.\[supplierId\]/, 'history must render from supplier-scoped cache');
assert.match(source, /const supplierIdRef = useRef\(supplierId\)/, 'current supplier authority ref is required');
assert.match(source, /const historyRequestRef = useRef\(0\)/, 'history request sequencing authority is required');
assert.match(source, /supplierIdRef\.current !== supplierIdSnapshot/, 'stale supplier context must be detected');
assert.match(source, /context-changed-after-create:error/, 'post-persistence supplier context change must have partial-success feedback');
assert.match(source, /supplier-payment:advance:\$\{supplierIdSnapshot\}:create:success/, 'create success event must be supplier-scoped');
assert.match(source, /supplier-payment:advance:\$\{supplierIdSnapshot\}:history-after-create:error/, 'post-create refresh event must be supplier-scoped');

console.log('Supplier Advance Payment Cross-Supplier Authority Contract: PASS');
