import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Action feedback checkpoint — waves 119-123', () => {
  it('serializes supplier create and edit/delete interactions at the workspace boundary', () => {
    const createPage = read('src/features/supplier/workspace/SupplierCreateWorkspace.jsx');
    const editPage = read('src/features/supplier/workspace/SupplierEditWorkspace.jsx');

    expect(createPage).toContain('const mutationRef = useRef(false)');
    expect(createPage).toContain('if (loading || mutationRef.current) return');
    expect(createPage).toContain('const payload = normalizeSupplierMutationPayload(formData)');
    expect(createPage).toContain('loading={mutationBusy}');

    expect(editPage).toContain('const mutationRef = useRef(false)');
    expect(editPage).toContain('if (mutationBusy) return');
    expect(editPage).toContain('const supplierId = id');
    expect(editPage).toContain('await deleteSupplierAction(supplierId)');
    expect(editPage).toContain('loading={mutationBusy}');
  });

  it('keeps printer settings mutations locked through post-save refresh', () => {
    const page = read('src/features/printing/settings/PrinterSettingsPanel.jsx');

    expect(page).toContain('const actionRef = useRef(false)');
    expect(page).toContain('allowDuringMutation = false');
    expect(page).toContain('reportError = true');
    expect(page).toContain('actionRef.current = true');
    expect(page).toContain('load({ allowDuringMutation: true, reportError: false })');
    expect(page).toContain('บันทึกเครื่องพิมพ์สำเร็จแล้ว แต่โหลดสถานะล่าสุดไม่สำเร็จ');
    expect(page).toContain('ล้างการตั้งค่าสำเร็จแล้ว แต่โหลดสถานะล่าสุดไม่สำเร็จ');
  });

  it('serializes online customer profile persistence and separates post-save callback failure', () => {
    const form = read('src/features/online/order/components/CustomerInfoForm.jsx');

    expect(form).toContain('const savingRef = useRef(false)');
    expect(form).toContain('const payload = { ...form }');
    expect(form).toContain('feedback.actionSuccess(');
    expect(form).toContain('online-customer-profile:post-save:error');
    expect(form).toContain('disabled = false');
    expect(form).toContain('fieldset disabled={interactionBusy}');
  });

  it('locks checkout cart/profile interactions against the submitted order snapshot', () => {
    const checkout = read('src/features/online/order/pages/CheckoutPage.jsx');

    expect(checkout).toContain('const submitRef = useRef(false)');
    expect(checkout).toContain('const interactionBusy = isSubmitting || submitRef.current');
    expect(checkout).toContain('const payload = {');
    expect(checkout).toContain('submitRef.current = true');
    expect(checkout).toContain('disabled={interactionBusy}');
    expect(checkout).toContain('<CustomerInfoForm disabled={interactionBusy} />');
  });

  it('serializes tax period mutations and reports refresh failure separately from mutation success', () => {
    const page = read('src/features/tax/periods/pages/TaxPeriodManagementPage.jsx');

    expect(page).toContain('const mutationRef = useRef(false)');
    expect(page).toContain('const interactionBusy = Boolean(busyKey) || mutationRef.current');
    expect(page).toContain('loadData({ reportError: false })');
    expect(page).toContain('const targetBranchId = branchId');
    expect(page).toContain('const taxPeriodId = period.id');
    expect(page).toContain('อัปเดตสถานะรอบภาษีสำเร็จแล้ว แต่โหลดข้อมูลล่าสุดไม่สำเร็จ');
  });
});
