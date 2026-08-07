import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('refund receipt print workspace behavior contract', () => {
  const page = read('src/features/refund/pages/PrintRefundReceiptPage.jsx');
  const shell = read('src/features/refund/print/workspace/components/RefundReceiptPrintShell.jsx');
  const state = read('src/features/refund/print/workspace/components/RefundReceiptPrintState.jsx');
  const toolbar = read('src/features/refund/print/workspace/components/RefundReceiptPrintToolbar.jsx');
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

  it('preserves loading and browser print behavior across workspace ownership', () => {
    expect(page).toContain('if (!saleReturn) return <RefundReceiptPrintState />');
    expect(state).toContain('กำลังโหลด...');
    expect(page).toContain('const handlePrint = () => window.print()');
    expect(page).toContain('<RefundReceiptPrintToolbar onPrint={handlePrint} />');
    expect(toolbar).toContain('print:hidden');
  });

  it('preserves refund aggregation and remaining-amount semantics across policy ownership', () => {
    expect(page).toContain('prepareRefundReceiptPrintProjection(saleReturn, branch)');
    expect(policy).toContain('refundTransactions.reduce');
    expect(policy).toContain('Number(transaction?.amount || 0)');
    expect(policy).toContain('remainingAmount: totalRefund - totalAmount - deductedAmount');
    expect(shell).toContain('formatRefundReceiptMoney(totalRefund)');
    expect(shell).toContain('formatRefundReceiptMoney(remainingAmount)');
  });

  it('preserves sale, customer, and refund transaction identity presentation across workspace ownership', () => {
    expect(policy).toContain("customerName: source.sale?.customer?.name || '-'");
    expect(policy).toContain("saleCode: source.sale?.code || '-'");
    expect(shell).toContain('refundTransactions.map');
    expect(shell).toContain('transaction.refundedAt');
    expect(shell).toContain('transaction.method');
    expect(shell).toContain("transaction.note || '-'");
  });

  it('keeps the current printable refund receipt surface intact across workspace ownership', () => {
    expect(shell).toContain('ใบรับเงินคืน');
    expect(shell).toContain('ยอดสินค้าที่ต้องคืน');
    expect(shell).toContain('ยอดที่คืนไปแล้ว');
    expect(shell).toContain('ยอดที่หักไว้');
    expect(shell).toContain('ยอดคงเหลือที่ต้องคืน');
    expect(shell).toContain('รวมเป็นเงินทั้งสิ้น');
    expect(shell).toContain('โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานการคืนเงิน');
  });
});
