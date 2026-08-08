import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { test } from 'vitest';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const pagePath = 'src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx';
const workspaceIndexPath = 'src/features/sales/documents/workspace/index.js';
const workspaceApiPath = 'src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js';
const rootStorePath = 'src/features/sales/store/salesStore.js';
const documentSlicePath = 'src/features/sales/documents/store/saleDocumentRuntimeSlice.js';
const printShellPath = 'src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx';

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

test('server authority uses the workspace command shape and preserves the renderer', () => {
  const page = read(pagePath);
  const workspaceApi = read(workspaceApiPath);
  const printShell = read(printShellPath);

  assert.match(page, /loadSaleDocument\(\{ saleId \}\)/);
  assert.doesNotMatch(page, /loadSaleDocument\(saleId\)/);
  assert.match(workspaceApi, /loadSaleDocument = async \(\{ saleId, paymentId \} = \{\}\)/);
  assert.match(page, /setCurrentSale\(sale \|\| null\)/);
  assert.doesNotMatch(page, /Math\.random\(\)/);
  assert.match(page, /<DeliveryNotePrintShell/);
  assert.match(printShell, /<DeliveryNoteForm/);
  assert.match(page, /saleItems=\{preparedSaleItems\}/);
  assert.match(page, /hideDate=\{hideDate\}/);
});

test('workspace public boundary exports the shared editor', () => {
  const workspaceIndex = read(workspaceIndexPath);
  assert.match(workspaceIndex, /useSaleDocumentLineEditor/);
});

test('document-line mutation belongs only to the certified document slice', () => {
  const rootStore = read(rootStorePath);
  const documentSlice = read(documentSlicePath);

  assert.match(documentSlice, /updateSaleDocumentLinesAction/);
  assert.doesNotMatch(rootStore, /updateSaleDocumentLinesAction/);
});
