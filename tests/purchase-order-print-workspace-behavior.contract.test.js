import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('purchase order print workspace behavior contract', () => {
  const page = read('src/features/purchaseOrder/print/pages/PrintPurchaseOrderPage.jsx');

  it('preserves branch source-of-truth resolution and branch loading', () => {
    expect(page).toContain('state.employee?.branchId');
    expect(page).toContain('state.selectedBranchId');
    expect(page).toContain('state.branch || state.currentBranch || state.activeBranch || null');
    expect(page).toContain('loadAndSetBranchById');
    expect(page).toContain('Promise.resolve(loadAndSetBranchById(Number(branchId)))');
  });

  it('keeps purchase-order loading scoped to the route id with an alive guard', () => {
    expect(page).toContain('const { id } = useParams()');
    expect(page).toContain('let alive = true');
    expect(page).toContain('getPurchaseOrderById(id)');
    expect(page).toContain('if (alive) setPo(data)');
    expect(page).toContain('alive = false');
  });

  it('preserves browser print and html2pdf download semantics', () => {
    expect(page).toContain('window.print()');
    expect(page).toContain('window.html2pdf');
    expect(page).toContain("filename: `purchase-order-${po.code || po.id || id}.pdf`");
    expect(page).toContain("format: 'a4'");
    expect(page).toContain("orientation: 'portrait'");
  });

  it('preserves loading and missing-purchase-order states', () => {
    expect(page).toContain('if (loading)');
    expect(page).toContain('กำลังโหลด...');
    expect(page).toContain('if (!po)');
    expect(page).toContain('ไม่พบใบสั่งซื้อ');
  });

  it('preserves item and total projection semantics', () => {
    expect(page).toContain('const items = Array.isArray(po.items) ? po.items : []');
    expect(page).toContain('const qty = Number(item?.quantity ?? 0)');
    expect(page).toContain('const cost = Number(item?.costPrice ?? 0)');
    expect(page).toContain('return sum + qty * cost');
    expect(page).toContain('const lineTotal = qty * cost');
    expect(page).toContain("toLocaleString('th-TH'");
  });

  it('keeps the current printable purchase-order surface intact before extraction', () => {
    expect(page).toContain('ใบสั่งซื้อ (Purchase Order)');
    expect(page).toContain('ผู้ขาย (Supplier)');
    expect(page).toContain('ดาวน์โหลด PDF');
    expect(page).toContain('พิมพ์ใบสั่งซื้อ');
    expect(page).toContain('print-area');
    expect(page).toContain('signature-space');
  });
});
