import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('combined document detail workspace behavior contract', () => {
  const page = read('src/features/combinedBilling/pages/CombinedDocumentDetailPage.jsx');
  const state = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentState.jsx');
  const toolbar = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentToolbar.jsx');
  const shell = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentInvoiceShell.jsx');

  it('keeps document loading scoped to the route id through the combined billing store', () => {
    expect(page).toContain('const { id } = useParams()');
    expect(page).toContain('fetchDocumentById');
    expect(page).toContain('if (id)');
    expect(page).toContain('fetchDocumentById(id)');
  });

  it('preserves loading, error, and missing-document states', () => {
    expect(page).toContain('<CombinedDocumentState status="loading"');
    expect(page).toContain('<CombinedDocumentState status="error"');
    expect(page).toContain('<CombinedDocumentState status="empty"');
    expect(state).toContain('กำลังโหลดข้อมูลเอกสาร');
    expect(state).toContain('เกิดข้อผิดพลาด:');
    expect(state).toContain('ไม่พบข้อมูลเอกสาร');
  });

  it('preserves browser printing and return navigation', () => {
    expect(page).toContain('window.print()');
    expect(page).toContain("navigate('/billing/combine')");
    expect(page).toContain('onBack={handleBack}');
    expect(page).toContain('onPrint={handlePrint}');
    expect(toolbar).toContain('กลับไปหน้ารวมบิล');
    expect(toolbar).toContain('พิมพ์เอกสาร');
  });

  it('preserves customer and document identity projection', () => {
    expect(page).toContain('documentDetail.sales?.[0]?.customer');
    expect(page).toContain('documentDetail={documentDetail}');
    expect(page).toContain('customer={customer}');
    expect(shell).toContain('documentDetail.code');
    expect(shell).toContain('formatDate(documentDetail.issueDate)');
    expect(shell).toContain("customer?.taxId || 'N/A'");
  });

  it('preserves combined sale rows and monetary formatting', () => {
    expect(shell).toContain('(documentDetail.sales || []).map');
    expect(shell).toContain('sale.officialDocumentNumber ||');
    expect(shell).toContain('formatDate(sale.soldAt)');
    expect(shell).toContain('formatMoney(sale.totalAmount)');
    expect(shell).toContain('formatMoney(documentDetail.totalAmount)');
  });

  it('keeps the current printable invoice surface intact across workspace ownership', () => {
    expect(shell).toContain('ใบแจ้งหนี้ / INVOICE');
    expect(shell).toContain('สรุปรายการใบส่งของที่รวมในเอกสารนี้');
    expect(shell).toContain('ผู้จัดทำ:');
    expect(toolbar).toContain('print:hidden');
    expect(shell).toContain('font-sarabun');
  });
});
