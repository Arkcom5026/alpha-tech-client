export const projectSaleHeldCart = ({
  session,
  saleItems,
  customerId,
  selectedPriceType,
}) => ({
  panel: {
    open: session.panelOpen,
    activeCart: session.activeHeldCart,
    activeCartRef: session.activeHeldCartRef,
    validation: session.validation,
    saveState: session.saveState,
  },
  snapshot: {
    itemCount: Array.isArray(saleItems) ? saleItems.length : 0,
    customerId: customerId ? Number(customerId) : null,
    priceType: selectedPriceType,
  },
  commands: {
    openPanel: session.openPanel,
    closePanel: session.closePanel,
    clearActiveCart: session.clearActiveCart,
  },
});
