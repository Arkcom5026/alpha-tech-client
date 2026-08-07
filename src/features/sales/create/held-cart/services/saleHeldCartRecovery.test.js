import { describe, expect, it } from 'vitest'
import { mapHeldCartLinesToSaleItems } from './saleHeldCartRecovery'

describe('mapHeldCartLinesToSaleItems', () => {
  it('preserves the current available quantity from held-cart validation', () => {
    const [item] = mapHeldCartLinesToSaleItems({
      cart: {
        lines: [{
          lineKey: 'simple-3',
          lineType: 'SIMPLE',
          simpleLotId: 3,
          productId: 10,
          quantity: 2,
          unitPrice: 50,
        }],
      },
      validation: {
        lines: [{ lineKey: 'simple-3', available: true, quantityAvailable: 8 }],
      },
    })

    expect(item).toMatchObject({ quantity: 2, quantityAvailable: 8 })
  })

  it('restores positive and negative price adjustment evidence', () => {
    const [increased, reduced] = mapHeldCartLinesToSaleItems({
      cart: {
        lines: [
          {
            lineKey: 'stock-1',
            lineType: 'STOCK_ITEM',
            stockItemId: 1,
            productId: 11,
            quantity: 1,
            unitPrice: 10000,
            priceAdjustment: 500,
            finalPrice: 10500,
            adjustmentReason: 'ค่าบริการเพิ่มเติม',
          },
          {
            lineKey: 'simple-2',
            lineType: 'SIMPLE',
            simpleLotId: 2,
            productId: 12,
            quantity: 2,
            unitPrice: 100,
            priceAdjustment: -20,
            finalPrice: 180,
            adjustmentReason: 'ราคาพิเศษ',
          },
        ],
      },
      validation: null,
    })

    expect(increased).toMatchObject({
      priceAdjustment: 500,
      sellingPrice: 10500,
      discount: 0,
      adjustmentReason: 'ค่าบริการเพิ่มเติม',
    })
    expect(reduced).toMatchObject({
      priceAdjustment: -20,
      sellingPrice: 180,
      discount: 20,
      adjustmentReason: 'ราคาพิเศษ',
    })
  })

  it('keeps legacy held-cart discounts readable as negative adjustments', () => {
    const [item] = mapHeldCartLinesToSaleItems({
      cart: {
        lines: [{
          lineKey: 'stock-legacy',
          lineType: 'STOCK_ITEM',
          stockItemId: 9,
          productId: 19,
          quantity: 1,
          unitPrice: 1000,
          discount: 100,
        }],
      },
      validation: null,
    })

    expect(item.priceAdjustment).toBe(-100)
    expect(item.sellingPrice).toBe(900)
  })
})
