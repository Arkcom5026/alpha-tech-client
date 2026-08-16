import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  clearPrintableSalesRequestCache,
  runPrintableSalesRequest,
} from '../src/features/sales/history/api/printableRequestCoordinator';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const collectSourceFiles = (directory) => {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(absolutePath));
      continue;
    }
    if (/\.(?:js|jsx|ts|tsx)$/.test(entry.name)) results.push(absolutePath);
  }
  return results;
};

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

  it('does not let an invalidated in-flight result repopulate the recent cache', async () => {
    let resolveOldRequest;
    const oldRequest = vi.fn(() => new Promise((resolve) => {
      resolveOldRequest = resolve;
    }));
    const freshRequest = vi.fn(async () => [{ id: 2026 }]);
    const params = { fromDate: '2026-08-16', toDate: '2026-08-16', limit: 100 };

    const oldPending = runPrintableSalesRequest(params, oldRequest);
    await Promise.resolve();
    clearPrintableSalesRequestCache();
    resolveOldRequest([{ id: 1013 }]);
    await oldPending;

    await expect(runPrintableSalesRequest(params, freshRequest)).resolves.toEqual([{ id: 2026 }]);
    expect(freshRequest).toHaveBeenCalledTimes(1);
  });

  it('keeps one canonical printable transport and no residual cache-busting caller', () => {
    const transportPath = 'src/features/sales/history/api/printableSalesTransport.js';
    const transport = read(transportPath);
    const historyApi = read('src/features/sales/history/api/saleHistoryApi.js');
    const legacyApi = read('src/features/sales/api/saleApi.js');
    const dashboardApi = read('src/features/sales/history/dashboard/api/salesDashboardApi.js');
    const documentSearchApi = read('src/features/sales/documents/search/api/saleDocumentSearchApi.js');

    expect(transport).toContain("requestPrintableSales('/sales/printable', params)");
    expect(transport).toContain("requestPrintableSales('/sales/printable-sales', params)");
    expect(transport).not.toContain('_ts');
    expect(historyApi).toContain('runPrintableSalesRequest(params, fetchPrintableSalesTransport)');
    expect(legacyApi).toContain('export const searchPrintableSales = searchPrintableSalesFromHistory;');
    expect(legacyApi).not.toContain("apiClient.get('/sales/printable'");
    expect(dashboardApi).toContain("from '../../api/saleHistoryApi'");
    expect(documentSearchApi).toContain("from '@/features/sales/history/api/saleHistoryApi'");

    const sourceRoot = path.join(root, 'src');
    const printableTransportOwners = collectSourceFiles(sourceRoot)
      .filter((filePath) => read(path.relative(root, filePath)).includes("'/sales/printable'"))
      .map((filePath) => path.relative(root, filePath).replaceAll('\\', '/'));

    expect(printableTransportOwners).toEqual([transportPath]);
  });
});
