import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const source = fs.readFileSync(path.join(path.dirname(filename), 'QuickReceiptSessionPanel.jsx'), 'utf8');

describe('QuickReceiptSessionPanel executable workflow contract', () => {
  it('persists the whole local receipt cart, not only the header', () => {
    expect(source).toContain("alpha-tech.quick-receipt.local-draft.v2");
    expect(source).toMatch(/JSON\.stringify\(\{\s*header,\s*lines: localLines\s*\}\)/);
    expect(source).toMatch(/setLocalLines\(Array\.isArray\(parsed\.lines\)/);
  });

  it('keeps one-shot and resumable flows separate at the UI boundary', () => {
    expect(source).toContain('completeQuickReceipt');
    expect(source).toContain('createQuickReceiptDraft');
    expect(source).toContain('addQuickReceiptItem');
    expect(source).toContain('เก็บไว้รับต่อภายหลัง');
    expect(source).toContain('ยืนยันรับสินค้าครบแล้ว');
  });

  it('uses the unified input-tax document mode and recovers legacy drafts', () => {
    expect(source).toContain('<option value="RECEIVED">');
    expect(source).toContain("value === 'RECEIVED_WITH_GOODS' ? 'RECEIVED'");
    expect(source).toMatch(/taxDocumentMode: normalizeTaxDocumentMode/);
    expect(source).not.toContain('<option value="RECEIVED_WITH_GOODS">');
  });

  it('resumes a server draft from full receipt and tax detail', () => {
    expect(source).toMatch(/const detail = await getQuickReceipt\(draft\.id\)/);
    expect(source).toMatch(/setReceipt\(detail\)/);
    expect(source).toMatch(/setHeader\(toHeader\(detail\)\)/);
    expect(source).toContain('documentSubtotal');
    expect(source).toContain('documentVatAmount');
    expect(source).toContain('documentTotalAmount');
  });

  it('allows a persisted draft line to be removed before finalization', () => {
    expect(source).toContain('deleteQuickReceiptItem');
    expect(source).toMatch(/await deleteQuickReceiptItem\(receipt\.id, itemId\)/);
    expect(source).toMatch(/item\.id && <button/);
  });

  it('supports cancelling a server draft and starting a clean receipt', () => {
    expect(source).toContain('cancelQuickReceipt');
    expect(source).toMatch(/await cancelQuickReceipt\(receipt\.id/);
    expect(source).toContain('ยกเลิกใบรับนี้');
    expect(source).toContain('เริ่มใบรับใหม่');
    expect(source).toMatch(/setHeader\(emptyHeader\)/);
  });

  it('supports finding a resumable draft by supplier or delivery note', () => {
    expect(source).toContain('draftSearch');
    expect(source).toContain('ค้นหาจาก Supplier หรือเลขที่ใบส่งของ');
    expect(source).toMatch(/supplierName[\s\S]*deliveryNoteNumber/);
  });

  it('updates an existing draft header before saving or finalizing', () => {
    expect(source).toContain('updateQuickReceiptDraft');
    expect(source).toMatch(/await updateQuickReceiptDraft\(active\.id/);
    expect(source).toMatch(/await updateQuickReceiptDraft\(receipt\.id/);
  });

  it('retains recovery data when finalization fails and clears it only after success', () => {
    const finalizeStart = source.indexOf('const handleFinalize = async');
    const finalizeEnd = source.indexOf('const resumeDraft', finalizeStart);
    const finalizeFlow = source.slice(finalizeStart, finalizeEnd);
    const clearIndex = finalizeFlow.indexOf('localStorage.removeItem(STORAGE_KEY)');
    const catchIndex = finalizeFlow.indexOf('catch (error)');

    expect(finalizeFlow).toContain('await completeQuickReceipt');
    expect(finalizeFlow).toContain('await finalizeQuickReceipt');
    expect(clearIndex).toBeGreaterThan(0);
    expect(catchIndex).toBeGreaterThan(clearIndex);
  });

  it('builds each line with product, quantity, prices and barcode units', () => {
    expect(source).toMatch(/productId: Number\(operationalProduct\.id\)/);
    expect(source).toMatch(/quantity: barcodeQueue\.length/);
    expect(source).toMatch(/costPrice: Number\(defaultCost \?\? priceForm\.costPrice\)/);
    expect(source).toMatch(/items: barcodeQueue\.map/);
  });
});
