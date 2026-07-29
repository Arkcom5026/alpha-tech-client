import {
  mapHeldCartLinesToSaleItems,
  projectHeldCartWarning,
} from '../services/saleHeldCartRecovery';

export const executeSaleHeldCartLoad = async ({
  heldCartId,
  getHeldCart,
  revalidateHeldCart,
}) => {
  try {
    const [cart, validation] = await Promise.all([
      getHeldCart(heldCartId),
      revalidateHeldCart(heldCartId),
    ]);

    return {
      ok: true,
      cart,
      validation,
      saleItems: mapHeldCartLinesToSaleItems({ cart, validation }),
      customerId: cart?.customerId || null,
      priceType: cart?.priceType || 'retail',
      warning: projectHeldCartWarning(validation),
      error: '',
    };
  } catch (error) {
    return {
      ok: false,
      cart: null,
      validation: null,
      saleItems: [],
      customerId: null,
      priceType: 'retail',
      warning: '',
      error,
    };
  }
};
