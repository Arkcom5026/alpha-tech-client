export const SALE_HELD_CART_ATOMIC_CUTOVER_CONTRACT = Object.freeze({
  runtimeEntrypoint: 'src/features/sales/create/pages/CreateSalePage.jsx',
  requiredImport: "from '../held-cart'",
  requiredSymbols: [
    'createSaleHeldCartWorkflowAdapter',
    'useSaleHeldCartWorkflow',
  ],
  forbiddenLegacySymbols: [
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
    'const heldCartSavedAndClear =',
    'const validationByKey = new Map',
  ],
});
