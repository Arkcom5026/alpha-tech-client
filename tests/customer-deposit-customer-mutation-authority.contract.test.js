import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Customer Deposit customer mutation authority', () => {
  it('serializes customer create/update and emits ADS action outcomes', () => {
    const source = read('src/features/customerDeposit/components/CustomerSelectorDeposit.jsx');

    expect(source).toContain('const customerMutationRef = useRef(false)');
    expect(source).toContain('if (!selectedCustomer?.id || customerMutationRef.current) return');
    expect(source).toContain('if (customerMutationRef.current) return');
    expect(source).toContain("setCustomerMutationAction('update')");
    expect(source).toContain("setCustomerMutationAction('create')");
    expect(source).toContain("'customer-deposit:customer:${customerIdSnapshot}:update:success'");
    expect(source).toContain("'customer-deposit:customer:${customerIdSnapshot}:update:error'");
    expect(source).toContain("'customer-deposit:customer:${newCustomer.id}:create:success'");
    expect(source).toContain("'customer-deposit:customer:create:error'");
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
    expect(source).not.toContain("feedback.success('อัปเดตข้อมูลลูกค้าสำเร็จ')");
    expect(source).not.toContain("feedback.success('สร้างลูกค้าใหม่สำเร็จ')");
  });

  it('exposes a visible mutation busy state and freezes conflicting controls', () => {
    const source = read('src/features/customerDeposit/components/CustomerSelectorDeposit.jsx');

    expect(source).toContain('const customerMutationBusy = Boolean(customerMutationAction) || customerMutationRef.current');
    expect(source).toContain("customerMutationAction === 'update' ? 'กำลังอัปเดต...' : 'อัปเดตข้อมูล'");
    expect(source).toContain("customerMutationAction === 'create' ? 'กำลังบันทึก...' : 'บันทึกลูกค้าใหม่'");
    expect(source).toContain('disabled={!isModified || customerMutationBusy}');
    expect(source).toContain('disabled={customerMutationBusy}');
  });
});
