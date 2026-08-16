import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../src/features/purchaseOrderReceipt/components/POItemListForReceipt.jsx', import.meta.url),
  'utf8',
);

const start = source.indexOf('const handleSaveItem = async (item) => {');
const end = source.indexOf('\n  const handleConfirmFinalize', start);

assert.ok(start >= 0 && end > start, 'handleSaveItem must remain discoverable for the receipt save-path contract');

const savePath = source.slice(start, end);

assert.match(
  savePath,
  /await\s+addReceiptItemAction\(payload\)/,
  'receipt rows must still persist through addReceiptItemAction',
);

assert.doesNotMatch(
  savePath,
  /loadOrderById(?:Action)?|fn\?\.\(poId\)/,
  'saving one receipt row must not refetch the full purchase-order detail',
);

assert.match(
  savePath,
  /setSessionSavedQty/,
  'receipt save path must keep session quantity state authoritative after persistence',
);
assert.match(
  savePath,
  /setSavedRows/,
  'receipt save path must keep row confirmation state authoritative after persistence',
);

console.log('Purchase Receipt Save Refetch Performance Contract: PASS');
