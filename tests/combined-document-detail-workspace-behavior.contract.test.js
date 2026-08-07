import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('combined document detail workspace behavior contract', () => {
  const page = read('src/features/combinedBilling/pages/CombinedDocumentDetailPage.jsx');

  it('keeps document loading scoped to the route id through the combined billing store', () => {
    expect(page).toContain('const { id } = useParams()');
    expect(page).toContain('fetchDocumentById');
    expect(page).toContain('if (id)');
    expect(page).toContain('fetchDocumentById(id)');
  });

  it('preserves loading, error, and missing-document states', () => {
    expect(page).toContain('if (isLoadingDetail)');
    expect(page).toContain('กำลังโหลดข้อมูลเอกสาร');
    expect(page).toContain('if (errorDetail)');
    expect(page).toContain('เกิดข้อผิดพลาด:');
    expect(page).toContain('if (!documentDetail)');
    expect(page).toContain('ไม่พบข้อมูลเอกสาร');
  });

  it('preserves browser printing and return navigation', () => {
    expect(page).toContain('window.print()');
    expect(page).toContain('to="/billing/combine"');
    expect(page).toContain('พิมพ์เอกสาร');
  });

  it('preserves customer and document identity projection', () => {
    expect(page).toContain('documentDetail.sales?.[0]?.customer');
    expect(page).toContain('documentDetail.code');
    expect(page).toContain("new Date(documentDetail.issueDate).toLocaleDateString('th-TH')");
    expect(page).toContain("customer?.taxId || 'N/A'");
  });

  it('preserves combined sale rows and monetary formatting', () => {
    expect(page).toContain('documentDetail.sales.map');
    expect(page).toContain('sale.officialDocumentNumber ||');
    expect(page).toContain("new Date(sale.soldAt).toLocaleDateString('th-TH')");
    expect(page).toContain("sale.totalAmount.toLocaleString('en-US'");
    expect(page).toContain("documentDetail.totalAmount.toLocaleString('en-US'");
  });

  it('keeps the current printable invoice surface intact before presentation extraction', () => {
    expect(page).toContain('ใบแจ้งหนี้ / INVOICE');
    expect(page).toContain('สรุปรายการใบส่งของที่รวมในเอกสารนี้');
    expect(page).toContain('ผู้จัดทำ:');
    expect(page).toContain('print:hidden');
    expect(page).toContain('font-sarabun');
  });
});
