import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Tax document print authority and controls contract', () => {
  it('keeps short and full tax document route intent distinct', () => {
    const routeResolver = read('src/features/sales/documents/saleDocumentRoute.js');
    const salesRoutes = read('src/routes/partner/salesRoutes.jsx');
    const listPage = read('src/features/bill/pages/PrintBillListPage.jsx');

    expect(routeResolver).toContain("option === 'TAX_DOCUMENT_SHORT'");
    expect(routeResolver).toContain('tax-document/print-short');
    expect(routeResolver).toContain("option === 'TAX_DOCUMENT_FULL'");
    expect(routeResolver).toContain('tax-document/print-full');

    expect(salesRoutes).toContain('tax-document/print-short/:taxDocumentId');
    expect(salesRoutes).toContain('expectedDocumentType="SHORT_TAX_INVOICE"');
    expect(salesRoutes).toContain('tax-document/print-full/:taxDocumentId');
    expect(salesRoutes).toContain('expectedDocumentType="FULL_TAX_INVOICE"');

    expect(listPage).toContain('../tax-document/print-full/');
    expect(listPage).toContain('../tax-document/print-short/');
  });

  it('fails closed when the requested tax format does not match document authority', () => {
    const printPage = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx');

    expect(printPage).toContain("actualDocumentType === 'SHORT_TAX_INVOICE'");
    expect(printPage).toContain("actualDocumentType === 'FULL_TAX_INVOICE'");
    expect(printPage).toContain('expectedDocumentType && actualDocumentType !== expectedDocumentType');
    expect(printPage).toContain('ระบบจะไม่เปลี่ยนชนิดเอกสารภาษีด้วยการเปลี่ยนรูปแบบหน้าพิมพ์');
  });

  it('provides explicit print controls without printing the controls themselves', () => {
    const printPage = read('src/features/combinedBilling/pages/PrintConsolidatedTaxPage.jsx');

    expect(printPage).toContain('window.print()');
    expect(printPage).toContain('print:hidden');
    expect(printPage).toContain('ย้อนกลับ');
    expect(printPage).toContain('พิมพ์');
    expect(printPage).toContain('w-[80mm]');
    expect(printPage).toContain('<FullTaxA4Document');
  });

  it('labels the selector as statutory tax document formats', () => {
    const toolbar = read('src/features/bill/components/workspace/BillSearchToolbar.jsx');

    expect(toolbar).toContain('ใบกำกับภาษีอย่างย่อ');
    expect(toolbar).toContain('ใบกำกับภาษีเต็มรูป');
    expect(toolbar).toContain('authority ของเอกสารจริง');
  });
});
