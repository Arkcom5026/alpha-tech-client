import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const searchApi = read('src/features/sales/documents/search/api/saleDocumentSearchApi.js');
const billPolicy = read('src/features/sales/documents/search/policies/billDocumentSearchPolicy.js');
const deliveryPolicy = read('src/features/sales/documents/search/policies/deliveryNoteSearchPolicy.js');
const billList = read('src/features/bill/pages/PrintBillListPage.jsx');
const deliveryList = read('src/features/deliveryNote/pages/DeliveryNoteListPage.jsx');
const billFull = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const billShort = read('src/features/bill/pages/PrintBillPageShortTax.jsx');
const deliveryPrint = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');
const sourceHook = read('src/features/bill/hooks/useBillDocumentSource.js');
const adapter = read('src/features/combinedBilling/adapters/consolidatedDocumentAdapter.js');
const workspace = read('src/features/combinedBilling/pages/CombinedBillingPage.jsx');
const routes = read('src/routes/partner/salesRoutes.jsx');

assert.match(searchApi, /\/combined-billing\/unified-document-history/, 'shared document search must consume the unified history bridge');
assert.match(searchApi, /status\) !== 404/, 'unified history rollout must retain legacy Sale search fallback on 404');
assert.match(billPolicy, /documentPurpose:\s*'BILL'/, 'Bill history must request the Bill purpose projection');
assert.match(deliveryPolicy, /documentPurpose:\s*'DELIVERY_NOTE'/, 'Delivery Note history must request the Delivery Note purpose projection');

assert.match(adapter, /CONSOLIDATED_DOCUMENT_SOURCE_TYPE = 'CONSOLIDATED_DELIVERY'/, 'client must preserve consolidated source identity');
assert.match(sourceHook, /getConsolidatedDeliveryPrintable/, 'standard Bill runtime must load consolidated persistence through the established printable API');
assert.match(sourceHook, /canEditDocumentLines:\s*!isConsolidated/, 'consolidated Bill sources must be read only');

assert.match(billFull, /useBillDocumentSource/, 'standard full Bill page must load both Sale and consolidated sources');
assert.match(billShort, /useBillDocumentSource/, 'standard short Bill page must load both Sale and consolidated sources');
assert.match(deliveryPrint, /getConsolidatedDeliveryPrintable/, 'standard Delivery Note page must load consolidated sources');
assert.match(deliveryPrint, /editableDocumentLines=\{!isConsolidated\}/, 'consolidated Delivery Note lines must be read only');

assert.match(billList, /CONSOLIDATED_DOCUMENT_SOURCE_TYPE/, 'standard Bill history must understand consolidated source identity');
assert.match(billList, /\.\.\/bill\/print-full\//, 'consolidated full Bill must use the existing Bill print route');
assert.match(billList, /\.\.\/bill\/print-short\//, 'consolidated short Bill must use the existing Bill print route');
assert.match(deliveryList, /print\/\$\{sourceId\}\?sourceType=/, 'consolidated Delivery Note must use the existing Delivery Note print route');

assert.doesNotMatch(workspace, /loadHistoryAction/, 'Combined Billing workspace must not own a second document-history lifecycle');
assert.doesNotMatch(workspace, /ประวัติใบส่งของรวม/, 'Combined Billing workspace must not expose a separate consolidated history silo');
assert.match(workspace, /\/pos\/sales\/delivery-note/, 'post-confirm handoff must expose the standard Delivery Note lifecycle');
assert.match(workspace, /\/pos\/sales\/bill/, 'post-confirm handoff must expose the standard Bill lifecycle');

assert.match(routes, /path:\s*'bill'/, 'standard Bill history route must remain available');
assert.match(routes, /path:\s*'delivery-note'/, 'standard Delivery Note history route must remain available');
assert.match(routes, /combined-billing\/delivery\/print/, 'legacy consolidated Delivery route must remain for audit/backward compatibility');
assert.match(routes, /combined-billing\/bill\/print/, 'legacy consolidated Bill route must remain for audit/backward compatibility');

console.log('Unified Combined Billing Document Lifecycle Client Contract: PASS');
