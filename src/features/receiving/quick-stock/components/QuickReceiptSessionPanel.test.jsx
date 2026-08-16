import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const componentDirectory = path.dirname(filename);
const featureDirectory = path.resolve(componentDirectory, '..');
const read = (relativePath) => fs.readFileSync(path.join(featureDirectory, relativePath), 'utf8');

const panelSource = read('components/QuickReceiptSessionPanel.jsx');
const controllerSource = read('session/useQuickReceiptSessionController.js');
const actionsSource = read('components/QuickReceiptActions.jsx');
const pickerSource = read('components/QuickReceiptDraftPicker.jsx');
const headerSource = read('components/QuickReceiptHeaderFields.jsx');
const lineSummarySource = read('components/QuickReceiptLineSummary.jsx');
const workflowSource = [
  panelSource,
  controllerSource,
  actionsSource,
  pickerSource,
  headerSource,
  lineSummarySource,
].join('\n');

describe('Quick Receipt executable vertical-slice contract', () => {
  it('keeps the panel as the composition boundary and delegates workflow ownership', () => {
    expect(panelSource).toContain('useQuickReceiptSessionController');
    expect(panelSource).toContain('<QuickReceiptHeaderFields');
    expect(panelSource).toContain('<QuickReceiptDraftPicker');
    expect(panelSource).toContain('<QuickReceiptLineSummary');
    expect(panelSource).toContain('<QuickReceiptActions');
  });

  it('persists the whole local receipt cart, not only the header', () => {
    expect(controllerSource).toContain('alpha-tech.quick-receipt.local-draft.v2');
    expect(controllerSource).toMatch(/JSON\.stringify\(\{\s*header,\s*lines: localLines\s*\}\)/);
    expect(controllerSource).toMatch(/setLocalLines\(Array\.isArray\(parsed\.lines\)/);
  });

  it('keeps one-shot and resumable flows separate across the workflow slice', () => {
    expect(controllerSource).toContain('completeQuickReceipt');
    expect(controllerSource).toContain('createQuickReceiptDraft');
    expect(controllerSource).toContain('addQuickReceiptItem');
    expect(workflowSource).toContain('เก็บไว้รับต่อภายหลัง');
    expect(workflowSource).toContain('ยืนยันรับสินค้าครบแล้ว');
  });

  it('uses the unified input-tax document mode and recovers legacy drafts', () => {
    expect(headerSource).toContain('<option value="RECEIVED">');
    expect(controllerSource).toContain("value === 'RECEIVED_WITH_GOODS' ? 'RECEIVED'");
    expect(controllerSource).toMatch(/taxDocumentMode: normalizeTaxDocumentMode/);
    expect(headerSource).not.toContain('<option value="RECEIVED_WITH_GOODS">');
  });

  it('resumes a server draft from full receipt and tax detail', () => {
    expect(controllerSource).toMatch(/const detail = await getQuickReceipt\(draft\.id\)/);
    expect(controllerSource).toMatch(/setReceipt\(detail\)/);
    expect(controllerSource).toMatch(/setHeader\(toHeader\(detail\)\)/);
    expect(controllerSource).toContain('documentSubtotal');
    expect(controllerSource).toContain('documentVatAmount');
    expect(controllerSource).toContain('documentTotalAmount');
  });

  it('allows persisted lines to be removed before finalization', () => {
    expect(controllerSource).toContain('deleteQuickReceiptItem');
    expect(controllerSource).toMatch(/await deleteQuickReceiptItem\(receipt\.id, itemId\)/);
    expect(lineSummarySource).toContain('onRemoveServerLine');
  });

  it('supports cancelling a server draft and starting a clean receipt', () => {
    expect(controllerSource).toContain('cancelQuickReceipt');
    expect(controllerSource).toContain('const receiptId = receipt.id');
    expect(controllerSource).toMatch(/await cancelQuickReceipt\(receiptId,/);
    expect(controllerSource).toContain('if (!receipt?.id || receipt.status !== \'DRAFT\' || isBusy) return false');
    expect(workflowSource).toContain('ยกเลิกใบรับนี้');
    expect(panelSource).toContain('เริ่มใบรับใหม่');
    expect(controllerSource).toMatch(/setHeader\(emptyHeader\)/);
  });

  it('supports finding a resumable draft by supplier or delivery note', () => {
    expect(controllerSource).toContain('draftSearch');
    expect(pickerSource).toContain('ค้นหาจาก Supplier หรือเลขที่ใบส่งของ');
    expect(controllerSource).toMatch(/supplierName[\s\S]*deliveryNoteNumber/);
  });

  it('updates an existing draft header before saving or finalizing', () => {
    expect(controllerSource).toContain('updateQuickReceiptDraft');
    expect(controllerSource).toMatch(/await updateQuickReceiptDraft\(active\.id/);
    expect(controllerSource).toMatch(/await updateQuickReceiptDraft\(receipt\.id/);
  });

  it('retains recovery data when finalization fails and clears it only after success', () => {
    const finalizeStart = controllerSource.indexOf('const handleFinalize = async');
    const finalizeEnd = controllerSource.indexOf('const resumeDraft', finalizeStart);
    const finalizeFlow = controllerSource.slice(finalizeStart, finalizeEnd);
    const clearIndex = finalizeFlow.indexOf('localStorage.removeItem(STORAGE_KEY)');
    const catchIndex = finalizeFlow.indexOf('catch (error)');

    expect(finalizeFlow).toContain('await completeQuickReceipt');
    expect(finalizeFlow).toContain('await finalizeQuickReceipt');
    expect(clearIndex).toBeGreaterThan(0);
    expect(catchIndex).toBeGreaterThan(clearIndex);
  });

  it('builds each line with product, quantity, prices and barcode units', () => {
    expect(controllerSource).toMatch(/productId: Number\(operationalProduct\.id\)/);
    expect(controllerSource).toMatch(/quantity: barcodeQueue\.length/);
    expect(controllerSource).toMatch(/costPrice: Number\(defaultCost \?\? priceForm\.costPrice\)/);
    expect(controllerSource).toMatch(/items: barcodeQueue\.map/);
  });
});
