import { beforeEach, describe, expect, it, vi } from 'vitest';

const patchMock = vi.fn();

vi.mock('@/utils/apiClient', () => ({
  default: {
    patch: patchMock,
  },
}));

const { updateSerialNumberApi } = await import('./updateSerialNumberApi');

describe('updateSerialNumberApi', () => {
  beforeEach(() => {
    patchMock.mockReset();
  });

  it('patches the stock-item serial endpoint with a normalized payload', async () => {
    const sourceResponse = { ok: true };
    patchMock.mockResolvedValue({ data: sourceResponse });

    const result = await updateSerialNumberApi({
      barcode: ' BC-001 ',
      serialNumber: ' SN-9 ',
    });

    expect(patchMock).toHaveBeenCalledWith('/stock-items/update-sn/BC-001', {
      serialNumber: 'SN-9',
    });
    expect(result).toBe(sourceResponse);
  });

  it('normalizes an empty serial number to null', async () => {
    patchMock.mockResolvedValue({ data: { ok: true } });

    await updateSerialNumberApi({ barcode: 'BC-001', serialNumber: '   ' });

    expect(patchMock).toHaveBeenCalledWith('/stock-items/update-sn/BC-001', {
      serialNumber: null,
    });
  });

  it('preserves api failures', async () => {
    const error = new Error('request failed');
    patchMock.mockRejectedValue(error);

    await expect(
      updateSerialNumberApi({ barcode: 'BC-001', serialNumber: 'SN-9' })
    ).rejects.toBe(error);
  });
});
