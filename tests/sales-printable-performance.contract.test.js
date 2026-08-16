import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPrintableSalesRequestCache,
  runPrintableSalesRequest,
} from '../src/features/sales/history/api/printableRequestCoordinator';

describe('Sales printable performance contract', () => {
  beforeEach(() => {
    clearPrintableSalesRequestCache();
  });

  it('shares one in-flight request for identical printable parameters', async () => {
    let resolveRequest;
    const request = vi.fn(() => new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const params = {
      keyword: '',
      fromDate: '2026-07-17',
      toDate: '2026-08-16',
      limit: 100,
      onlyPaid: 1,
    };

    const first = runPrintableSalesRequest(params, request);
    const second = runPrintableSalesRequest({ ...params }, request);

    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(1);
    resolveRequest([{ id: 1013 }]);

    await expect(first).resolves.toEqual([{ id: 1013 }]);
    await expect(second).resolves.toEqual([{ id: 1013 }]);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('reuses a recent identical result and strips cache-busting params', async () => {
    const request = vi.fn(async (queryParams) => ({ queryParams }));
    const params = {
      keyword: '',
      fromDate: '2026-07-17',
      toDate: '2026-08-16',
      limit: 100,
      onlyPaid: 1,
      _ts: 123,
    };

    const first = await runPrintableSalesRequest(params, request);
    const second = await runPrintableSalesRequest({ ...params, _ts: 456 }, request);

    expect(request).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first.queryParams).not.toHaveProperty('_ts');
    expect(first.queryParams).not.toHaveProperty('forceRefresh');
  });

  it('supports explicit refresh and cache invalidation after sale mutations', async () => {
    const request = vi.fn(async () => [{ id: request.mock.calls.length }]);
    const params = { fromDate: '2026-08-16', toDate: '2026-08-16', limit: 100 };

    await runPrintableSalesRequest(params, request);
    await runPrintableSalesRequest({ ...params, forceRefresh: true }, request);
    clearPrintableSalesRequestCache();
    await runPrintableSalesRequest(params, request);

    expect(request).toHaveBeenCalledTimes(3);
  });
});
