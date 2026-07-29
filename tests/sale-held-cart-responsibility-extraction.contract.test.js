const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'src/features/sales/create/held-cart');
const paths = {
  workflowHook: path.join(base, 'hooks/useSaleHeldCartWorkflow.js'),
  sessionHook: path.join(base, 'hooks/useSaleHeldCart.js'),
  autosaveHook: path.join(base, 'hooks/useSaleHeldCartAutosave.js'),
  recoveryHook: path.join(base, 'hooks/useSaleHeldCartRecovery.js'),
  loadController: path.join(base, 'controllers/saleHeldCartLoadController.js'),
  recovery: path.join(base, 'services/saleHeldCartRecovery.js'),
  integration: path.join(base, 'services/saleHeldCartIntegration.js'),
  projection: path.join(base, 'projections/saleHeldCartProjection.js'),
  workflowProjection: path.join(base, 'projections/saleHeldCartWorkflowProjection.js'),
  adapter: path.join(base, 'adapters/createSaleHeldCartWorkflowAdapter.js'),
  cutoverContract: path.join(base, 'contracts/saleHeldCartAtomicCutoverContract.js'),
  runtimeEntrypoint: path.join(root, 'src/features/sales/create/pages/CreateSalePage.jsx'),
  index: path.join(base, 'index.js'),
};

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

Object.entries(paths).forEach(([name, filePath]) => {
  assert(fs.existsSync(filePath), `${name} must exist`);
});

const workflowHook = read(paths.workflowHook);
const sessionHook = read(paths.sessionHook);
const autosaveHook = read(paths.autosaveHook);
const recoveryHook = read(paths.recoveryHook);
const loadController = read(paths.loadController);
const recovery = read(paths.recovery);
const integration = read(paths.integration);
const projection = read(paths.projection);
const workflowProjection = read(paths.workflowProjection);
const adapter = read(paths.adapter);
const cutoverContract = read(paths.cutoverContract);
const runtimeEntrypoint = read(paths.runtimeEntrypoint);
const index = read(paths.index);

assert(workflowHook.includes('useSaleHeldCart()'), 'Workflow hook must compose the session owner');
assert(workflowHook.includes('useSaleHeldCartAutosave'), 'Workflow hook must compose autosave');
assert(workflowHook.includes('useSaleHeldCartRecovery'), 'Workflow hook must compose recovery');
assert(workflowHook.includes('projectSaleHeldCartWorkflow'), 'Workflow hook must delegate its public projection');
assert(!workflowHook.includes('useState'), 'Workflow hook must orchestrate owners rather than duplicate state');

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

assert(loadController.includes('Promise.all'), 'Load controller must load and revalidate together');
assert(loadController.includes('mapHeldCartLinesToSaleItems'), 'Load controller must delegate persisted-line mapping');
assert(loadController.includes('projectHeldCartWarning'), 'Load controller must delegate warning projection');
assert(!loadController.includes('useState'), 'Load controller must remain framework-independent');

assert(recoveryHook.includes('executeSaleHeldCartLoad'), 'Recovery hook must delegate load execution to controller');
assert(recoveryHook.includes('setSaleItems'), 'Recovery hook must restore sale lines');
assert(recoveryHook.includes('setCustomerId'), 'Recovery hook must restore customer identity');
assert(recoveryHook.includes('setSelectedPriceType'), 'Recovery hook must restore price type');
assert(recoveryHook.includes('productSearchRef'), 'Recovery hook must own focus handoff');

assert(recovery.includes('mapHeldCartLinesToSaleItems'), 'Recovery owner must map persisted lines');
assert(recovery.includes('heldCartAvailability'), 'Recovery must preserve availability projection');
assert(recovery.includes('projectHeldCartWarning'), 'Recovery must own warning projection');
assert(recovery.includes('priceChanged'), 'Recovery must preserve changed-price warning');
assert(!recovery.includes('useSalesStore'), 'Recovery mapper must remain pure');

assert(integration.includes('buildHeldCartRestoreResult'), 'Integration owner must compose recovery result');
assert(integration.includes('canRemoveSaleItemFromHeldCart'), 'Integration owner must own final-line removal policy');
assert(integration.includes('projectHeldCartCompletionGuard'), 'Integration owner must own completion guard');
assert(integration.includes('HELD_CART_ITEM_UNAVAILABLE'), 'Completion guard must preserve failure code');
assert(!integration.includes('useState'), 'Integration policy must remain framework-independent');
assert(!integration.includes('useSalesStore'), 'Integration policy must not own Sales store');

assert(projection.includes('projectSaleHeldCart'), 'Projection owner must expose view model');
assert(projection.includes('panel'), 'Projection must include panel state');
assert(projection.includes('snapshot'), 'Projection must include sale snapshot');
assert(projection.includes('commands'), 'Projection must include delegated commands');
assert(workflowProjection.includes('projectSaleHeldCartWorkflow'), 'Workflow projection must expose the public workflow view');
assert(workflowProjection.includes('recovery.load'), 'Workflow projection must expose recovery command');
assert(workflowProjection.includes('autosave.persist'), 'Workflow projection must expose persistence command');
assert(workflowProjection.includes('session.setValidation'), 'Workflow projection must expose validation update command');

assert(adapter.includes('getPosHeldCart'), 'Adapter must bind held cart load API');
assert(adapter.includes('revalidatePosHeldCart'), 'Adapter must bind held cart validation API');
assert(adapter.includes('updatePosHeldCart'), 'Adapter must bind held cart update API');
assert(!adapter.includes('useState'), 'Adapter must remain framework-independent');

assert(cutoverContract.includes('forbiddenLegacySymbols'), 'Cutover contract must define forbidden legacy ownership');
assert(runtimeEntrypoint.includes("from '../held-cart'"), 'Create Sale must consume held-cart public boundary');
assert(runtimeEntrypoint.includes('createSaleHeldCartWorkflowAdapter'), 'Create Sale must bind the workflow through the adapter');
assert(runtimeEntrypoint.includes('useSaleHeldCartWorkflow'), 'Create Sale must consume the workflow orchestrator');
assert(runtimeEntrypoint.includes('heldCart.commands.load'), 'Create Sale panel must delegate recovery command');
assert(runtimeEntrypoint.includes('heldCart.commands.persist'), 'Create Sale completion must delegate persistence');
assert(runtimeEntrypoint.includes('heldCart.commands.setValidation'), 'Create Sale must delegate validation state to workflow owner');
[
  'autosaveTimerRef',
  'autosavePromiseRef',
  'heldCartPanelOpen',
  'setHeldCartPanelOpen',
  'activeHeldCartRef = useRef',
  'activeHeldCart, setActiveHeldCart',
  'heldCartValidation, setHeldCartValidation',
  'heldCartSaveState, setHeldCartSaveState',
  'const heldSnapshot =',
  'const persistActiveHeldCart =',
  'const loadHeldCart =',
  'const validationByKey = new Map',
].forEach((symbol) => assert(!runtimeEntrypoint.includes(symbol), `${symbol} must be removed from Create Sale`));

[
  'createSaleHeldCartWorkflowAdapter',
  'useSaleHeldCartWorkflow',
  'useSaleHeldCart',
  'useSaleHeldCartAutosave',
  'useSaleHeldCartRecovery',
  'executeSaleHeldCartLoad',
  'mapHeldCartLinesToSaleItems',
  'projectHeldCartWarning',
  'buildHeldCartRestoreResult',
  'canRemoveSaleItemFromHeldCart',
  'projectHeldCartCompletionGuard',
  'projectSaleHeldCart',
  'projectSaleHeldCartWorkflow',
].forEach((symbol) => assert(index.includes(symbol), `${symbol} must be publicly exported`));

console.log('Sale held cart workflow responsibility extraction contract: PASS');
