import { describe, expect, it } from 'vitest';
import {
  buildPersistedDeliveryNoteRevisionItems,
  groupPersistedDeliveryNoteRevisionItems,
} from '../src/features/deliveryNote/print/workspace/policies/deliveryNoteRevisionPresentation';

const productionShapedAuthority = {
  deliveryNoteReadAuthority: {
    persistedRevision: true,
    currentRevisionId: 2,
  },
  document: {
    documentNumber: 'DN-SL-022608-0077-R2',
    activeAmount: 1170,
  },
  lines: [1, 2, 3].map((sourceLineId) => ({
    sourceLineType: 'STOCK',
    sourceLineId,
    description: '32GB Micro SD Card SANDISK Ultra SDSQUNR-032G-GN3MN (100MB/s.)',
    activeQuantity: 1,
    unitAmount: 390,
    activeAmount: 390,
    snapshot: {},
  })),
};

describe('Delivery Note Wave 2N production-shaped print grouping fallback', () => {
  it('groups identical persisted revision lines even when productId is absent', () => {
    const rows = buildPersistedDeliveryNoteRevisionItems({
      sale: { items: [] },
      authority: productionShapedAuthority,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].quantity).toBe(3);
    expect(rows[0].price).toBe(390);
    expect(rows[0].lineAmount).toBe(1170);
    expect(rows[0].saleItemIds).toEqual([1, 2, 3]);
  });

  it('keeps unknown rows separate when neither product identity nor description exists', () => {
    const rows = groupPersistedDeliveryNoteRevisionItems([
      { productId: null, documentDescription: '', productName: '', unit: 'ชิ้น', price: 390, quantity: 1, lineAmount: 390 },
      { productId: null, documentDescription: '', productName: '', unit: 'ชิ้น', price: 390, quantity: 1, lineAmount: 390 },
    ]);

    expect(rows).toHaveLength(2);
  });

  it('still keeps different descriptions separate without productId', () => {
    const rows = groupPersistedDeliveryNoteRevisionItems([
      { productId: null, documentDescription: 'SANDISK A', productName: 'SANDISK A', unit: 'ชิ้น', price: 390, quantity: 1, lineAmount: 390 },
      { productId: null, documentDescription: 'SANDISK B', productName: 'SANDISK B', unit: 'ชิ้น', price: 390, quantity: 1, lineAmount: 390 },
    ]);

    expect(rows).toHaveLength(2);
  });
});
