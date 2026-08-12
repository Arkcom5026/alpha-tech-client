const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '../src/features/purchaseOrderReceipt/components/POItemListForReceipt.jsx'),
  'utf8'
);

test('confirmed RC exposes a direct continuation to barcode preparation', () => {
  assert.match(source, /handleContinueToBarcodePrep/);
  assert.match(source, /purchases\/barcodes\/preview\/\$\{receiptId\}/);
  assert.match(source, /เตรียม Barcode \/ SN/);
});

test('barcode preparation continuation is gated by RC confirmation and receipt identity', () => {
  assert.match(source, /if \(!finalizedOnce \|\| !receiptId\) return;/);
  assert.match(source, /finalizedOnce && receiptId/);
});
