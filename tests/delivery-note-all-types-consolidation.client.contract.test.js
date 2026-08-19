import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(dirname, '..', file), 'utf8');

const page = read('src/features/combinedBilling/pages/CombinedBillingPage.jsx');

// Document Workspace is CREDIT-only. Cash Delivery Notes created alongside or
// after an issued receipt/tax document are printable companions, not sources for
// a new consolidated financial/tax document.
assert.doesNotMatch(page, /sale\.saleMode === 'CASH'/);
assert.doesNotMatch(page, /line\.saleMode === 'CASH'/);
assert.doesNotMatch(page, /cashLocked/);
assert.doesNotMatch(page, /SALE_PAYMENT/);
assert.doesNotMatch(page, /Sale Payment authority/);
assert.doesNotMatch(page, /SOURCE_TAX_PRESERVED/);
assert.doesNotMatch(page, /CONSOLIDATED_TAX_DRAFT/);
assert.match(page, /line\.status === 'PAID_READY'/);
assert.match(page, /adjustmentReason/);

console.log('Delivery Note credit-only consolidation client contract: PASS');
