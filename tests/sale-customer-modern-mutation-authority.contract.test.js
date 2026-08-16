import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Modern POS customer mutation authority', () => {
  it('serializes store-backed create/update and emits ADS action outcomes', () => {
    const source = read('src/features/sales/create/customer/SaleCustomerSection.jsx');

    expect(source).toContain("import { feedback } from '@/design-system'");
    expect(source).toContain('const customerMutationRef = useRef(false)');
    expect(source).toContain('if (!selectedCustomer?.id || customerMutationRef.current) return');
    expect(source).toContain('const payloadSnapshot = { ...editor.createPayload }');
    expect(source).toContain("setCustomerMutationAction('create')");
    expect(source).toContain("setCustomerMutationAction('update')");
    expect(source).toContain("`sales:customer:${created.id}:create:success`");
    expect(source).toContain("'sales:customer:create:error'");
    expect(source).toContain("`sales:customer:${customerIdSnapshot}:update:success`");
    expect(source).toContain("`sales:customer:${customerIdSnapshot}:update:error`");
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
  });

  it('freezes the details editor while a mutation owns the customer boundary', () => {
    const section = read('src/features/sales/create/customer/SaleCustomerSection.jsx');
    const form = read('src/features/sales/create/customer/components/SaleCustomerDetailsForm.jsx');

    expect(section).toContain('disabled={customerMutationBusy}');
    expect(section).toContain('mutationAction={customerMutationAction}');
    expect(form).toContain('disabled={!isModified || disabled}');
    expect(form).toContain("mutationAction === 'update' ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'");
    expect(form).toContain("mutationAction === 'create' ? 'กำลังเพิ่มลูกค้า...' : 'เพิ่มลูกค้าใหม่'");
    expect(form).toContain('if (disabled) return');
  });
});
