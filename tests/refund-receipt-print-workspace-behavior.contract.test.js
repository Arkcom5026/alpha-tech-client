import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('refund receipt print workspace behavior contract', () => {
  const page = read('src/features/refund/pages/PrintRefundReceiptPage.jsx');

  it('keeps sale-return loading scoped to the route id through the current store authority', () => {
    expect(page).toContain('const { saleReturnId } = useParams()');
    expect(page).toContain('getSaleReturnByIdAction');
    expect(page).toContain('getSaleReturnByIdAction(saleReturnId)');
    expect(page).toContain('setSaleReturn(result)');
  });

  it('preserves the current branch presentation source before authority modernization', () => {
    expect(page).toContain("useEmployeeStore from '@/features/employee/store/employeeStore'");
    expect(page).toContain('const { branch } = useEmployeeStore()');
    expect(page).toContain("branch?.name || '-'");
    expect(page).toContain("branch?.taxId || '-'");
  });

  it('preserves loading and browser print behavior', () => {
    expect(page).toContain('if (!saleReturn)');
    expect(page).toContain('กำลังโหลด...');
    expect(page).toContain('window.print()');
    expect(page).toContain('print:hidden');
  });

  it('preserves refund aggregation and remaining-amount semantics', () => {
    expect(page).toContain('refundTransaction.reduce');
    expect(page).toContain('(r.amount || 0)');
    expect(page).toContain('const remainingAmount = totalRefund - totalAmount - deductedAmount');
    expect(page).toContain('totalRefund.toFixed(2)');
    expect(page).toContain('remainingAmount.toFixed(2)');
  });

  it('preserves sale, customer, and refund transaction identity presentation', () => {
    expect(page).toContain("sale?.customer?.name || '-'");
    expect(page).toContain("sale?.code || '-'");
    expect(page).toContain('refundTransaction.map');
    expect(page).toContain('r.refundedAt');
    expect(page).toContain('r.method');
    expect(page).toContain("r.note || '-'");
  });

  it('keeps the current printable refund receipt surface intact before extraction', () => {
    expect(page).toContain('ใบรับเงินคืน');
    expect(page).toContain('ยอดสินค้าที่ต้องคืน');
    expect(page).toContain('ยอดที่คืนไปแล้ว');
    expect(page).toContain('ยอดที่หักไว้');
    expect(page).toContain('ยอดคงเหลือที่ต้องคืน');
    expect(page).toContain('รวมเป็นเงินทั้งสิ้น');
    expect(page).toContain('โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานการคืนเงิน');
  });
});
