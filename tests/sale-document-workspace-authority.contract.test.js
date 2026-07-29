const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const mission = read('docs/missions/sale-document-workspace-authority-audit.md');
const contract = read('src/features/sales/documents/workspace/contracts/saleDocumentWorkspaceAuthorityContract.js');
const api = read('src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js');
const identity = read('src/features/sales/documents/workspace/services/saleDocumentWorkspaceIdentity.js');
const controller = read('src/features/sales/documents/workspace/controllers/saleDocumentLineUpdateController.js');
const editor = read('src/features/sales/documents/workspace/hooks/useSaleDocumentLineEditor.js');
const index = read('src/features/sales/documents/workspace/index.js');
const legacyStore = read('src/features/sales/store/salesStore.js');
const billShort = read('src/features/bill/pages/PrintBillPageShortTax.jsx');
const billFull = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const deliveryNote = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');

assert(mission.includes('SERVER-REVALIDATED DOCUMENT WORKSPACE'), 'Mission must declare server-revalidated workspace authority');
assert(contract.includes("identityAuthority: 'ROUTE_SALE_ID'"), 'Contract must use route saleId authority');
assert(contract.includes("dataAuthority: 'SERVER_REVALIDATED_SALE'"), 'Contract must use server sale authority');
assert(contract.includes('optimisticSnapshotAuthority: false'), 'Navigation snapshot must not be final authority');

assert(api.includes('getSaleById'), 'Workspace API must own sale document loading');
assert(api.includes('updateSaleDocumentLines'), 'Workspace API must own document-line mutation');
assert(api.includes('loadSaleDocument = async ({ saleId, paymentId } = {})'), 'Workspace load API must accept a command object');
assert(identity.includes('routeSaleId'), 'Identity service must resolve route saleId');
assert(identity.includes("dataAuthority: 'SERVER_REVALIDATED_SALE'"), 'Identity result must expose authority');

assert(controller.includes('saveSaleDocumentLines'), 'Controller must delegate mutation to workspace API');
assert(controller.includes("typeof reload === 'function'"), 'Controller must support server reload after mutation');
assert(controller.indexOf('saveSaleDocumentLines') < controller.indexOf('await reload()'), 'Mutation must happen before reload');
assert(!controller.includes('useState'), 'Controller must remain framework-independent');

assert(editor.includes('executeSaleDocumentLineUpdate'), 'Editor hook must delegate mutation to controller');
assert(editor.includes('editingLineKey'), 'Editor hook must own edit identity');
assert(editor.includes('lineDrafts'), 'Editor hook must own drafts');
assert(editor.includes('savingLineKey'), 'Editor hook must own saving state');
assert(editor.includes('savingLineKeyRef'), 'Editor hook must prevent duplicate saves');
assert(editor.includes("code: 'SALE_DOCUMENT_LINE_UPDATE_IN_PROGRESS'"), 'Duplicate save refusal must be explicit');
assert(editor.includes('}, [saleId]);'), 'Editor state must reset when route saleId changes');

[
  'loadSaleDocument',
  'saveSaleDocumentLines',
  'executeSaleDocumentLineUpdate',
  'useSaleDocumentLineEditor',
  'resolveSaleDocumentWorkspaceIdentity',
].forEach((symbol) => assert(index.includes(symbol), `${symbol} must be publicly exported`));

assert(legacyStore.includes('updateSaleDocumentLinesAction'), 'Legacy document-line action must remain for compatibility');
assert(billShort.includes('loadSaleByIdAction'), 'Bill Short must retain billStore server hydration authority');
assert(billFull.includes('loadSaleByIdAction'), 'Bill Full must retain billStore server hydration authority');
assert(deliveryNote.includes('loadSaleDocument({ saleId })'), 'Delivery Note must load through the Workspace command API');
assert(!deliveryNote.includes('location.state'), 'Delivery Note must not use navigation snapshot authority');
assert(!deliveryNote.includes('getSaleByIdAction'), 'Delivery Note must not use legacy hydration authority');
assert(deliveryNote.includes('useSaleDocumentLineEditor'), 'Delivery Note must use the shared editor');

assert(!api.includes('BillLayout'), 'Workspace API must not depend on Bill renderer');
assert(!api.includes('DeliveryNoteForm'), 'Workspace API must not depend on Delivery Note renderer');
assert(!controller.includes('BillLayout'), 'Controller must not depend on Bill renderer');
assert(!controller.includes('DeliveryNoteForm'), 'Controller must not depend on Delivery Note renderer');

assert(
  mission.includes('Runtime PASS and Operational PASS require executable evidence'),
  'Mission must preserve verification gate separation'
);

console.log('Sale document workspace authority foundation contract: PASS');
