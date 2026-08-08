import { describe, expect, it } from 'vitest';

import { projectSalePaymentCalculation } from './salePaymentCalculation';

describe('sale payment calculation', () => {
  it('includes positive price adjustments in the amount due', () => {
    const result = projectSalePaymentCalculation({
      saleItems: [
        { lineType: 'STOCK_ITEM', price: 150, priceAdjustment: 0 },
        { lineType: 'STOCK_ITEM', price: 3500, priceAdjustment: 100 },
      ],
    });

    expect(result).toMatchObject({
      totalOriginalPrice: 3650,
      totalPriceAdjustment: 100,
      totalDiscountOnly: 0,
      totalToPay: 3750,
    });
  });

  it('keeps reductions and bill discounts separate without double subtraction', () => {
    const result = projectSalePaymentCalculation({
      saleItems: [
        { lineType: 'STOCK_ITEM', price: 1000, priceAdjustment: -100, discountWithoutBill: 100 },
        { lineType: 'STOCK_ITEM', price: 2000, priceAdjustment: 300, discountWithoutBill: 0 },
      ],
      billDiscount: 50,
    });

    expect(result).toMatchObject({
      totalOriginalPrice: 3000,
      totalPriceAdjustment: 200,
      totalDiscountOnly: 100,
      totalDiscount: 150,
      totalToPay: 3150,
    });
  });

  it('multiplies simple-product unit price by quantity', () => {
    const result = projectSalePaymentCalculation({
      saleItems: [
        { lineType: 'SIMPLE', price: 250, quantity: 3, priceAdjustment: 50 },
      ],
    });

    expect(result).toMatchObject({
      totalOriginalPrice: 750,
      totalPriceAdjustment: 50,
      totalToPay: 800,
    });
  });

  it('preserves legacy discount-only lines when no explicit adjustment exists', () => {
    const result = projectSalePaymentCalculation({
      saleItems: [
        { lineType: 'STOCK_ITEM', price: 500, discount: 50 },
      ],
    });

    expect(result).toMatchObject({
      totalOriginalPrice: 500,
      totalPriceAdjustment: -50,
      totalDiscountOnly: 50,
      totalToPay: 450,
    });
  });
});
