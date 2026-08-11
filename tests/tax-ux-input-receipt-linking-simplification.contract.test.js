import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/tax/inputDocuments/pages/InputTaxReceiptWorkspacePage.jsx');
const selection = read('src/features/tax/inputDocuments/components/InputTaxDocumentSelectionPanel.jsx');
const form = read('src/features/tax/inputDocuments/components/InputTaxDocumentCreationForm.jsx');
const controller = read('src/features/tax/inputDocuments/hooks/useInputTaxReceiptWorkspaceController.js');
const orchestration = read('src/features/tax/inputDocuments/hooks/useInputTaxReceiptCreateLinkController.js');

describe('Tax UX input receipt linking simplification', () => {
  it('puts receipt selection before the document decision', () => {
    expect(page.indexOf('<InputTaxReceiptCandidateTable')).toBeLessThan(page.indexOf('<InputTaxDocumentSelectionPanel'));
    expect(selection).toContain('ขั้นตอนที่ 2 · เลือกวิธีจัดการใบกำกับภาษี');
  });

  it('presents mutually clear existing versus new document paths', () => {
    expect(selection).toContain('ผูกกับใบกำกับภาษีที่มีอยู่');
    expect(selection).toContain('สร้างใบกำกับภาษีใหม่');
    expect(selection).toContain('เลือกเพียงหนึ่งวิธีด้านล่าง');
    expect(orchestration).toContain("controller.setSelectedDocumentId('')");
    expect(controller).toContain('setShowCreateDocument(false)');
  });

  it('excludes read-only documents from operational linking choices', () => {
    expect(controller).toContain('documents.filter((document) => isTaxDocumentMutable(document.status))');
    expect(selection).toContain('แสดงเฉพาะเอกสารของ Supplier เดียวกันที่ยังอยู่ในสถานะแก้ไข/ผูกเพิ่มได้');
  });

  it('makes the final action describe exactly what will happen', () => {
    expect(selection).toContain('ยืนยันผูก {selectedReceiptCount} ใบรับสินค้า');
    expect(form).toContain('สร้างใบกำกับภาษีและผูก {selectedReceiptCount} ใบรับสินค้า');
    expect(form).toContain('ตรวจเลขที่ วันที่ และยอดทั้งหมดกับใบกำกับภาษีจริงก่อนยืนยัน');
  });

  it('keeps overflow protection visible before confirmation', () => {
    expect(page).toContain('allocationOverflow={controller.allocationProjection?.overflow}');
    expect(selection).toContain('ยอดจากใบรับสินค้าที่เลือกเกินยอดคงเหลือของใบกำกับภาษีนี้');
  });
});
