import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('position-first employee authority UI contract', () => {
  it('makes position the capability configuration surface without removing compatibility yet', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const createWorkspace = read('src/features/position/workspace/CreatePositionWorkspace.jsx');
    const editWorkspace = read('src/features/position/workspace/EditPositionWorkspace.jsx');

    expect(form).toContain("const EMPLOYEE_MANAGE_CAPABILITY = 'employee.manage'");
    expect(form).toContain("WORKFLOW: 'repair.workflow'");
    expect(form).toContain("PARTS: 'repair.parts'");
    expect(form).toContain("HANDOVER: 'repair.handover'");
    expect(form).toContain("CUSTOMER_OVERRIDE: 'repair.customer-override'");
    expect(form).toContain("ADJUST: 'inventory.adjust'");
    expect(form).toContain("TRANSFER: 'inventory.transfer'");
    expect(form).toContain("AUDIT: 'inventory.audit'");
    expect(form).toContain("AUDIT_FINALIZE: 'inventory.audit.finalize'");
    expect(form).toContain("RECEIVE: 'inventory.receive'");
    expect(form).toContain("LIFECYCLE: 'inventory.lifecycle'");
    expect(form).toContain("QUICK_STOCK: 'inventory.quick-stock'");
    expect(form).toContain("QUICK_RECEIPT: 'inventory.quick-receipt'");
    expect(form).toContain("QUICK_RECEIPT_FINALIZE: 'inventory.quick-receipt.finalize'");
    expect(form).toContain("PURCHASE_ORDER: 'procurement.purchase-order'");
    expect(form).toContain("PURCHASE_ORDER_CONTROL: 'procurement.purchase-order.control'");
    expect(form).toContain("SUPPLIER_PAYMENT_READ: 'procurement.supplier-payment.read'");
    expect(form).toContain("SUPPLIER_PAYMENT_MANAGE: 'procurement.supplier-payment.manage'");
    expect(form).toContain("SUPPLIER_PAYMENT_VOID: 'procurement.supplier-payment.void'");
    expect(form).toContain("RECEIPT: 'procurement.receipt'");
    expect(form).toContain("RECEIPT_FINALIZE: 'procurement.receipt.finalize'");
    expect(form).toContain('งานซ่อมและเคลม');
    expect(form).toContain('ดำเนินขั้นตอนงานซ่อม');
    expect(form).toContain('จัดการอะไหล่ในงานซ่อม');
    expect(form).toContain('ส่งมอบงานซ่อม');
    expect(form).toContain('อนุญาตรับงานกรณีเจ้าของอุปกรณ์ไม่ตรง');
    expect(form).toContain('สต๊อกและการเคลื่อนไหวสินค้า');
    expect(form).toContain('ปรับยอดสต๊อก');
    expect(form).toContain('โอนสต๊อกระหว่างสาขา');
    expect(form).toContain('ตรวจนับสต๊อก');
    expect(form).toContain('ยืนยันหรือยกเลิกรอบตรวจนับ');
    expect(form).toContain('รับสินค้าเข้าสต๊อก');
    expect(form).toContain('จัดการสถานะรายการสต๊อก');
    expect(form).toContain('เพิ่มสต๊อกด่วน');
    expect(form).toContain('จัดทำใบรับสินค้าด่วน');
    expect(form).toContain('ยืนยันหรือยกเลิกใบรับสินค้าด่วน');
    expect(form).toContain('จัดซื้อและใบรับสินค้า');
    expect(form).toContain('จัดทำใบสั่งซื้อ');
    expect(form).toContain('ควบคุมสถานะหรือลบใบสั่งซื้อ');
    expect(form).toContain('ดูข้อมูลการชำระ Supplier');
    expect(form).toContain('จัดการการชำระ Supplier');
    expect(form).toContain('ยกเลิกรายการชำระ Supplier');
    expect(form).toContain('จัดทำใบรับสินค้าจาก PO');
    expect(form).toContain('ยืนยันหรือลบใบรับสินค้า');
    expect(form).toContain('CAPABILITY_GROUPS.map');
    expect(form).toContain('สิทธิ์ของตำแหน่งงาน');
    expect(form).toContain('เริ่มใช้สิทธิ์จากตำแหน่งนี้');
    expect(form).toContain('v2Role จะคงไว้เป็นชั้นรองรับของระบบเดิมระหว่างการย้าย');
    expect(form).toContain('payload.capabilities = capabilities');

    expect(createWorkspace).toContain("capabilities: Array.isArray(payload?.capabilities) ? payload.capabilities : []");
    expect(createWorkspace).toContain("initialValues={{ name: '', description: '', capabilities: [] }}");

    expect(editWorkspace).toContain('if (Array.isArray(payload?.capabilities))');
    expect(editWorkspace).toContain('capabilities: Array.isArray(current?.capabilities) ? current.capabilities : null');
  });
});
