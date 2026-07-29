import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const pagePath = 'src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx';
const workspaceIndexPath = 'src/features/sales/documents/workspace/index.js';
const legacyStorePath = 'src/features/sales/store/salesStore.js';

test('Delivery Note consumes the shared document line editor', () => {
  const page = read(pagePath);

  assert.match(page, /useSaleDocumentLineEditor/);
  assert.match(page, /saleId,\s*reload:\s*reloadSaleDocument/);
  assert.match(page, /documentLineActions\.toggle/);
  assert.match(page, /documentLineActions\.change/);
  assert.match(page, /documentLineActions\.save/);
});

test('Delivery Note no longer imports or calls the legacy Sales Store', () => {
  const page = read(pagePath);

  assert.doesNotMatch(page, /features\/sales\/store\/salesStore/);
  assert.doesNotMatch(page, /useSalesStore/);
  assert.doesNotMatch(page, /updateSaleDocumentLinesAction/);
  assert.doesNotMatch(page, /setEditingLineKey/);
  assert.doesNotMatch(page, /setLineDrafts/);
  assert.doesNotMatch(page, /setSavingLineKey/);
});

test('server authority and renderer remain unchanged', () => {
  const page = read(pagePath);

  assert.match(page, /loadSaleDocument\(saleId\)/);
  assert.match(page, /setCurrentSale\(sale \|\| null\)/);
  assert.match(page, /<DeliveryNoteForm/);
  assert.match(page, /saleItems=\{preparedSaleItems\}/);
  assert.match(page, /hideDate=\{hideDate\}/);
});

test('workspace public boundary exports the shared editor', () => {
  const workspaceIndex = read(workspaceIndexPath);
  assert.match(workspaceIndex, /useSaleDocumentLineEditor/);
});

test('legacy mutation action remains available only for compatibility', () => {
  const legacyStore = read(legacyStorePath);
  assert.match(legacyStore, /updateSaleDocumentLinesAction/);
});
