import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from '@/utils/apiClient';
import {
  getReceiptsReadyToScanApi,
  getReceiptsReadyToScanSnApi,
} from './getReceiptsReadyToScanApi';

describe('scan listing API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the primary SN-ready endpoint', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [{ id: 1 }] });

    await expect(getReceiptsReadyToScanSnApi()).resolves.toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/barcodes/receipts-ready-to-scan-sn');
  });

  it('falls back to the legacy SN-ready endpoint only on 404', async () => {
    apiClient.get
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: [{ id: 2 }] });

    await expect(getReceiptsReadyToScanSnApi()).resolves.toEqual([{ id: 2 }]);
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/barcodes/ready-to-scan-sn');
  });

  it('uses the primary all-scan-ready endpoint and its 404 fallback', async () => {
    apiClient.get
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: [{ id: 3 }] });

    await expect(getReceiptsReadyToScanApi()).resolves.toEqual([{ id: 3 }]);
    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/barcodes/receipts-ready-to-scan');
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/barcodes/ready-to-scan');
  });

  it('does not use a fallback for non-404 errors', async () => {
    const error = { response: { status: 500 } };
    apiClient.get.mockRejectedValueOnce(error);

    await expect(getReceiptsReadyToScanApi()).rejects.toBe(error);
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });
});
