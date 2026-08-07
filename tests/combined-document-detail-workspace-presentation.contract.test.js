import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('combined document detail workspace presentation contract', () => {
  const state = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentState.jsx');
  const toolbar = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentToolbar.jsx');
  const shell = read('src/features/combinedBilling/detail/workspace/components/CombinedDocumentInvoiceShell.jsx');
  const combined = `${state}\n${toolbar}\n${shell}`;

  it('keeps extracted workspace components presentation-only', () => {
    expect(combined).not.toContain('useCombinedBillingStore');
    expect(combined).not.toContain('fetchDocumentById');
    expect(combined).not.toContain('useParams');
    expect(combined).not.toContain('useEffect');
    expect(combined).not.toContain('window.print');
  });

  it('preserves loading, error, and missing-document presentation', () => {
    expect(state).toContain('กำลังโหลดข้อมูลเอกสาร...');
    expect(state).toContain('เกิดข้อผิดพลาด:');
    expect(state).toContain('ไม่พบข้อมูลเอกสาร');
  });

  it('preserves return navigation and print controls through explicit props', () => {
    expect(toolbar).toContain("backTo = '/billing/combine'");
    expect(toolbar).toContain('onClick={onPrint}');
    expect(toolbar).toContain('กลับไปหน้ารวมบิล');
    expect(toolbar).toContain('พิมพ์เอกสาร');
  });

  it('preserves the current printable invoice surface', () => {
    expect(shell).toContain('ใบแจ้งหนี้ / INVOICE');
    expect(shell).toContain('บริษัท ตัวอย่าง จำกัด');
    expect(shell).toContain('เลขประจำตัวผู้เสียภาษี: 0123456789012');
    expect(shell).toContain('สรุปรายการใบส่งของที่รวมในเอกสารนี้');
    expect(shell).toContain('officialDocumentNumber');
    expect(shell).toContain("toLocaleDateString('th-TH')");
    expect(shell).toContain("toLocaleString('en-US'");
    expect(shell).toContain('ยอดรวมทั้งสิ้น');
    expect(shell).toContain('createdByUser?.name');
  });
});
