const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'src/features/sales/create/held-cart');
const paths = {
  sessionHook: path.join(base, 'hooks/useSaleHeldCart.js'),
  autosaveHook: path.join(base, 'hooks/useSaleHeldCartAutosave.js'),
  recovery: path.join(base, 'services/saleHeldCartRecovery.js'),
  projection: path.join(base, 'projections/saleHeldCartProjection.js'),
  index: path.join(base, 'index.js'),
};

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

Object.entries(paths).forEach(([name, filePath]) => {
  assert(fs.existsSync(filePath), `${name} must exist`);
});

const sessionHook = read(paths.sessionHook);
const autosaveHook = read(paths.autosaveHook);
const recovery = read(paths.recovery);
const projection = read(paths.projection);
const index = read(paths.index);

assert(sessionHook.includes('activeHeldCartRef'), 'Session owner must own active cart authority');
assert(sessionHook.includes('panelOpen'), 'Session owner must own panel state');
assert(sessionHook.includes('validation'), 'Session owner must own validation state');
assert(sessionHook.includes('saveState'), 'Session owner must own save state');
assert(!sessionHook.includes('getPosHeldCart'), 'Session owner must not call recovery API');

assert(autosaveHook.includes('expectedVersion'), 'Autosave must preserve optimistic version authority');
assert(autosaveHook.includes("setSaveState('pending')"), 'Autosave must own pending state');
assert(autosaveHook.includes("setSaveState('saving')"), 'Autosave must own saving state');
assert(autosaveHook.includes("setSaveState('saved')"), 'Autosave must own saved state');
assert(autosaveHook.includes("setSaveState('failed')"), 'Autosave must own failed state');
assert(autosaveHook.includes('promiseRef'), 'Autosave must serialize persistence');
assert(autosaveHook.includes('timerRef'), 'Autosave must own debounce scheduling');

assert(recovery.includes('mapHeldCartLinesToSaleItems'), 'Recovery owner must map persisted lines');
assert(recovery.includes('heldCartAvailability'), 'Recovery must preserve availability projection');
assert(recovery.includes('projectHeldCartWarning'), 'Recovery must own warning projection');
assert(recovery.includes('priceChanged'), 'Recovery must preserve changed-price warning');
assert(!recovery.includes('useSalesStore'), 'Recovery mapper must remain pure');

assert(projection.includes('projectSaleHeldCart'), 'Projection owner must expose view model');
assert(projection.includes('panel'), 'Projection must include panel state');
assert(projection.includes('snapshot'), 'Projection must include sale snapshot');
assert(projection.includes('commands'), 'Projection must include delegated commands');

[
  'useSaleHeldCart',
  'useSaleHeldCartAutosave',
  'mapHeldCartLinesToSaleItems',
  'projectHeldCartWarning',
  'projectSaleHeldCart',
].forEach((symbol) => assert(index.includes(symbol), `${symbol} must be publicly exported`));

console.log('Sale held cart responsibility extraction contract: PASS');