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
})
