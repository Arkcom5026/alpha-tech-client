import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();

vi.mock('@/utils/apiClient', () => ({
  default: { post: postMock },
}));

const { receiveStockItemApi } = await import('./receiveStockItemApi');

describe('receiveStockItemApi', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it('posts the receive payload to the stock item receive endpoint', async () => {
    const payload = {
      barcode: { barcode: 'BC-001', serialNumber: 'SN-001' },
      keepSN: true,
    };
    const data = { stockItem: { id: 1 } };
    postMock.mockResolvedValue({ data });

    await expect(receiveStockItemApi(payload)).resolves.toBe(data);
    expect(postMock).toHaveBeenCalledWith('/stock-items/receive-sn', payload);
  });

  it('preserves transport failures', async () => {
    const error = new Error('receive failed');
    postMock.mockRejectedValue(error);

    await expect(receiveStockItemApi({ barcode: 'BC-002' })).rejects.toBe(error);
  });
});
