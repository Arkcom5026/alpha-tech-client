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

  it('patches the existing serial number endpoint with the legacy payload', async () => {
    const sourceResponse = { ok: true };
    patchMock.mockResolvedValue({ data: sourceResponse });

    const result = await updateSerialNumberApi({
      barcode: 'BC-001',
      serialNumber: 'SN-9',
    });

    expect(patchMock).toHaveBeenCalledWith('/barcodes/update-serial-number', {
      barcode: 'BC-001',
      serialNumber: 'SN-9',
    });
    expect(result).toBe(sourceResponse);
  });

  it('preserves api failures', async () => {
    const error = new Error('request failed');
    patchMock.mockRejectedValue(error);

    await expect(
      updateSerialNumberApi({ barcode: 'BC-001', serialNumber: 'SN-9' })
    ).rejects.toBe(error);
  });
});
