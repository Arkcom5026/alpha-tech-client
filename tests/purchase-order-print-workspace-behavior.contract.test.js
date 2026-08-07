import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('purchase order print workspace behavior contract', () => {
  const page = read('src/features/purchaseOrder/print/pages/PrintPurchaseOrderPage.jsx');
  const policy = read('src/features/purchaseOrder/print/workspace/policies/purchaseOrderPrintPolicy.js');
  const state = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintState.jsx');
  const toolbar = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintToolbar.jsx');
  const shell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx');
  const workspace = `${page}\n${policy}\n${state}\n${toolbar}\n${shell}`;

  it('preserves branch source-of-truth resolution and branch loading', () => {
    expect(page).toContain('state.employee?.branchId');
    expect(page).toContain('state.selectedBranchId');
    expect(page).toContain('state.branch || state.currentBranch || state.activeBranch || null');
    expect(page).toContain('resolvePurchaseOrderBranchId');
    expect(policy).toContain('selectedBranchId ??');
    expect(policy).toContain('branchDetail?.id ??');
    expect(policy).toContain('branchDetail?.branchId ??');
    expect(policy).toContain('authBranchId ??');
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

  it('preserves loading and missing-purchase-order states across workspace ownership', () => {
    expect(page).toContain('if (loading) return <PurchaseOrderPrintState status="loading" />');
    expect(page).toContain('if (!po) return <PurchaseOrderPrintState status="missing" />');
    expect(state).toContain('กำลังโหลด...');
    expect(state).toContain('ไม่พบใบสั่งซื้อ');
  });

  it('preserves item and total projection semantics across policy ownership', () => {
    expect(page).toContain('preparePurchaseOrderPrintProjection(po)');
    expect(policy).toContain('Array.isArray(po?.items) ? po.items : []');
    expect(policy).toContain('const quantity = Number(item?.quantity ?? 0)');
    expect(policy).toContain('const costPrice = Number(item?.costPrice ?? 0)');
    expect(policy).toContain('lineTotal: quantity * costPrice');
    expect(policy).toContain('const total = lines.reduce');
    expect(workspace).toContain("toLocaleString('th-TH'");
  });

  it('keeps the current printable purchase-order surface intact across workspace ownership', () => {
    expect(page).toContain('<PurchaseOrderPrintToolbar');
    expect(page).toContain('<PurchaseOrderPrintShell');
    expect(shell).toContain('ใบสั่งซื้อ (Purchase Order)');
    expect(shell).toContain('ผู้ขาย (Supplier)');
    expect(toolbar).toContain('ดาวน์โหลด PDF');
    expect(toolbar).toContain('พิมพ์ใบสั่งซื้อ');
    expect(shell).toContain('print-area');
    expect(shell).toContain('signature-space');
  });
});
