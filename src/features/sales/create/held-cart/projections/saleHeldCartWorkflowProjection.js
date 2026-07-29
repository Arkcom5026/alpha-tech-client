import { projectSaleHeldCart } from './saleHeldCartProjection';

export const projectSaleHeldCartWorkflow = ({
  session,
  autosave,
  recovery,
  saleItems,
  customerId,
  selectedPriceType,
}) => ({
  ...projectSaleHeldCart({
    session,
    saleItems,
    customerId,
    selectedPriceType,
  }),
  commands: {
    ...projectSaleHeldCart({
      session,
      saleItems,
      customerId,
      selectedPriceType,
    }).commands,
    load: recovery.load,
    persist: autosave.persist,
    cancelScheduled: autosave.cancelScheduled,
  },
});
