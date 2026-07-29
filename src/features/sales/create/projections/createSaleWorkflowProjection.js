export const projectCreateSaleWorkflow = ({
  cart,
  itemSearch,
  completion,
  documentHandoff,
  heldCart,
  customer,
  presentation,
}) => ({
  customer,
  presentation,
  cart: {
    items: cart.items,
    itemKeySet: cart.itemKeySet,
    add: cart.add,
    remove: cart.remove,
    update: cart.update,
    setSimpleQuantity: cart.setSimpleQuantity,
    clear: cart.clear,
  },
  itemSearch: {
    error: itemSearch.error,
    setError: itemSearch.setError,
    handleBarcodeSearch: itemSearch.handleBarcodeSearch,
    resetInput: itemSearch.resetInput,
  },
  completion: {
    isSubmitting: completion.isSubmitting,
    setIsSubmitting: completion.setIsSubmitting,
    confirm: completion.confirm,
  },
  documentHandoff: {
    saleOption: documentHandoff.saleOption,
    setSaleOption: documentHandoff.setSaleOption,
    handleConfirmed: documentHandoff.handleConfirmed,
  },
  heldCart,
});
