import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(dirname, '..', file), 'utf8');

const page = read('src/features/combinedBilling/pages/CombinedBillingPage.jsx');

assert.doesNotMatch(page, /sale\.saleMode === 'CASH'/);
assert.doesNotMatch(page, /line\.saleMode === 'CASH'/);
assert.doesNotMatch(page, /SALE_PAYMENT/);
assert.match(page, /line\.status === 'PAID_READY'/);
assert.match(page, /adjustmentReason/);

console.log('Delivery Note credit-only consolidation client authority contract: PASS');
