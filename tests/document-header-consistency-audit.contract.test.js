import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const resolver = read('src/features/branch/documentHeader/documentHeaderConfig.js');
const scope = read('src/features/branch/documentHeader/StoreDocumentHeaderScope.jsx');
const fullTaxPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const customerReceipt = read('src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx');
const deliveryNotePage = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');
const deliveryNotePolicy = read('src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js');
const customerMoneyReceipt = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx');
const deliveryCreditSettlement = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage.jsx');

// One visible store-wide logo size authority must drive every A4 document surface.
assert.match(resolver, /logoSize:\s*base\.logoSize/, 'document-specific overrides must not shadow the visible store-wide logo size');
assert.match(scope, /--store-document-header-logo-size/, 'all shared A4 adapters must consume the common logo-size CSS variable');
assert.match(scope, /Math\.min\(180,\s*Math\.max\(24/, 'shared renderer must preserve the 24-180px logo range');

// Full Tax / Sale receipt baseline.
assert.match(fullTaxPage, /StoreDocumentHeaderScope/, 'Full Tax must use the shared document header scope');
assert.match(fullTaxPage, /documentType:\s*'FULL_TAX_INVOICE'/, 'Full Tax must resolve its dedicated document header profile');
assert.match(scope, /\.print-a4 > div:first-child > div:first-child \{ align-items: center; \}/, 'Full Tax store header row must vertically center logo and store copy');
assert.match(fullTaxPage, /@page \{ size: A4; margin: 4mm !important; \}/, 'Full Tax page wrapper must match the deterministic A4 document margin authority');
assert.match(fullTaxPage, /body \.full-tax-a4-page \{[\s\S]*width: 201mm !important;[\s\S]*height: 288mm !important;/, 'Full Tax page wrapper must match the deterministic document dimensions');
assert.match(fullTaxPage, /\.full-tax-print-shell,[\s\S]*\.full-tax-print-frame \{[\s\S]*width: 100% !important;[\s\S]*max-width: none !important;/, 'Full Tax outer wrappers must not exceed the printable page box');
assert.match(fullTaxPage, /\.full-tax-a4-page > div:nth-last-child\(3\) \{[\s\S]*transform: translateY\(4mm\) !important;/, 'Full Tax summary spacing must move visually without increasing page flow');

// Customer Receipt may use the historical Full Tax renderer or the newer dedicated A4 document,
// but it must remain inside the shared store-document-header authority.
assert.match(customerReceipt, /BillLayoutFullTax|CustomerReceiptA4Document/, 'Customer Receipt must use a canonical A4 document surface');
assert.match(customerReceipt, /StoreDocumentHeaderScope/, 'Customer Receipt must use the shared document header scope');
assert.match(customerReceipt, /documentType:\s*'CUSTOMER_RECEIPT'/, 'Customer Receipt must resolve its dedicated document header profile');

// Delivery Note keeps its independent pagination surface but must match the same visual header alignment.
assert.match(deliveryNotePage, /StoreDocumentHeaderScope/, 'Delivery Note must use the shared document header scope');
assert.match(deliveryNotePolicy, /documentType:\s*'DELIVERY_NOTE'/, 'Delivery Note must resolve its dedicated document header profile');
assert.match(scope, /store-document-header-logo-left[\s\S]*display: flex; flex-direction: column; justify-content: center;/, 'Delivery Note left-side store copy must vertically center against the logo');
assert.match(scope, /store-document-header-logo-right[\s\S]*display: flex; flex-direction: column; justify-content: center;/, 'Delivery Note right-side store copy must vertically center against the logo');

// Customer Money A4 and Delivery Credit Settlement A4 share the credit-collection adapter.
assert.match(customerMoneyReceipt, /credit-collection-a4/, 'Customer Money Receipt A4 must use the shared credit-collection header surface');
assert.match(customerMoneyReceipt, /StoreDocumentHeaderScope/, 'Customer Money Receipt A4 must use the shared document header scope');
assert.match(customerMoneyReceipt, /CUSTOMER_MONEY_RECEIPT/, 'Customer Money Receipt must resolve its dedicated document header profile');
assert.match(deliveryCreditSettlement, /credit-collection-a4/, 'Delivery Credit Settlement A4 must use the shared credit-collection header surface');
assert.match(deliveryCreditSettlement, /StoreDocumentHeaderScope/, 'Delivery Credit Settlement A4 must use the shared document header scope');
assert.match(deliveryCreditSettlement, /DELIVERY_CREDIT_SETTLEMENT/, 'Delivery Credit Settlement must resolve its dedicated document header profile');
assert.match(scope, /credit-collection-store-header \{ text-align: left; align-items: center; \}/, 'credit-collection A4 headers must vertically center logo and store copy');

// Thermal/80mm layouts intentionally stay outside the A4 shared-header geometry contract.
assert.match(customerMoneyReceipt, /mode === 'SHORT'/, 'Customer Money Receipt must preserve its thermal boundary');
assert.match(deliveryCreditSettlement, /mode === 'SHORT'/, 'Delivery Credit Settlement must preserve its thermal boundary');

console.log('Document Header Consistency Audit Contract: PASS');
