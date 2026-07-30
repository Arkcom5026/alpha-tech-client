import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/getReceiptsReadyToScanApi', () => ({
  getReceiptsReadyToScanSnApi: vi.fn(),
  getReceiptsReadyToScanApi: vi.fn(),
}));

import {
  getReceiptsReadyToScanApi,
  getReceiptsReadyToScanSnApi,
} from '../api/getReceiptsReadyToScanApi';
import {
  listReceiptsReadyToScan,
  listReceiptsReadyToScanSn,
} from './listReceiptsReadyToScan';

describe('scan receipt listing services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and projects SN-ready receipts', async () => {
    const response = { data: [{ id: 11 }] };
    getReceiptsReadyToScanSnApi.mockResolvedValue(response);

    await expect(listReceiptsReadyToScanSn()).resolves.toEqual({
      receipts: [{ id: 11 }],
      sourceResponse: response,
    });
    expect(getReceiptsReadyToScanSnApi).toHaveBeenCalledTimes(1);
  });

  it('loads and projects all scan-ready receipts', async () => {
    const response = [{ id: 12 }];
    getReceiptsReadyToScanApi.mockResolvedValue(response);

    await expect(listReceiptsReadyToScan()).resolves.toEqual({
      receipts: response,
      sourceResponse: response,
    });
    expect(getReceiptsReadyToScanApi).toHaveBeenCalledTimes(1);
  });

  it('propagates API errors for store recovery', async () => {
    const error = new Error('scan listing unavailable');
    getReceiptsReadyToScanApi.mockRejectedValue(error);

    await expect(listReceiptsReadyToScan()).rejects.toBe(error);
  });
});
