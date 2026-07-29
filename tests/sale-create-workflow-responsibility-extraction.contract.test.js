const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'src/features/sales/create/contracts/createSaleAtomicCutoverContract.js');
const missionPath = path.join(root, 'docs/missions/sale-create-workflow-responsibility-extraction.md');
const runtimeEntrypointPath = path.join(root, 'src/features/sales/create/pages/CreateSalePage.jsx');
const cartHookPath = path.join(root, 'src/features/sales/create/cart/hooks/useSaleCartEditor.js');
const cartIndexPath = path.join(root, 'src/features/sales/create/cart/index.js');
const itemSearchHookPath = path.join(root, 'src/features/sales/create/item-search/hooks/useSaleItemSearch.js');
const itemSearchIndexPath = path.join(root, 'src/features/sales/create/item-search/index.js');
const completionHookPath = path.join(root, 'src/features/sales/create/completion/hooks/useSaleCompletion.js');
const completionControllerPath = path.join(root, 'src/features/sales/create/completion/controllers/saleCompletionController.js');
const completionPayloadPath = path.join(root, 'src/features/sales/create/completion/services/saleCompletionPayload.js');
const completionValidationPath = path.join(root, 'src/features/sales/create/completion/services/saleCompletionValidation.js');
const completionIndexPath = path.join(root, 'src/features/sales/create/completion/index.js');
const documentHandoffHookPath = path.join(root, 'src/features/sales/create/document-handoff/hooks/useSaleDocumentHandoff.js');
const documentHandoffIndexPath = path.join(root, 'src/features/sales/create/document-handoff/index.js');
const workflowHookPath = path.join(root, 'src/features/sales/create/hooks/useCreateSaleWorkflow.js');
const workflowProjectionPath = path.join(root, 'src/features/sales/create/projections/createSaleWorkflowProjection.js');
const createIndexPath = path.join(root, 'src/features/sales/create/index.js');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[
  contractPath,
  missionPath,
  runtimeEntrypointPath,
  cartHookPath,
  cartIndexPath,
  itemSearchHookPath,
  itemSearchIndexPath,
  completionHookPath,
  completionControllerPath,
  completionPayloadPath,
  completionValidationPath,
  completionIndexPath,
  documentHandoffHookPath,
  documentHandoffIndexPath,
  workflowHookPath,
  workflowProjectionPath,
  createIndexPath,
].forEach((filePath) => assert(fs.existsSync(filePath), `${filePath} must exist`));

const contract = read(contractPath);
const mission = read(missionPath);
const runtimeEntrypoint = read(runtimeEntrypointPath);
const cartHook = read(cartHookPath);
const cartIndex = read(cartIndexPath);
const itemSearchHook = read(itemSearchHookPath);
const itemSearchIndex = read(itemSearchIndexPath);
const completionHook = read(completionHookPath);
const completionController = read(completionControllerPath);
const completionPayload = read(completionPayloadPath);
const completionValidation = read(completionValidationPath);
const completionIndex = read(completionIndexPath);
const documentHandoffHook = read(documentHandoffHookPath);
const documentHandoffIndex = read(documentHandoffIndexPath);
const workflowHook = read(workflowHookPath);
const workflowProjection = read(workflowProjectionPath);
const createIndex = read(createIndexPath);

[
  'useCreateSaleWorkflow',
  'useSaleCartEditor',
  'useSaleItemSearch',
  'useSaleCompletion',
  'useSaleDocumentHandoff',
  'useSaleHeldCartWorkflow',
  'projectCreateSaleWorkflow',
].forEach((symbol) => {
  assert(contract.includes(symbol), `${symbol} must be represented in the cutover contract`);
  assert(mission.includes(symbol), `${symbol} must be represented in the mission`);
});

[
  'const [saleItems, setSaleItems] = useState',
  'const handleBarcodeSearch =',
  'const buildCompletionPayload =',
  'const handleConfirmSale =',
  'const handleSaleConfirmed =',
  'searchSaleItems',
  'mapSaleSearchItemToCartLine',
  'executeSaleCompletion',
  'openCompletedSaleDocument',
  'revalidatePosHeldCart',
].forEach((legacyOwner) => {
  assert(contract.includes(legacyOwner), `${legacyOwner} must be forbidden after atomic cutover`);
  assert(!runtimeEntrypoint.includes(legacyOwner), `${legacyOwner} must be removed from CreateSalePage`);
});

assert(runtimeEntrypoint.includes("from '../index'"), 'CreateSalePage must import the Create Sale public boundary');
assert(runtimeEntrypoint.includes('useCreateSaleWorkflow({'), 'CreateSalePage must consume the Create Sale workflow');
assert(runtimeEntrypoint.includes('sale.cart.items'), 'CreateSalePage must consume projected cart state');
assert(runtimeEntrypoint.includes('sale.itemSearch.handleBarcodeSearch'), 'CreateSalePage must delegate barcode search');
assert(runtimeEntrypoint.includes('sale.completion.confirm'), 'CreateSalePage must delegate completion');
assert(runtimeEntrypoint.includes('sale.documentHandoff.handleConfirmed'), 'CreateSalePage must delegate document handoff');
assert(runtimeEntrypoint.includes('sale.heldCart.commands.load'), 'CreateSalePage must delegate Held Cart loading');

assert(cartHook.includes('useState(initialItems)'), 'Cart editor must own sale item state');
assert(cartHook.includes('itemKeySet'), 'Cart editor must own duplicate-key projection');
assert(cartHook.includes('canRemoveSaleItemFromHeldCart'), 'Cart editor must delegate Held Cart final-line policy');
assert(cartHook.includes('activeHeldCartRef'), 'Cart editor must support Held Cart authority without a second cart owner');
assert(cartHook.includes('const add = useCallback'), 'Cart editor must own add command');
assert(cartHook.includes('const remove = useCallback'), 'Cart editor must own remove command');
assert(cartHook.includes('const update = useCallback'), 'Cart editor must own update command');
assert(cartHook.includes('const clear = useCallback'), 'Cart editor must own clear command');
assert(!cartHook.includes('searchSaleItems'), 'Cart editor must not own item search');
assert(!cartHook.includes('executeSaleCompletion'), 'Cart editor must not own completion');
assert(cartIndex.includes('useSaleCartEditor'), 'Cart editor must be publicly exported');

assert(itemSearchHook.includes('searchSaleItems'), 'Item search owner must execute sale item search');
assert(itemSearchHook.includes('mapSaleSearchItemToCartLine'), 'Item search owner must map search results');
assert(itemSearchHook.includes('itemKeySet.has'), 'Item search owner must prevent duplicate lines');
assert(itemSearchHook.includes("case 'STOCK'"), 'Item search owner must support stock items');
assert(itemSearchHook.includes("case 'SIMPLE'"), 'Item search owner must support simple items');
assert(itemSearchHook.includes('resetInput'), 'Item search owner must own input reset and focus handoff');
assert(itemSearchHook.includes('setError'), 'Item search owner must own search feedback delegation');
assert(!itemSearchHook.includes('useState'), 'Item search owner must not duplicate cart or page state');
assert(!itemSearchHook.includes('executeSaleCompletion'), 'Item search owner must not own completion');
assert(itemSearchIndex.includes('useSaleItemSearch'), 'Item search owner must be publicly exported');

assert(completionHook.includes('useState(false)'), 'Completion owner must own submitting state');
assert(completionHook.includes('executeCreateSaleCompletion'), 'Completion hook must delegate execution to controller');
assert(completionHook.includes('setIsSubmitting(true)'), 'Completion hook must enter submitting state');
assert(completionHook.includes('setIsSubmitting(false)'), 'Completion hook must leave submitting state');
assert(completionController.includes('validateSaleCompletion'), 'Completion controller must validate preconditions');
assert(completionController.includes('buildSaleCompletionPayload'), 'Completion controller must delegate payload construction');
assert(completionController.includes('persistHeldCart'), 'Completion controller must persist an active Held Cart');
assert(completionController.includes('revalidateHeldCart'), 'Completion controller must revalidate an active Held Cart');
assert(completionController.includes('projectHeldCartCompletionGuard'), 'Completion controller must preserve Held Cart completion guard');
assert(completionController.includes('executeSaleCompletion'), 'Completion controller must execute sale completion');
assert(!completionController.includes('useState'), 'Completion controller must remain framework-independent');
assert(completionPayload.includes('sourceHeldCartId'), 'Completion payload must preserve source Held Cart authority');
assert(completionPayload.includes('vatRate = 7'), 'Completion payload must preserve VAT calculation');
assert(completionPayload.includes("item.lineType === 'SIMPLE'"), 'Completion payload must preserve Simple quantity semantics');
assert(completionValidation.includes("saleMode === 'CREDIT'"), 'Completion validation must require customer for credit sale');
assert(completionValidation.includes('SIMPLE_LOT_NOT_SELLABLE'), 'Completion validation must preserve SimpleLot guard');
assert(completionIndex.includes('useSaleCompletion'), 'Completion owner must be publicly exported');
assert(completionIndex.includes('executeCreateSaleCompletion'), 'Completion controller must be publicly exported');

assert(documentHandoffHook.includes("useState('NONE')"), 'Document handoff must own sale option state');
assert(documentHandoffHook.includes("useRef('')"), 'Document handoff must own duplicate-open authority');
assert(documentHandoffHook.includes('openCompletedSaleDocument'), 'Document handoff must open the completed document');
assert(documentHandoffHook.includes('lastDocumentKeyRef.current !== printKey'), 'Document handoff must prevent duplicate document opening');
assert(documentHandoffHook.includes('clearCart()'), 'Document handoff must clear the sale cart after confirmation');
assert(documentHandoffHook.includes('clearHeldCart()'), 'Document handoff must clear active Held Cart state after confirmation');
assert(documentHandoffHook.includes('setHideCustomerDetails(true)'), 'Document handoff must coordinate customer reset presentation');
assert(documentHandoffHook.includes('productSearchRef?.current?.focus?.()'), 'Document handoff must return focus to product search');
assert(!documentHandoffHook.includes('executeSaleCompletion'), 'Document handoff must not own sale completion execution');
assert(documentHandoffIndex.includes('useSaleDocumentHandoff'), 'Document handoff must be publicly exported');

assert(workflowHook.includes('useSaleCartEditor'), 'Workflow must compose cart owner');
assert(workflowHook.includes('useSaleItemSearch'), 'Workflow must compose item search owner');
assert(workflowHook.includes('useSaleCompletion'), 'Workflow must compose completion owner');
assert(workflowHook.includes('useSaleDocumentHandoff'), 'Workflow must compose document handoff owner');
assert(workflowHook.includes('useSaleHeldCartWorkflow'), 'Workflow must compose Held Cart owner');
assert(workflowHook.includes('projectCreateSaleWorkflow'), 'Workflow must delegate public projection');
assert((workflowHook.match(/useSaleCartEditor\(/g) || []).length === 1, 'Workflow must create exactly one cart owner');
assert(workflowHook.includes('activeHeldCartAuthorityRef'), 'Workflow must bridge Held Cart authority through a ref');
assert(workflowProjection.includes('projectCreateSaleWorkflow'), 'Workflow projection must expose the Create Sale view model');
assert(workflowProjection.includes('cart:'), 'Workflow projection must expose cart state and commands');
assert(workflowProjection.includes('itemSearch:'), 'Workflow projection must expose item search state and commands');
assert(workflowProjection.includes('completion:'), 'Workflow projection must expose completion state and commands');
assert(workflowProjection.includes('documentHandoff:'), 'Workflow projection must expose document handoff state and commands');
assert(workflowProjection.includes('heldCart'), 'Workflow projection must expose Held Cart composition');
assert(createIndex.includes('useCreateSaleWorkflow'), 'Create Sale workflow must be publicly exported');
assert(createIndex.includes('projectCreateSaleWorkflow'), 'Create Sale projection must be publicly exported');

assert(
  mission.includes('CreateSalePage.jsx` remains the route-level composition surface'),
  'Mission must preserve CreateSalePage as composition surface'
);
assert(
  mission.includes('Runtime PASS and Operational PASS require executable evidence'),
  'Mission must preserve verification gate separation'
);

console.log('Sale create workflow responsibility extraction contract: PASS');
