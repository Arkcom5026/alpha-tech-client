import { describe, expect, it } from 'vitest';
import {
  projectStockItemReceiveCommand,
  projectStockItemReceiveResult,
} from './stockItemReceiveProjection';

describe('stock item receive projection', () => {
  it('projects a plain barcode without a serial number', () => {
    expect(projectStockItemReceiveCommand('  BC-001  ')).toEqual({
      barcode: 'BC-001',
      serialNumber: null,
      keepSN: false,
      payload: { barcode: 'BC-001' },
    });
  });

  it('normalizes the positional serial number argument into a serial-preserving payload', () => {
    expect(projectStockItemReceiveCommand('BC-002', '  SN-002  ').payload).toEqual({
      barcode: { barcode: 'BC-002', serialNumber: 'SN-002' },
      keepSN: true,
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

  it('does not preserve a serial-number flag when no serial number exists', () => {
    expect(projectStockItemReceiveCommand({ barcode: 'BC-004', keepSN: true })).toEqual({
      barcode: 'BC-004',
      serialNumber: null,
      keepSN: false,
      payload: { barcode: 'BC-004' },
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
