import { describe, expect, it } from 'vitest'
import {
  clampSimpleQuantity,
  incrementSimpleQuantity,
  isSimpleSaleLine,
} from './saleCartQuantityPolicy'

describe('sale cart quantity policy', () => {
  const simpleItem = { lineType: 'SIMPLE', quantity: 1, quantityAvailable: 3 }

  it('allows SIMPLE quantity increments only up to the available lot quantity', () => {
    expect(incrementSimpleQuantity(simpleItem)).toEqual({ quantity: 2, limited: false, available: 3 })
    expect(incrementSimpleQuantity({ ...simpleItem, quantity: 3 })).toEqual({ quantity: 3, limited: true, available: 3 })
  })

  it('clamps manual SIMPLE quantities to a positive available quantity', () => {
    expect(clampSimpleQuantity(simpleItem, 9)).toEqual({ quantity: 3, limited: true, available: 3 })
    expect(clampSimpleQuantity(simpleItem, 0)).toEqual({ quantity: 1, limited: true, available: 3 })
  })

  it('keeps serial stock lines outside the quantity-increment policy', () => {
    expect(isSimpleSaleLine({ lineType: 'STOCK_ITEM' })).toBe(false)
  })
})
