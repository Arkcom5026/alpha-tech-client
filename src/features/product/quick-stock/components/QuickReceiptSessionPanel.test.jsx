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

  it('resumes a server draft from full receipt detail', () => {
    expect(source).toContain('getQuickReceipt');
    expect(source).toMatch(/const detail = await getQuickReceipt\(draft\.id\)/);
    expect(source).toMatch(/setReceipt\(detail\)/);
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
