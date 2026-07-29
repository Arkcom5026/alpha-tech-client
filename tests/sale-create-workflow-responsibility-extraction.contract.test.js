const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(
  root,
  'src/features/sales/create/contracts/createSaleAtomicCutoverContract.js'
);
const missionPath = path.join(
  root,
  'docs/missions/sale-create-workflow-responsibility-extraction.md'
);
const cartHookPath = path.join(
  root,
  'src/features/sales/create/cart/hooks/useSaleCartEditor.js'
);
const cartIndexPath = path.join(
  root,
  'src/features/sales/create/cart/index.js'
);
const itemSearchHookPath = path.join(
  root,
  'src/features/sales/create/item-search/hooks/useSaleItemSearch.js'
);
const itemSearchIndexPath = path.join(
  root,
  'src/features/sales/create/item-search/index.js'
);

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[
  contractPath,
  missionPath,
  cartHookPath,
  cartIndexPath,
  itemSearchHookPath,
  itemSearchIndexPath,
].forEach((filePath) => assert(fs.existsSync(filePath), `${filePath} must exist`));

const contract = read(contractPath);
const mission = read(missionPath);
const cartHook = read(cartHookPath);
const cartIndex = read(cartIndexPath);
const itemSearchHook = read(itemSearchHookPath);
const itemSearchIndex = read(itemSearchIndexPath);

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
].forEach((legacyOwner) => {
  assert(contract.includes(legacyOwner), `${legacyOwner} must be forbidden after atomic cutover`);
});

assert(cartHook.includes('useState(initialItems)'), 'Cart editor must own sale item state');
assert(cartHook.includes('itemKeySet'), 'Cart editor must own duplicate-key projection');
assert(cartHook.includes('canRemoveSaleItemFromHeldCart'), 'Cart editor must delegate Held Cart final-line policy');
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

assert(
  mission.includes('CreateSalePage.jsx` remains the route-level composition surface'),
  'Mission must preserve CreateSalePage as composition surface'
);
assert(
  mission.includes('Runtime PASS and Operational PASS require executable evidence'),
  'Mission must preserve verification gate separation'
);

console.log('Sale create workflow responsibility extraction contract: PASS');
