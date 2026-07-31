import { describe, expect, it } from 'vitest';
import {
  projectStockItemReceiveCommand,
  projectStockItemReceiveResult,
} from './stockItemReceiveProjection';

describe('stock item receive projection', () => {
  it('projects a plain barcode into the legacy simple payload', () => {
    expect(projectStockItemReceiveCommand('  BC-001  ')).toEqual({
      barcode: 'BC-001',
      serialNumber: '',
      keepSN: false,
      payload: { barcode: 'BC-001' },
    });
  });

  it('supports the legacy positional serial number argument', () => {
    expect(projectStockItemReceiveCommand('BC-002', '  SN-002  ').payload).toEqual({
      barcode: { barcode: 'BC-002', serialNumber: 'SN-002' },
      keepSN: false,
    });
  });

  it('supports object and nested barcode inputs without changing payload shape', () => {
    expect(
      projectStockItemReceiveCommand({
        barcode: { barcode: ' BC-003 ', serialNumber: ' SN-003 ', keepSN: true },
      }).payload
    ).toEqual({
      barcode: { barcode: 'BC-003', serialNumber: 'SN-003' },
      keepSN: true,
    });
  });

  it('preserves keepSN with no serial number', () => {
    expect(projectStockItemReceiveCommand({ barcode: 'BC-004', keepSN: true }).payload).toEqual({
      barcode: { barcode: 'BC-004' },
      keepSN: true,
    });
  });

  it('rejects missing barcodes', () => {
    expect(() => projectStockItemReceiveCommand({ barcode: '   ' })).toThrow('Missing barcode');
  });

  it('preserves source response while exposing the received stock item', () => {
    const sourceResponse = { stockItem: { id: 10, barcode: 'BC-010' }, ok: true };
    expect(projectStockItemReceiveResult(sourceResponse)).toEqual({
      stockItem: sourceResponse.stockItem,
      sourceResponse,
    });
  });
});
