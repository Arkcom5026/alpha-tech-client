import { beforeEach, describe, expect, it, vi } from 'vitest';

const receiveStockItemApiMock = vi.fn();

vi.mock('../api/receiveStockItemApi', () => ({
  receiveStockItemApi: receiveStockItemApiMock,
}));

const { receiveScannedStockItem } = await import('./receiveScannedStockItem');

describe('receiveScannedStockItem', () => {
  beforeEach(() => {
    receiveStockItemApiMock.mockReset();
  });

  it('normalizes legacy input before receiving the stock item', async () => {
    const sourceResponse = { stockItem: { id: 1, serialNumber: 'SN-001' } };
    receiveStockItemApiMock.mockResolvedValue(sourceResponse);

    const result = await receiveScannedStockItem({
      barcode: ' BC-001 ',
      serialNumber: ' SN-001 ',
      keepSN: true,
    });

    expect(receiveStockItemApiMock).toHaveBeenCalledWith({
      barcode: { barcode: 'BC-001', serialNumber: 'SN-001' },
      keepSN: true,
    });
    expect(result.stockItem).toBe(sourceResponse.stockItem);
    expect(result.sourceResponse).toBe(sourceResponse);
    expect(result.command.barcode).toBe('BC-001');
  });

  it('supports the legacy positional input contract', async () => {
    receiveStockItemApiMock.mockResolvedValue({ id: 2, barcode: 'BC-002' });

    const result = await receiveScannedStockItem(' BC-002 ', ' SN-002 ');

    expect(receiveStockItemApiMock).toHaveBeenCalledWith({
      barcode: { barcode: 'BC-002', serialNumber: 'SN-002' },
      keepSN: false,
    });
    expect(result.stockItem).toEqual({ id: 2, barcode: 'BC-002' });
  });

  it('preserves receive failures for the store recovery boundary', async () => {
    const error = new Error('receive failed');
    receiveStockItemApiMock.mockRejectedValue(error);

    await expect(receiveScannedStockItem('BC-003')).rejects.toBe(error);
  });
});
