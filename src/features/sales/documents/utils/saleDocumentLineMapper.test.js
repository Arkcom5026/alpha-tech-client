import { describe, expect, it } from 'vitest'
import { buildCanonicalSaleDocumentLines } from './saleDocumentLineMapper'

describe('buildCanonicalSaleDocumentLines', () => {
  it('joins legacy stock and SIMPLE lines without losing the quantity-based total', () => {
    const lines = buildCanonicalSaleDocumentLines({
      saleItems: [{ id: 1, price: 120, stockItem: { id: 10, product: { name: 'Serial' } } }],
      simpleItems: [{ id: 2, quantity: 3, price: 90, product: { name: 'Simple' } }],
    })

    expect(lines).toEqual([
      expect.objectContaining({ lineType: 'STOCK_ITEM', productName: 'Serial', quantity: 1, unitPrice: 120, lineTotal: 120 }),
      expect.objectContaining({ lineType: 'SIMPLE', productName: 'Simple', quantity: 3, unitPrice: 90, lineTotal: 270 }),
    ])
  })

  it('uses canonical saleLines and keeps an explicit line total authoritative', () => {
    const lines = buildCanonicalSaleDocumentLines({
      saleLines: [{ id: 3, lineType: 'SIMPLE', quantity: 2, unitPrice: 50, lineTotal: 95, product: { name: 'Discounted simple' } }],
      simpleItems: [{ id: 4, quantity: 9, price: 999 }],
    })

    expect(lines).toEqual([
      expect.objectContaining({ id: 3, lineType: 'SIMPLE', quantity: 2, unitPrice: 50, lineTotal: 95 }),
    ])
  })
})
