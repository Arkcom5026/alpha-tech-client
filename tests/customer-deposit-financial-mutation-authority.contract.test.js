import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Customer deposit financial mutation authority', () => {
  const source = read('src/features/customerDeposit/components/PaymentSectionDeposit.jsx');

  it('owns the deposit mutation synchronously and exposes render-visible busy state', () => {
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('const mutationBusy = isSubmitting || submitting;');
    expect(source).toContain('if (mutationBusy || submittingRef.current) return;');
    expect(source).toContain('submittingRef.current = true;');
    expect(source).toContain('submittingRef.current = false;');
  });

  it('snapshots customer identity and the financial command before persistence', () => {
    expect(source).toContain('const customerSnapshot = customer');
    expect(source).toContain('const command = {');
    expect(source).toContain('customerId: customerSnapshot?.id');
    expect(source).toContain('await createCustomerDepositAction(command);');
    expect(source).toContain('totalAmount: total');
  });

  it('keeps post-success refresh failure separate from deposit failure', () => {
    expect(source).toContain("'บันทึกเงินมัดจำเรียบร้อยแล้ว'");
    expect(source).toContain('await loadCustomerDepositByPhoneAction(customerSnapshot.phone);');
    expect(source).toContain('refresh-after-create:error');
    expect(source).toContain('บันทึกเงินมัดจำสำเร็จแล้ว แต่โหลดยอดล่าสุดไม่สำเร็จ');
    expect(source).toContain(`customer-deposit:${'${customerSnapshot.id}'}:create:error`);
  });

  it('freezes the payment editor while the financial boundary is owned', () => {
    expect(source.match(/disabled=\{mutationBusy\}/g)?.length || 0).toBeGreaterThanOrEqual(3);
    expect(source).toContain("{mutationBusy ? 'กำลังบันทึก...' : 'บันทึกเงินมัดจำ'}");
  });
});
