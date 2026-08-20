import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Tax document print authority and controls contract', () => {
  it('keeps dedicated issued tax-document routes distinct', () => {
    const routeResolver = read('src/features/sales/documents/saleDocumentRoute.js');
    const salesRoutes = read('src/routes/partner/salesRoutes.jsx');

    expect(routeResolver).toContain("option === 'TAX_DOCUMENT_SHORT'");
    expect(routeResolver).toContain('tax-document/print-short');
    expect(routeResolver).toContain("option === 'TAX_DOCUMENT_FULL'");
    expect(routeResolver).toContain('tax-document/print-full');

    expect(salesRoutes).toContain('tax-document/print-short/:taxDocumentId');
    expect(salesRoutes).toContain('expectedDocumentType="SHORT_TAX_INVOICE"');
    expect(salesRoutes).toContain('tax-document/print-full/:taxDocumentId');
    expect(salesRoutes).toContain('expectedDocumentType="FULL_TAX_INVOICE"');
    expect(salesRoutes).toContain("path: 'tax-document/print/:taxDocumentId'");
  });

  it('keeps sale print-format routing while dispatching issued tax rows to tax authority', () => {
    const listPage = read('src/features/bill/pages/PrintBillListPage.jsx');

    expect(listPage).toContain('../bill/print-full/');
    expect(listPage).toContain('../bill/print-short/');
    expect(listPage).toContain("TAX_DOCUMENT_SOURCE_TYPE = 'TAX_DOCUMENT'");
    expect(listPage).toContain("navigate(`../tax-document/print/${sourceId}`)");
    expect(listPage).toContain('finance/tax-intake?taxDocumentId=');
    expect(listPage).not.toContain('if (row.taxDocumentId)');
    expect(listPage).not.toContain('../tax-document/print-full/${row.taxDocumentId}');
    expect(listPage).not.toContain('../tax-document/print-short/${row.taxDocumentId}');
  });

  it('fails closed only inside dedicated issued tax-document printing', () => {
    const printPage = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx');

    expect(printPage).toContain("actualDocumentType === 'SHORT_TAX_INVOICE'");
    expect(printPage).toContain("actualDocumentType === 'FULL_TAX_INVOICE'");
    expect(printPage).toContain('expectedDocumentType && actualDocumentType !== expectedDocumentType');
    expect(printPage).toContain('ระบบจะไม่เปลี่ยนชนิดเอกสารภาษีด้วยการเปลี่ยนรูปแบบหน้าพิมพ์');
  });

  it('provides explicit issued-tax print controls without printing the controls themselves', () => {
    const printPage = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx');

    expect(printPage).toContain('window.print()');
    expect(printPage).toContain('print:hidden');
    expect(printPage).toContain('ย้อนกลับ');
    expect(printPage).toContain('พิมพ์');
    expect(printPage).toContain('w-[80mm]');
    expect(printPage).toContain('<FullTaxA4Document');
  });

  it('explains the selector as a legacy sale print-format choice, not tax-document authority', () => {
    const toolbar = read('src/features/bill/components/workspace/BillSearchToolbar.jsx');

    expect(toolbar).toContain('พิมพ์รายการขายแบบย่อ');
    expect(toolbar).toContain('พิมพ์รายการขายแบบเต็ม');
    expect(toolbar).toContain('ตัวเลือกนี้ใช้กับรายการขาย/ใบเสร็จเดิมเท่านั้น');
    expect(toolbar).toContain('เอกสารภาษีที่ออกเลขแล้วจะพิมพ์ตามชนิดเอกสารจริงโดยอัตโนมัติ');
  });

  it('keeps full-tax line content vertically centered within each table row', () => {
    const fullTaxPage = read('src/features/bill/pages/PrintBillPageFullTax.jsx');

    expect(fullTaxPage).toContain('.full-tax-print-shell .full-tax-a4-page tbody td');
    expect(fullTaxPage).toContain('vertical-align: middle !important;');
  });
});
