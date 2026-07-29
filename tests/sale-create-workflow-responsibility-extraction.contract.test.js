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

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(fs.existsSync(contractPath), 'Create Sale atomic-cutover contract must exist');
assert(fs.existsSync(missionPath), 'Create Sale mission must exist');

const contract = read(contractPath);
const mission = read(missionPath);

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

assert(
  mission.includes('CreateSalePage.jsx` remains the route-level composition surface'),
  'Mission must preserve CreateSalePage as composition surface'
);
assert(
  mission.includes('Runtime PASS and Operational PASS require executable evidence'),
  'Mission must preserve verification gate separation'
);

console.log('Sale create workflow responsibility extraction contract: PASS');
