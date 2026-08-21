import { describe, expect, it } from 'vitest';
import {
  buildPersistedDeliveryNoteRevisionItems,
  groupPersistedDeliveryNoteRevisionItems,
} from '../src/features/deliveryNote/print/workspace/policies/deliveryNoteRevisionPresentation';

const authority = {
  deliveryNoteReadAuthority: {
    persistedRevision: true,
    currentRevisionId: 2,
  },
  document: {
    documentNumber: 'DN-SL-022608-0077-R2',
    activeAmount: 1170,
  },
  lines: [
    {
      sourceLineType: 'STOCK',
      sourceLineId: 1,
      description: '32GB Micro SD Card SANDISK Ultra SDSQUNR-032G-GN3MN (100MB/s.)',
      activeQuantity: 1,
      unitAmount: 390,
      activeAmount: 390,
      snapshot: { sourceProductId: 101 },
    },
    {
      sourceLineType: 'STOCK',
      sourceLineId: 2,
      description: '32GB Micro SD Card SANDISK Ultra SDSQUNR-032G-GN3MN (100MB/s.)',
      activeQuantity: 1,
      unitAmount: 390,
      activeAmount: 390,
      snapshot: { sourceProductId: 101 },
    },
    {
      sourceLineType: 'STOCK',
      sourceLineId: 3,
      description: '32GB Micro SD Card SANDISK Ultra SDSQUNR-032G-GN3MN (100MB/s.)',
      activeQuantity: 1,
      unitAmount: 390,
      activeAmount: 390,
      snapshot: { sourceProductId: 101 },
    },
  ],
};

const sale = {
  items: [
    { id: 1, stockItemId: 1001, stockItem: { productId: 101, product: { id: 101, name: 'SANDISK', unit: { name: 'ชิ้น' } } } },
    { id: 2, stockItemId: 1002, stockItem: { productId: 101, product: { id: 101, name: 'SANDISK', unit: { name: 'ชิ้น' } } } },
    { id: 3, stockItemId: 1003, stockItem: { productId: 101, product: { id: 101, name: 'SANDISK', unit: { name: 'ชิ้น' } } } },
  ],
};

describe('Delivery Note Wave 2M persisted revision print grouping', () => {
  it('groups identical serialized revision lines into one printable row', () => {
    const rows = buildPersistedDeliveryNoteRevisionItems({ sale, authority });

    expect(rows).toHaveLength(1);
    expect(rows[0].quantity).toBe(3);
    expect(rows[0].price).toBe(390);
    expect(rows[0].lineAmount).toBe(1170);
    expect(rows[0].saleItemIds).toEqual([1, 2, 3]);
  });

  it('does not merge rows when final unit prices differ', () => {
    const rows = groupPersistedDeliveryNoteRevisionItems([
      {
        productId: 101,
        documentDescription: 'SANDISK',
        unit: 'ชิ้น',
        price: 390,
        quantity: 1,
        lineAmount: 390,
        saleItemIds: [1],
        simpleItemIds: [],
      },
      {
        productId: 101,
        documentDescription: 'SANDISK',
        unit: 'ชิ้น',
        price: 400,
        quantity: 1,
        lineAmount: 400,
        saleItemIds: [2],
        simpleItemIds: [],
      },
    ]);

    expect(rows).toHaveLength(2);
  });

  it('does not merge rows when document descriptions differ', () => {
    const rows = groupPersistedDeliveryNoteRevisionItems([
      {
        productId: 101,
        documentDescription: 'SANDISK A',
        unit: 'ชิ้น',
        price: 390,
        quantity: 1,
        lineAmount: 390,
        saleItemIds: [1],
        simpleItemIds: [],
      },
      {
        productId: 101,
        documentDescription: 'SANDISK B',
        unit: 'ชิ้น',
        price: 390,
        quantity: 1,
        lineAmount: 390,
        saleItemIds: [2],
        simpleItemIds: [],
      },
    ]);

    expect(rows).toHaveLength(2);
  });
});
