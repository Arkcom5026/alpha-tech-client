import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/tax/inputDocuments/pages/InputTaxReceiptWorkspacePage.jsx');
const header = read('src/features/tax/inputDocuments/components/InputTaxReceiptWorkspaceHeader.jsx');
const filters = read('src/features/tax/inputDocuments/components/InputTaxReceiptFilters.jsx');
const candidates = read('src/features/tax/inputDocuments/components/InputTaxReceiptCandidateTable.jsx');
const selection = read('src/features/tax/inputDocuments/components/InputTaxDocumentSelectionPanel.jsx');
const form = read('src/features/tax/inputDocuments/components/InputTaxDocumentCreationForm.jsx');
const allocation = read('src/features/tax/inputDocuments/components/InputTaxAllocationSummary.jsx');
const controller = read('src/features/tax/inputDocuments/hooks/useInputTaxReceiptWorkspaceController.js');
const orchestration = read('src/features/tax/inputDocuments/hooks/useInputTaxReceiptCreateLinkController.js');
const utils = read('src/features/tax/inputDocuments/utils/inputTaxReceiptLink.js');

describe('Tax UX input receipt linking simplification', () => {
  it('puts receipt selection before the document decision', () => {
    expect(page.indexOf('<InputTaxReceiptCandidateTable')).toBeLessThan(page.indexOf('<InputTaxDocumentSelectionPanel'));
    expect(candidates).toContain('ขั้นตอนที่ 1 · เลือกใบรับสินค้า');
    expect(selection).toContain('ขั้นตอนที่ 2 · เลือกวิธีจัดการใบกำกับภาษีซื้อ');
  });

  it('presents mutually clear existing versus new document paths', () => {
    expect(selection).toContain('ใช้ใบกำกับภาษีซื้อที่มีอยู่แล้ว');
    expect(selection).toContain('สร้างใบกำกับภาษีซื้อฉบับใหม่');
    expect(selection).toContain('เลือกเพียงหนึ่งวิธีด้านล่าง');
    expect(orchestration).toContain("setSelectedDocumentId('')");
    expect(orchestration).toContain('setShowCreateDocument(true)');
    expect(controller).toContain('setShowCreateDocument(false)');
  });

  it('excludes read-only documents from operational linking choices', () => {
    expect(controller).toContain('documents.filter((document) => isTaxDocumentMutable(document.status))');
  });

  it('excludes documents whose remaining capacity cannot fit the selected receipts', () => {
    expect(controller).toContain('documentCanFitReceiptAllocations(document, selectedReceipts)');
    expect(utils).toContain('activeAllocatedSubtotal');
    expect(utils).toContain('activeAllocatedVatAmount');
    expect(utils).toContain('activeAllocatedTotalAmount');
    expect(selection).toContain('ยังมียอดคงเหลือเพียงพอกับใบรับสินค้าที่เลือก');
    expect(selection).toContain('คงเหลือ {formatTaxMoney(remainingDocumentTotalCapacity(document))}');
  });

  it('automatically guides to a new invoice when no existing document can be used', () => {
    expect(orchestration).toContain('if (eligibleDocuments.length > 0) return;');
    expect(orchestration).toContain('if (showCreateDocument) return;');
    expect(orchestration).toContain('openCreateDocument();');
    expect(selection).toContain('disabled={!hasReceipts || !existingAvailable}');
    expect(selection).toContain('ไม่มีใบกำกับภาษีซื้อเดิมที่มียอดคงเหลือเพียงพอ ระบบเลือกการสร้างฉบับใหม่ให้แล้ว');
  });

  it('makes the final action describe exactly what will happen', () => {
    expect(selection).toContain('ยืนยันผูก {selectedReceiptCount} ใบรับสินค้า');
    expect(form).toContain('สร้างใบกำกับภาษีซื้อและผูก {selectedReceiptCount} ใบรับสินค้า');
    expect(form).toContain('ตรวจเลขที่ วันที่ และยอดทั้งหมดกับใบกำกับภาษีจริงก่อนยืนยัน');
  });

  it('keeps overflow protection visible before confirmation', () => {
    expect(page).toContain('allocationOverflow={controller.allocationProjection?.overflow}');
    expect(selection).toContain('ยอดจากใบรับสินค้าที่เลือกเกินยอดคงเหลือของใบกำกับภาษีซื้อนี้');
    expect(allocation).toContain('ยอดคงเหลือที่ยังผูกได้');
  });

  it('uses Thai-first language for user-visible tax operations', () => {
    expect(header).toContain('การเชื่อมโยงเอกสารภาษีซื้อ');
    expect(header).not.toContain('Input Tax Receipt Links');
    expect(filters).toContain('ผู้จำหน่ายทั้งหมด');
    expect(filters).not.toContain('>Supplier<');
    expect(candidates).toContain('มูลค่าก่อนภาษีมูลค่าเพิ่ม');
    expect(candidates).toContain('ภาษีมูลค่าเพิ่ม');
    expect(form).toContain('ภาษีมูลค่าเพิ่ม');
    expect(allocation).toContain('ก่อนภาษีมูลค่าเพิ่ม');
    expect(selection).not.toContain('document.status');
    expect(controller).toContain('กรุณาเลือกใบรับสินค้าจากผู้จำหน่ายรายเดียวกัน');
  });
});
