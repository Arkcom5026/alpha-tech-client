import { describe, expect, it } from 'vitest';

import { mapSaleSearchItemToCartLine } from '../api/saleItemSearchApi';

describe('POS unified barcode search mapping', () => {
  it('maps an existing StockItem result without changing stock identity', () => {
    const line = mapSaleSearchItemToCartLine({
      type: 'STOCK',
      lineType: 'STOCK_ITEM',
      productId: 99,
      stockItemId: 421,
      simpleLotId: null,
      barcode: 'STOCK-421',
      quantityAvailable: 1,
      status: 'IN_STOCK',
      product: { id: 99, name: 'Serialized Product' },
      prices: { retail: 2500 },
    });

    expect(line).toMatchObject({
      lineId: 'stock-421',
      lineType: 'STOCK_ITEM',
      type: 'STOCK',
      stockItemId: 421,
      simpleLotId: null,
      productId: 99,
      quantity: 1,
      barcode: 'STOCK-421',
      price: 2500,
    });
  });

  it('maps barcode 888888 to Product 3129 and SimpleLot 3', () => {
    const line = mapSaleSearchItemToCartLine({
      type: 'SIMPLE',
      lineType: 'SIMPLE',
      productId: 3129,
      stockItemId: null,
      simpleLotId: 3,
      barcode: '888888',
      quantityAvailable: 9998,
      status: 'ACTIVE',
      product: { id: 3129, name: 'Simple Product 3129' },
      prices: { retail: 100 },
    });

    expect(line).toMatchObject({
      lineId: 'simple-3',
      lineType: 'SIMPLE',
      type: 'SIMPLE',
      stockItemId: null,
      simpleLotId: 3,
      productId: 3129,
      quantity: 1,
      quantityAvailable: 9998,
      barcode: '888888',
      price: 100,
    });
  });

  it('rejects inactive or empty SimpleLot search results before cart insertion', () => {
    const base = {
      type: 'SIMPLE',
      productId: 3129,
      simpleLotId: 3,
      barcode: '888888',
      product: { id: 3129, name: 'Simple Product 3129' },
      prices: { retail: 100 },
    };

    expect(() => mapSaleSearchItemToCartLine({
      ...base,
      status: 'INACTIVE',
      quantityAvailable: 9998,
    })).toThrow('ACTIVE');

    expect(() => mapSaleSearchItemToCartLine({
      ...base,
      status: 'ACTIVE',
      quantityAvailable: 0,
    })).toThrow('ไม่มีจำนวนคงเหลือ');
  });
});
