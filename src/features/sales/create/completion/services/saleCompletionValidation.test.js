import { describe, expect, it } from 'vitest'
import { validateSaleCompletion } from './saleCompletionValidation'

const simpleItem = {
  lineType: 'SIMPLE',
  simpleLotId: 3,
  productId: 10,
  quantity: 2,
  quantityAvailable: 3,
}

describe('validateSaleCompletion', () => {
  it('accepts a SIMPLE quantity within the available lot quantity', () => {
    expect(validateSaleCompletion({ saleItems: [simpleItem], saleMode: 'CASH' })).toEqual({ ok: true })
  })

  it('rejects a SIMPLE quantity beyond the available lot quantity', () => {
    expect(validateSaleCompletion({
      saleItems: [{ ...simpleItem, quantity: 4 }],
      saleMode: 'CASH',
    })).toMatchObject({ ok: false, code: 'SIMPLE_LOT_NOT_SELLABLE' })
  })
})
