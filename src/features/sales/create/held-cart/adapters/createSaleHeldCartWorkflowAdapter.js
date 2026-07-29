import {
  getPosHeldCart,
  getPosHeldCartErrorMessage,
  revalidatePosHeldCart,
  updatePosHeldCart,
} from '@/features/sales/held-cart/api/posHeldCartApi';

export const createSaleHeldCartWorkflowAdapter = ({
  saleItems,
  setSaleItems,
  customerId,
  setCustomerId,
  selectedPriceType,
  setSelectedPriceType,
  setError,
  productSearchRef,
}) => ({
  saleItems,
  setSaleItems,
  customerId,
  setCustomerId,
  selectedPriceType,
  setSelectedPriceType,
  updateHeldCart: updatePosHeldCart,
  getHeldCart: getPosHeldCart,
  revalidateHeldCart: revalidatePosHeldCart,
  getErrorMessage: getPosHeldCartErrorMessage,
  setError,
  productSearchRef,
});
