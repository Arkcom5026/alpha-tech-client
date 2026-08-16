import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Refund financial mutation authority', () => {
  it('owns the refund boundary synchronously and snapshots financial inputs', () => {
    const source = read('src/features/refund/components/RefundForm.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('if (mutationBusy || submittingRef.current) return;');
    expect(source).toContain('const saleReturnIdSnapshot = saleReturn.id;');
    expect(source).toContain('const remainingRefundSnapshot = remainingRefund;');
    expect(source).toContain('const refundData = {');
    expect(source).toContain('submittingRef.current = true;');
    expect(source).toContain('await createRefundAction(refundData);');
  });

  it('keeps server-confirmed success distinct from post-success refresh failure', () => {
    const source = read('src/features/refund/components/RefundForm.jsx');
    const successIndex = source.indexOf('feedback.actionSuccess(');
    const refreshIndex = source.indexOf('await onSuccess?.(result);');
    expect(successIndex).toBeGreaterThan(-1);
    expect(refreshIndex).toBeGreaterThan(successIndex);
    expect(source).toContain('`refund:${saleReturnIdSnapshot}:refresh:error`');
    expect(source).toContain('คืนเงินสำเร็จ แต่รีเฟรชยอดคงเหลือไม่สำเร็จ กรุณารีเฟรชหน้า');
  });

  it('freezes conflicting form controls while the refund boundary is owned', () => {
    const source = read('src/features/refund/components/RefundForm.jsx');
    expect(source).toContain('const mutationBusy = loading || submitting;');
    expect(source).toContain('disabled={mutationBusy}');
    expect(source).toContain('if (submittingRef.current) return;');
    expect(source).toContain("{mutationBusy ? 'กำลังคืนเงิน...' : '✅ ยืนยันการคืนเงิน'}");
  });
});
