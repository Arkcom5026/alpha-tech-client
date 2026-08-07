import { describe, expect, it } from 'vitest'
import {
  normalizePriceAdjustmentInput,
  projectSaleLinePrice,
  summarizeSalePriceAdjustments,
} from './salePriceAdjustmentPolicy'

describe('sale price adjustment policy', () => {
  it('supports both reductions and increases without mutating base price', () => {
    expect(normalizePriceAdjustmentInput({ basePrice: 10000, adjustment: -500 })).toEqual({
      ok: true,
      basePrice: 10000,
      priceAdjustment: -500,
      finalPrice: 9500,
      discount: 500,
    })

    expect(normalizePriceAdjustmentInput({ basePrice: 10000, adjustment: 500 })).toEqual({
      ok: true,
      basePrice: 10000,
      priceAdjustment: 500,
      finalPrice: 10500,
      discount: 0,
    })
  })

  it('rejects invalid and below-zero final prices', () => {
    expect(normalizePriceAdjustmentInput({ basePrice: 100, adjustment: -101 }).code).toBe('FINAL_PRICE_BELOW_ZERO')
    expect(normalizePriceAdjustmentInput({ basePrice: 100, adjustment: 'abc' }).code).toBe('INVALID_PRICE_ADJUSTMENT')
  })

  it('keeps old discount lines compatible', () => {
    expect(projectSaleLinePrice({ price: 1000, discount: 100 })).toMatchObject({
      ok: true,
      basePrice: 1000,
      priceAdjustment: -100,
      finalPrice: 900,
      discount: 100,
    })
  })

  it('summarizes mixed increases and reductions canonically', () => {
    expect(summarizeSalePriceAdjustments([
      { price: 1000, priceAdjustment: -100 },
      { price: 2000, priceAdjustment: 300 },
    ])).toMatchObject({
      ok: true,
      totalBeforeAdjustment: 3000,
      totalPriceAdjustment: 200,
      totalDiscount: 100,
      totalAmount: 3200,
    })
  })
})
