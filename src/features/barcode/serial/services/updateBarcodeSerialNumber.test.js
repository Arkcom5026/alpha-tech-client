import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateSerialNumberApiMock = vi.fn();

vi.mock('../api/updateSerialNumberApi', () => ({
  updateSerialNumberApi: updateSerialNumberApiMock,
}));

const { updateBarcodeSerialNumber } = await import('./updateBarcodeSerialNumber');

describe('updateBarcodeSerialNumber', () => {
  beforeEach(() => {
    updateSerialNumberApiMock.mockReset();
  });

  it('normalizes input before calling the serial api', async () => {
    const sourceResponse = { ok: true };
    updateSerialNumberApiMock.mockResolvedValue(sourceResponse);

    const result = await updateBarcodeSerialNumber({
      barcode: ' BC-001 ',
      serialNumber: ' SN-9 ',
    });

    expect(updateSerialNumberApiMock).toHaveBeenCalledWith({
      barcode: 'BC-001',
      serialNumber: 'SN-9',
    });
    expect(result).toEqual({ sourceResponse });
  });

  it('does not call the api when barcode is missing', async () => {
    await expect(updateBarcodeSerialNumber({ serialNumber: 'SN-9' })).rejects.toThrow(
      'Missing barcode'
    );
    expect(updateSerialNumberApiMock).not.toHaveBeenCalled();
  });

  it('preserves api failures for the legacy recovery boundary', async () => {
    const error = new Error('serial update failed');
    updateSerialNumberApiMock.mockRejectedValue(error);

    await expect(
      updateBarcodeSerialNumber({ barcode: 'BC-001', serialNumber: 'SN-9' })
    ).rejects.toBe(error);
  });
});
