import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildReceiptItems } from '../src/features/bill/utils/receiptGrouping.js';
import { prepareDeliveryNoteSaleItems } from '../src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('sale adjusted total document E2E contract', () => {
  const persistedSale = {
    totalAmount: 3750,
    items: [
      {
        id: 11,
        stockItemId: 101,
        product: { id: 1, name: 'Serialized item', unit: { name: 'เครื่อง' } },
        quantity: 1,
        basePrice: 150,
        price: 150,
        discount: 0,
      },
      {
        id: 12,
        stockItemId: 102,
        product: { id: 2, name: 'Adjusted item', unit: { name: 'เครื่อง' } },
        quantity: 1,
        basePrice: 3500,
        price: 3600,
        discount: 0,
      },
    ],
    simpleItems: [],
  };

  it('keeps bill line amounts equal to persisted final sale line amounts', () => {
    const billRows = buildReceiptItems([
      { id: 11, productId: 1, quantity: 1, amount: 150, productName: 'Serialized item' },
      { id: 12, productId: 2, quantity: 1, amount: 3600, productName: 'Adjusted item' },
    ]);

    expect(billRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)).toBe(3750);
  });

  it('keeps delivery-note line amounts equal to the same persisted sale total', () => {
    const deliveryRows = prepareDeliveryNoteSaleItems(persistedSale);
    const total = deliveryRows.reduce(
      (sum, row) => sum + Number(row.price || 0) * Number(row.quantity || 0),
      0
    );

    expect(total).toBe(3750);
  });

  it('keeps multi-quantity simple items as whole-line persistence with derived final unit price', () => {
    const simpleSale = {
      totalAmount: 210,
      simpleItems: [
        {
          id: 21,
          product: { id: 3, name: 'Simple item', unit: { name: 'ชิ้น' } },
          quantity: 2,
          basePrice: 200,
          price: 210,
          discount: 0,
        },
      ],
    };

    const deliveryRows = prepareDeliveryNoteSaleItems(simpleSale);
    expect(deliveryRows).toHaveLength(1);
    expect(deliveryRows[0].quantity).toBe(2);
    expect(deliveryRows[0].price).toBe(105);
    expect(deliveryRows[0].price * deliveryRows[0].quantity).toBe(210);

    const billRows = buildReceiptItems([
      { id: 21, productId: 3, quantity: 2, amount: 210, productName: 'Simple item' },
    ]);
    expect(billRows[0].amount).toBe(210);
    expect(billRows[0].quantity).toBe(2);
  });

  it('keeps browser bill totals authoritative from Sale.totalAmount', () => {
    const fullBill = read('src/features/bill/components/BillLayoutFullTax.jsx');
    const shortBill = read('src/features/bill/components/BillLayoutShortTax.jsx');
    const billStore = read('src/features/bill/store/billStore.js');

    expect(fullBill).toContain('sale?.totalAmount');
    expect(shortBill).toContain('sale?.totalAmount');
    expect(fullBill).toContain('buildReceiptItems');
    expect(shortBill).toContain('buildReceiptItems');
    expect(billStore).toContain('item?.price ?? item?.amount ?? 0');
  });
});
