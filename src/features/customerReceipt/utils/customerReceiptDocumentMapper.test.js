import { describe, expect, it } from 'vitest'
import { buildCustomerReceiptLineItems } from './customerReceiptDocumentMapper'

describe('buildCustomerReceiptLineItems', () => {
  it('includes SIMPLE products when the receipt response uses legacy line fields', () => {
    const lines = buildCustomerReceiptLineItems([
      {
        id: 1,
        sale: {
          code: 'SL-001',
          saleItems: [
            {
              id: 10,
              price: 120,
              stockItem: { product: { name: 'สินค้า Serial', unit: { name: 'ชิ้น' } } },
            },
          ],
          simpleItems: [
            {
              id: 20,
              quantity: 3,
              price: 90,
              product: { name: 'สินค้า SIMPLE', unit: { name: 'กล่อง' } },
            },
          ],
        },
      },
    ])

    expect(lines).toHaveLength(2)
    expect(lines[1]).toMatchObject({
      productName: 'สินค้า SIMPLE',
      quantity: 3,
      unit: 'กล่อง',
      unitPrice: 90,
      amount: 270,
    })
  })

  it('prefers canonical saleLines when supplied by the API', () => {
    const lines = buildCustomerReceiptLineItems([
      {
        id: 2,
        sale: {
          code: 'SL-002',
          saleLines: [
            {
              id: 30,
              quantity: 2,
              price: 50,
              product: { name: 'สินค้า SIMPLE จาก saleLines', unit: { name: 'ชิ้น' } },
            },
          ],
          items: [{ id: 31, price: 999 }],
        },
      },
    ])

    expect(lines).toEqual([
      expect.objectContaining({
        productName: 'สินค้า SIMPLE จาก saleLines',
        quantity: 2,
        unitPrice: 50,
        amount: 100,
      }),
    ])
  })
})
