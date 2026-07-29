import { useState } from 'react';

import { createSaleHeldCartWorkflowAdapter, useSaleHeldCartWorkflow } from '../held-cart';
import { useSaleCartEditor } from '../cart';
import { useSaleItemSearch } from '../item-search';
import { useSaleCompletion } from '../completion';
import { useSaleDocumentHandoff } from '../document-handoff';
import { projectCreateSaleWorkflow } from '../projections/createSaleWorkflowProjection';

export const useCreateSaleWorkflow = ({
  customerId,
  setCustomerId,
  billDiscount,
  clearSaleError,
  shopSlug,
  navigate,
  productSearchRef,
  setHideCustomerDetails,
}) => {
  const [selectedPriceType, setSelectedPriceType] = useState('retail');
  const [saleMode, setSaleMode] = useState('CASH');
  const [error, setError] = useState('');

  const cart = useSaleCartEditor({ onError: setError });

  const heldCartArgs = createSaleHeldCartWorkflowAdapter({
    saleItems: cart.items,
    setSaleItems: cart.setItems,
    customerId,
    setCustomerId,
    selectedPriceType,
    setSelectedPriceType,
    setError,
    productSearchRef,
  });
  const heldCart = useSaleHeldCartWorkflow(heldCartArgs);

  cart.activeHeldCartRef = heldCart.panel.activeCartRef;

  const itemSearch = useSaleItemSearch({
    selectedPriceType,
    itemKeySet: cart.itemKeySet,
    addItem: cart.add,
    clearSaleError,
    setError,
    productSearchRef,
  });

  const completion = useSaleCompletion({
    saleItems: cart.items,
    customerId,
    saleMode,
    activeHeldCart: heldCart.panel.activeCart,
    persistHeldCart: heldCart.commands.persist,
    cancelHeldCartScheduled: heldCart.commands.cancelScheduled,
    revalidateHeldCart: heldCart.commands.revalidate,
    setHeldCartValidation: heldCart.commands.setValidation,
    clearSaleError,
  });

  const documentHandoff = useSaleDocumentHandoff({
    shopSlug,
    navigate,
    clearCart: cart.clear,
    clearHeldCart: heldCart.commands.clearActiveCart,
    setHideCustomerDetails,
    productSearchRef,
  });

  return projectCreateSaleWorkflow({
    cart,
    itemSearch: { ...itemSearch, error, setError },
    completion,
    documentHandoff,
    heldCart,
    customer: {
      customerId,
      setCustomerId,
    },
    presentation: {
      selectedPriceType,
      setSelectedPriceType,
      saleMode,
      setSaleMode,
      billDiscount,
    },
  });
};
