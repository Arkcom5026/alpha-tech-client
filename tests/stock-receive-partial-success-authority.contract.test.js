import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pagePath = path.resolve('src/features/stockItem/pages/ScanBarcodeListPage.jsx');
const source = fs.readFileSync(pagePath, 'utf8');

describe('Stock receiving partial-success authority', () => {
  it('serializes finalize, scan, and receive-all at the page interaction boundary', () => {
    expect(source).toContain('const workflowMutationRef = useRef(null);');
    expect(source).toContain("workflowMutationRef.current = 'FINALIZE';");
    expect(source).toContain("workflowMutationRef.current = 'RECEIVE_SCAN';");
    expect(source).toContain("workflowMutationRef.current = 'RECEIVE_ALL_PENDING';");
  });

  it('snapshots receipt identity before persistent commands', () => {
    expect(source).toContain('const receiptIdSnapshot = receiptId;');
    expect(source).toContain('receiveAllPendingNoSNAction({ receiptId: receiptIdSnapshot })');
    expect(source).toContain('finalizeReceiptIfNeededAction(receiptIdSnapshot)');
  });

  it('announces server-confirmed success before checking barcode refresh outcome', () => {
    expect(source).toContain('feedback.actionSuccess(successText, `${eventKey}:success`);');
    expect(source).toContain('const refreshResult = await loadBarcodesAction(receiptIdSnapshot);');
    expect(source).toContain('reportRefreshAfterSuccess(refreshResult, successText, eventKey);');
  });

  it('reports post-success refresh failure without relabeling persistence as failed', () => {
    expect(source).toContain('`${eventKey}:refresh:error`');
    expect(source).toContain('รีเฟรชรายการบาร์โค้ดล่าสุดไม่สำเร็จ');
    expect(source).toContain("feedback.actionError(error, 'รับสินค้าไม่สำเร็จ', `${eventKey}:error`);");
    expect(source).toContain("feedback.actionError(error, 'รับสินค้าค้างทั้งหมดไม่สำเร็จ', `${eventKey}:error`);");
  });

  it('guards conflicting navigation and SN editing while workflow mutation owns the page', () => {
    expect(source).toContain('if (editingMutationRef.current || workflowMutationRef.current) return;');
    expect(source).toContain('if (!workflowMutationRef.current && !editingMutationRef.current) navigate(-1);');
  });
});
