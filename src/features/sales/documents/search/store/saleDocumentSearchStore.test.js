import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/saleDocumentSearchApi', () => ({
  searchSaleDocuments: vi.fn(),
}));

import { searchSaleDocuments } from '../api/saleDocumentSearchApi';
import useSaleDocumentSearchStore from './saleDocumentSearchStore';

const billPolicy = {
  id: 'BILL',
  isEligible: () => true,
  projectRow: (sale) => sale,
};

const deliveryPolicy = {
  id: 'DELIVERY_NOTE',
  isEligible: () => true,
  projectRow: (sale) => sale,
};

const deferred = () => {
  let resolve;
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
};

afterEach(() => {
  vi.clearAllMocks();
  useSaleDocumentSearchStore.getState().reset();
});

describe('sale document search store', () => {
  it('clears the prior workspace rows while a new document policy is loading', async () => {
    const pending = deferred();
    searchSaleDocuments.mockReturnValueOnce(pending.promise);

    const search = useSaleDocumentSearchStore.getState().search({ policy: billPolicy });

    expect(useSaleDocumentSearchStore.getState()).toMatchObject({
      rows: [],
      loading: true,
      activePolicyId: 'BILL',
    });

    pending.resolve([{ id: 1 }]);
    await search;
    expect(useSaleDocumentSearchStore.getState().rows).toEqual([{ id: 1 }]);

    const nextPending = deferred();
    searchSaleDocuments.mockReturnValueOnce(nextPending.promise);
    const nextSearch = useSaleDocumentSearchStore.getState().search({ policy: deliveryPolicy });

    expect(useSaleDocumentSearchStore.getState()).toMatchObject({
      rows: [],
      loading: true,
      activePolicyId: 'DELIVERY_NOTE',
    });

    nextPending.resolve([]);
    await nextSearch;
  });

  it('does not let an earlier response overwrite the newer policy result', async () => {
    const firstPending = deferred();
    const secondPending = deferred();
    searchSaleDocuments
      .mockReturnValueOnce(firstPending.promise)
      .mockReturnValueOnce(secondPending.promise);

    const firstSearch = useSaleDocumentSearchStore.getState().search({ policy: billPolicy });
    const secondSearch = useSaleDocumentSearchStore.getState().search({ policy: deliveryPolicy });

    secondPending.resolve([{ id: 'delivery' }]);
    await secondSearch;
    firstPending.resolve([{ id: 'bill' }]);
    await firstSearch;

    expect(useSaleDocumentSearchStore.getState()).toMatchObject({
      rows: [{ id: 'delivery' }],
      loading: false,
      activePolicyId: 'DELIVERY_NOTE',
    });
  });
});
