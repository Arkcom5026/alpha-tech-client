import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('purchase order print workspace presentation contract', () => {
  const state = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintState.jsx');
  const toolbar = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintToolbar.jsx');
  const shell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx');
  const combined = `${state}\n${toolbar}\n${shell}`;

  it('keeps extracted print workspace components free of runtime ownership', () => {
    expect(combined).not.toContain('useBranchStore');
    expect(combined).not.toContain('useAuthStore');
    expect(combined).not.toContain('getPurchaseOrderById');
    expect(combined).not.toContain('useParams');
    expect(combined).not.toContain('useEffect');
    expect(combined).not.toContain('window.print');
    expect(combined).not.toContain('window.html2pdf');
  });

  it('preserves loading and missing purchase-order presentation', () => {
    expect(state).toContain('กำลังโหลด...');
    expect(state).toContain('ไม่พบใบสั่งซื้อ');
  });

  it('preserves print and pdf controls through explicit intents', () => {
    expect(toolbar).toContain('onClick={onPrint}');
    expect(toolbar).toContain('onClick={onDownloadPdf}');
    expect(toolbar).toContain('พิมพ์ใบสั่งซื้อ');
    expect(toolbar).toContain('ดาวน์โหลด PDF');
  });

  it('preserves the printable purchase-order surface and policy formatting', () => {
    expect(shell).toContain('print-area');
    expect(shell).toContain('ใบสั่งซื้อ (Purchase Order)');
    expect(shell).toContain('ผู้ขาย (Supplier)');
    expect(shell).toContain('ไม่มีรายการสินค้า');
    expect(shell).toContain('formatPurchaseOrderMoney');
    expect(shell).toContain('รวมทั้งสิ้น');
    expect(shell).toContain('signature-space');
  });
});
