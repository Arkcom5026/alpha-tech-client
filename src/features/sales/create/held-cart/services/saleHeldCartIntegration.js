import {
  mapHeldCartLinesToSaleItems,
  projectHeldCartWarning,
} from './saleHeldCartRecovery';

export const buildHeldCartRestoreResult = ({ cart, validation }) => ({
  cart,
  validation,
  saleItems: mapHeldCartLinesToSaleItems({ cart, validation }),
  selectedPriceType: cart?.priceType || 'retail',
  customerId: cart?.customerId || null,
  warning: projectHeldCartWarning(validation),
});

export const canRemoveSaleItemFromHeldCart = ({ activeHeldCart, itemCount }) => {
  if (!activeHeldCart?.id) return true;
  return Number(itemCount) > 1;
};

export const projectHeldCartCompletionGuard = (validation) => {
  if (!validation) return { ready: true, error: null, code: null };
  if (validation.ready) return { ready: true, error: null, code: null };
  return {
    ready: false,
    error: 'ใบพักมีสินค้าที่ไม่พร้อมขาย กรุณาลบหรือเลือกสินค้าทดแทน',
    code: 'HELD_CART_ITEM_UNAVAILABLE',
  };
};
