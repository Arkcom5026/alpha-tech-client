import { useSaleHeldCart } from './useSaleHeldCart';
import { useSaleHeldCartAutosave } from './useSaleHeldCartAutosave';
import { useSaleHeldCartRecovery } from './useSaleHeldCartRecovery';
import { projectSaleHeldCartWorkflow } from '../projections/saleHeldCartWorkflowProjection';

export const useSaleHeldCartWorkflow = ({
  saleItems,
  setSaleItems,
  customerId,
  setCustomerId,
  selectedPriceType,
  setSelectedPriceType,
  updateHeldCart,
  getHeldCart,
  revalidateHeldCart,
  getErrorMessage,
  setError,
  productSearchRef,
}) => {
  const session = useSaleHeldCart();

  const autosave = useSaleHeldCartAutosave({
    activeHeldCartRef: session.activeHeldCartRef,
    saleItems,
    customerId,
    selectedPriceType,
    updateHeldCart,
    setActiveCart: session.setActiveCart,
    setSaveState: session.setSaveState,
    onError: (error) => setError(`❌ Autosave: ${getErrorMessage(error)}`),
  });

  const recovery = useSaleHeldCartRecovery({
    getHeldCart,
    revalidateHeldCart,
    setSaleItems,
    setCustomerId,
    setSelectedPriceType,
    setActiveCart: session.setActiveCart,
    setValidation: session.setValidation,
    setSaveState: session.setSaveState,
    closePanel: session.closePanel,
    setError,
    getErrorMessage,
    productSearchRef,
  });

  return projectSaleHeldCartWorkflow({
    session,
    autosave,
    recovery,
    saleItems,
    customerId,
    selectedPriceType,
  });
};
