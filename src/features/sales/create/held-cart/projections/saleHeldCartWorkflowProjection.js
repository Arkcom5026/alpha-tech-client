import { projectSaleHeldCart } from './saleHeldCartProjection';

export const projectSaleHeldCartWorkflow = ({
  session,
  autosave,
  recovery,
  saleItems,
  customerId,
  selectedPriceType,
}) => {
  const base = projectSaleHeldCart({
    session,
    saleItems,
    customerId,
    selectedPriceType,
  });

  return {
    ...base,
    commands: {
      ...base.commands,
      load: recovery.load,
      persist: autosave.persist,
      cancelScheduled: autosave.cancelScheduled,
      setValidation: session.setValidation,
    },
  };
};
