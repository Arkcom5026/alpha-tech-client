import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('refund receipt print workspace behavior contract', () => {
  const page = read('src/features/refund/pages/PrintRefundReceiptPage.jsx');
  const policy = read('src/features/refund/print/workspace/policies/refundReceiptPrintPolicy.js');

  it('keeps sale-return loading scoped to the route id through the current store authority', () => {
    expect(page).toContain('const { saleReturnId } = useParams()');
    expect(page).toContain('getSaleReturnByIdAction');
    expect(page).toContain('getSaleReturnByIdAction(saleReturnId)');
    expect(page).toContain('setSaleReturn(result)');
  });

  it('preserves the current branch presentation source before authority modernization', () => {
    expect(page).toContain("useEmployeeStore from '@/features/employee/store/employeeStore'");
    expect(page).toContain('const { branch } = useEmployeeStore()');
    expect(page).toContain('prepareRefundReceiptPrintProjection(saleReturn, branch)');
    expect(policy).toContain("name: branch?.name || '-'");
    expect(policy).toContain("taxId: branch?.taxId || '-'");
  });

  it('preserves loading and browser print behavior', () => {
    expect(page).toContain('if (!saleReturn)');
    expect(page).toContain('กำลังโหลด...');
    expect(page).toContain('window.print()');
    expect(page).toContain('print:hidden');
  });

  it('preserves refund aggregation and remaining-amount semantics across policy ownership', () => {
    expect(page).toContain('prepareRefundReceiptPrintProjection(saleReturn, branch)');
    expect(policy).toContain('refundTransactions.reduce');
    expect(policy).toContain('Number(transaction?.amount || 0)');
    expect(policy).toContain('remainingAmount: totalRefund - totalAmount - deductedAmount');
    expect(page).toContain('formatRefundReceiptMoney(totalRefund)');
    expect(page).toContain('formatRefundReceiptMoney(remainingAmount)');
  });

  it('preserves sale, customer, and refund transaction identity presentation across policy ownership', () => {
    expect(policy).toContain("customerName: source.sale?.customer?.name || '-'");
    expect(policy).toContain("saleCode: source.sale?.code || '-'");
    expect(page).toContain('refundTransactions.map');
    expect(page).toContain('transaction.refundedAt');
    expect(page).toContain('transaction.method');
    expect(page).toContain("transaction.note || '-'");
  });

  it('keeps the current printable refund receipt surface intact across policy ownership', () => {
    expect(page).toContain('ใบรับเงินคืน');
    expect(page).toContain('ยอดสินค้าที่ต้องคืน');
    expect(page).toContain('ยอดที่คืนไปแล้ว');
    expect(page).toContain('ยอดที่หักไว้');
    expect(page).toContain('ยอดคงเหลือที่ต้องคืน');
    expect(page).toContain('รวมเป็นเงินทั้งสิ้น');
    expect(page).toContain('โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานการคืนเงิน');
  });
});
