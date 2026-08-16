import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Action Feedback checkpoint Wave 108-116', () => {
  it('locks communication profile save authority', () => {
    const source = read('src/features/communication/pages/CommunicationProfileSettingsPage.jsx');
    expect(source).toContain('useRef');
    expect(source).toContain('savingRef.current');
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
  });

  it('separates repair communication record success from refresh failure', () => {
    const source = read('src/features/repair/components/RepairCommunicationPanel.jsx');
    expect(source).toContain('savingRef.current');
    expect(source).toContain('const refreshResult = await load();');
    expect(source).toContain('บันทึกสำเร็จแล้ว แต่โหลดประวัติการติดต่อล่าสุดไม่สำเร็จ');
    expect(source).toContain('destinationSnapshot: destination || null');
  });

  it('separates expense payee creation from parent selection failure', () => {
    const source = read('src/features/repair/components/ExpensePayeeQuickCreateDialog.jsx');
    expect(source).toContain('const formSnapshot = { ...form };');
    expect(source).toContain('savingRef.current = true;');
    expect(source).toContain('สร้างผู้รับซ่อมสำเร็จแล้ว แต่เลือกใช้งานอัตโนมัติไม่สำเร็จ');
  });

  it('locks customer detail edits while a snapshot is being saved', () => {
    const source = read('src/features/customer/components/workspace/CustomerDetailWorkspace.jsx');
    expect(source).toContain('const customerIdSnapshot = customerId;');
    expect(source).toContain('const editorSnapshot = { ...editor };');
    expect(source).toContain('<fieldset disabled={saving} className="contents">');
    expect(source).toContain('if (!customerId || saving || savingRef.current) return;');
  });

  it('preserves settlement idempotency while serializing the submission snapshot', () => {
    const source = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementCreatePage.jsx');
    expect(source).toContain('const savingRef = useRef(false);');
    expect(source).toContain('const customerIdSnapshot = customerSearch.selectedCustomer.id;');
    expect(source).toContain('const linesSnapshot = selectedLines.map((line) => ({ ...line }));');
    expect(source).toContain('submitKeyRef.current = idempotencyKey;');
  });

  it('serializes admin bank create and delete under one mutation authority', () => {
    const source = read('src/features/admin/components/FormBank.jsx');
    expect(source).toContain('const mutationRef = useRef(false);');
    expect(source).toContain('เพิ่มธนาคารสำเร็จแล้ว แต่รีเฟรชรายการธนาคารไม่สำเร็จ');
    expect(source).toContain('ลบธนาคารสำเร็จแล้ว แต่รีเฟรชรายการธนาคารไม่สำเร็จ');
  });

  it('keeps admin order refresh inside the status mutation lock', () => {
    const source = read('src/features/admin/components/TableOrders.jsx');
    expect(source).toContain('const statusMutationRef = useRef(false);');
    expect(source).toContain('const refreshResult = await handleGetOrder();');
    expect(source).toContain('อัปเดตสถานะสำเร็จแล้ว แต่รีเฟรชรายการคำสั่งซื้อไม่สำเร็จ');
  });

  it('serializes admin user status and role governance under one lock', () => {
    const source = read('src/features/admin/components/TableUsers.jsx');
    expect(source).toContain('const mutationRef = useRef(false);');
    expect(source).toContain('const pendingSnapshot = { ...pendingStatus };');
    expect(source).toContain('อัปเดตสิทธิ์สำเร็จแล้ว แต่รีเฟรชรายการผู้ใช้ไม่สำเร็จ');
  });

  it('serializes admin branch create/delete and keeps refresh failures secondary', () => {
    const source = read('src/features/admin/components/FormBranch.jsx');
    expect(source).toContain('const mutationRef = useRef(false);');
    expect(source).toContain('const formSnapshot = { ...form };');
    expect(source).toContain('const target = { ...pendingDeleteBranch };');
    expect(source).toContain('เพิ่มสาขาสำเร็จแล้ว แต่รีเฟรชรายการสาขาไม่สำเร็จ');
    expect(source).toContain('ลบสาขาสำเร็จแล้ว แต่รีเฟรชรายการสาขาไม่สำเร็จ');
  });
});
