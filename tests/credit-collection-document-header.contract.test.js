import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const receiptPage = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx');
const settlementPage = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage.jsx');
const scope = read('src/features/branch/documentHeader/StoreDocumentHeaderScope.jsx');

assert.match(receiptPage, /buildStoreDocumentHeader/, 'Customer Money Receipt A4 must resolve the shared store document header');
assert.match(receiptPage, /CUSTOMER_MONEY_RECEIPT/, 'Customer Money Receipt must use its dedicated document type');
assert.match(receiptPage, /StoreDocumentHeaderScope/, 'Customer Money Receipt A4 must use the shared header scope');
assert.match(receiptPage, /mode === 'SHORT'/, 'Customer Money Receipt must preserve its explicit thermal mode boundary');

assert.match(settlementPage, /buildStoreDocumentHeader/, 'Delivery credit settlement A4 must resolve the shared store document header');
assert.match(settlementPage, /DELIVERY_CREDIT_SETTLEMENT/, 'Delivery credit settlement must use its dedicated document type');
assert.match(settlementPage, /StoreDocumentHeaderScope/, 'Delivery credit settlement A4 must use the shared header scope');
assert.match(settlementPage, /mode === 'SHORT'/, 'Delivery credit settlement must preserve its explicit thermal mode boundary');

assert.match(scope, /credit-collection-a4/, 'shared header scope must support credit collection A4 documents without affecting thermal print');
assert.match(scope, /--store-document-header-logo-size/, 'credit collection A4 must inherit the shared custom logo size authority');

console.log('Credit Collection Document Header Client Contract: PASS');
