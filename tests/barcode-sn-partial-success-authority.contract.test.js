import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const storePath = path.resolve('src/features/barcode/store/barcodeStore.js');
const pagePath = path.resolve('src/features/stockItem/pages/ScanBarcodeListPage.jsx');
const storeSource = fs.readFileSync(storePath, 'utf8');
const pageSource = fs.readFileSync(pagePath, 'utf8');

describe('Barcode SN partial-success authority', () => {
  it('makes barcode refresh outcome observable without changing read callers to throwing semantics', () => {
    expect(storeSource).toContain('return { ok: true, barcodes: list, error: null };');
    expect(storeSource).toContain('return { ok: false, barcodes: null, error: err };');
  });

  it('preserves server-confirmed SN persistence and carries refresh failure separately', () => {
    expect(storeSource).toContain('const withRefreshMetadata = (result, refreshError) => {');
    expect(storeSource).toContain('return withRefreshMetadata(res, refreshResult?.ok === false ? refreshResult.error : null);');
    expect(storeSource).toContain('updateReceivedSNAction: async');
    expect(storeSource).toContain('updateSerialNumberAction: async');
    expect(storeSource).toContain('deleteSerialNumberAction: async');
  });

  it('owns edit-SN submission synchronously and snapshots the mutation command', () => {
    expect(pageSource).toContain('const editingMutationRef = useRef(false);');
    expect(pageSource).toContain('if (editingMutationRef.current || workflowMutationRef.current) return;');
    expect(pageSource).toContain('const receiptIdSnapshot = receiptId;');
    expect(pageSource).toContain('const barcodeReceiptIdSnapshot = row?.id ?? null;');
    expect(pageSource).toContain("const barcodeSnapshot = String(row?.barcode || '').trim();");
    expect(pageSource).toContain("const nextSNSnapshot = String(editingSN || '').trim();");
  });

  it('reports persistence success before a post-success refresh problem', () => {
    expect(pageSource).toContain('feedback.actionSuccess(');
    expect(pageSource).toContain('if (result?.refreshError) {');
    expect(pageSource).toContain(':refresh:error`');
    expect(pageSource).toContain('รีเฟรชรายการบาร์โค้ดล่าสุดไม่สำเร็จ');
  });

  it('does not issue the previous duplicate delete refresh from the receiving page', () => {
    const deleteBranch = pageSource.slice(pageSource.indexOf(': await deleteSerialNumberAction(barcodeSnapshot);'));
    expect(deleteBranch).not.toContain("await loadBarcodesAction(receiptId);\n        setPageMessage({ type: 'success', text: 'ล้าง SN สำเร็จ' });");
  });
});
