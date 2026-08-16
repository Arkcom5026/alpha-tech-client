import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Action feedback checkpoint — waves 138-139', () => {
  it('serializes employee edit submission and locks navigation/form while mutating', () => {
    const page = read('src/features/employee/workspaces/EmployeeEditWorkspace.jsx');

    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('if (submitting || submittingRef.current) return');
    expect(page).toContain('const employeeId = id');
    expect(page).toContain('const payload = { ...formData }');
    expect(page).toContain('await updateEmployee(employeeId, payload)');
    expect(page).toContain('const mutationBusy = submitting || submittingRef.current');
    expect(page).toContain('loading={mutationBusy}');
  });

  it('serializes sale return completion against a stable financial command snapshot', () => {
    const page = read('src/features/sales/return/pages/CreateReturnPage.jsx');

    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('const mutationBusy = submitting || submittingRef.current');
    expect(page).toContain('const returnItems = selectedItems.map((item) => ({ ...item }))');
    expect(page).toContain('const refundItems = refunds');
    expect(page).toContain('submittingRef.current = true');
    expect(page).toContain('items: returnItems');
    expect(page).toContain('refunds: refundItems');
    expect(page).toContain('submitting={mutationBusy}');
    expect(page).toContain('คืนสินค้าและคืนเงินสำเร็จแล้ว แต่ยังออกใบลดหนี้ไม่สำเร็จ');
  });
});
