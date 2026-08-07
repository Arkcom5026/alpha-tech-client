import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('refund receipt print workspace presentation contract', () => {
  const state = read('src/features/refund/print/workspace/components/RefundReceiptPrintState.jsx');
  const toolbar = read('src/features/refund/print/workspace/components/RefundReceiptPrintToolbar.jsx');
  const shell = read('src/features/refund/print/workspace/components/RefundReceiptPrintShell.jsx');
  const presentation = `${state}\n${toolbar}\n${shell}`;

  it('keeps extracted print workspace components free of runtime ownership', () => {
    expect(presentation).not.toContain('useParams');
    expect(presentation).not.toContain('useSaleReturnStore');
    expect(presentation).not.toContain('useEmployeeStore');
    expect(presentation).not.toContain('getSaleReturnByIdAction');
    expect(presentation).not.toContain('window.print()');
    expect(presentation).not.toContain('useEffect');
  });

  it('preserves loading presentation', () => {
    expect(state).toContain('กำลังโหลด...');
    expect(state).toContain('p-4');
  });

  it('preserves print control through an explicit intent', () => {
    expect(toolbar).toContain('onPrint');
    expect(toolbar).toContain('พิมพ์');
    expect(toolbar).toContain('print:hidden');
    expect(toolbar).not.toContain('window.print()');
  });

  it('preserves the printable refund receipt surface and policy formatting', () => {
    expect(shell).toContain('formatRefundReceiptMoney');
    expect(shell).toContain('ใบรับเงินคืน');
    expect(shell).toContain('ยอดสินค้าที่ต้องคืน');
    expect(shell).toContain('ยอดที่คืนไปแล้ว');
    expect(shell).toContain('ยอดที่หักไว้');
    expect(shell).toContain('ยอดคงเหลือที่ต้องคืน');
    expect(shell).toContain('รวมเป็นเงินทั้งสิ้น');
    expect(shell).toContain('โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานการคืนเงิน');
    expect(shell).toContain('{toolbar}');
  });
});
