import { describe, expect, it } from 'vitest';
import {
  buildProductTraceCurrentOwner,
  buildProductTraceEventCounters,
} from '../utils/productTraceInsights';
import { buildOwnershipEntries } from '../components/ProductTraceOwnershipHistory';

const returnEvent = {
  id: 'returned-1',
  type: 'PRODUCT_RETURNED',
  category: 'RETURN',
  title: 'รับคืนสินค้าและคืนเข้าพร้อมขาย',
  occurredAt: '2026-07-23T10:43:00.000Z',
  document: { id: 1, code: 'RT-0001' },
};

const refundEvent = {
  id: 'refund-1',
  type: 'PRODUCT_REFUNDED',
  category: 'RETURN',
  title: 'คืนเงินให้ลูกค้า',
  occurredAt: '2026-07-23T10:43:01.000Z',
  document: { id: 1, code: 'RT-0001' },
};

const soldEvent = {
  id: 'sold-1',
  type: 'PRODUCT_SOLD',
  category: 'SALES',
  title: 'ขายสินค้า',
  occurredAt: '2026-07-20T00:00:00.000Z',
  document: { id: 20, code: 'SL-0001' },
};

describe('Product Trace return projection', () => {
  it('uses branch custody after a completed return even when sale history exists', () => {
    const owner = buildProductTraceCurrentOwner({
      identity: { currentCustody: 'BRANCH', receivedAt: '2026-07-01T00:00:00.000Z' },
      sales: {
        sale: {
          code: 'SL-0001',
          soldAt: '2026-07-20T00:00:00.000Z',
          customer: { name: 'Customer' },
        },
      },
      timeline: [returnEvent, refundEvent],
    });

    expect(owner).toMatchObject({
      type: 'BRANCH',
      name: 'ร้านค้า',
      since: returnEvent.occurredAt,
      documentCode: 'RT-0001',
    });
  });

  it('counts return transition once and does not count refund evidence as another return', () => {
    expect(buildProductTraceEventCounters([returnEvent, refundEvent]).returned).toBe(1);
  });

  it('does not count the word พร้อมขาย in a return title as another sale', () => {
    const counters = buildProductTraceEventCounters([
      soldEvent,
      returnEvent,
      refundEvent,
    ]);

    expect(counters.sold).toBe(1);
    expect(counters.returned).toBe(1);
  });

  it('creates one ownership transition per return document', () => {
    const entries = buildOwnershipEntries({
      identity: { currentCustody: 'BRANCH' },
      timeline: [returnEvent, refundEvent, { ...returnEvent, id: 'returned-duplicate' }],
    });

    expect(entries.filter((entry) => entry.source === 'RT-0001')).toHaveLength(1);
  });
});
