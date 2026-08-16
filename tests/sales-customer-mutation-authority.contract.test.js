import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('POS customer mutation authority', () => {
  it('serializes customer create/update and emits ADS action outcomes', () => {
    const source = read('src/features/sales/create/components/CustomerSection.jsx');

    expect(source).toContain("import { feedback } from '@/design-system'");
    expect(source).toContain('const customerMutationRef = useRef(false)');
    expect(source).toContain('const customerMutationBusy = Boolean(customerMutationAction) || customerMutationRef.current');
    expect(source).toContain('if (!(selectedCustomer && selectedCustomer.id) || customerMutationRef.current) return');
    expect(source).toContain('if (customerMutationRef.current) return');
    expect(source).toContain("setCustomerMutationAction('update')");
    expect(source).toContain("setCustomerMutationAction('create')");
    expect(source).toContain("`sales:customer:${customerIdSnapshot}:update:success`");
    expect(source).toContain("`sales:customer:${customerIdSnapshot}:update:error`");
    expect(source).toContain("`sales:customer:${newCustomer.id}:create:success`");
    expect(source).toContain("'sales:customer:create:error'");
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
  });

  it('shows mutation progress and blocks conflicting customer controls', () => {
    const source = read('src/features/sales/create/components/CustomerSection.jsx');

    expect(source).toContain("customerMutationAction === 'update' ? 'กำลังอัปเดต...' : 'อัปเดตข้อมูลลูกค้า'");
    expect(source).toContain("customerMutationAction === 'create' ? 'กำลังบันทึก...' : 'บันทึกลูกค้าใหม่'");
    expect(source).toContain('disabled={!isModified || customerMutationBusy}');
    expect(source).toContain('disabled={customerMutationBusy}');
    expect(source).toContain('if (customerMutationRef.current) return;\n    setAddressDetail');
  });
});
