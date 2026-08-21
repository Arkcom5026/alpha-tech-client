import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Delivery Note Wave 2Q historical revision print', () => {
  const api = read('src/features/deliveryNote/api/deliveryNoteListLifecycleApi.js');
  const historyDialog = read('src/features/deliveryNote/components/workspace/DeliveryNoteHistoryDialog.jsx');
  const listPage = read('src/features/deliveryNote/pages/DeliveryNoteListPage.jsx');
  const historicalPrintPage = read('src/features/deliveryNote/pages/PrintHistoricalDeliveryNoteRevisionPage.jsx');
  const printShell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');
  const routes = read('src/routes/partner/salesRoutes.jsx');

  it('uses the first-class server historical-print endpoint', () => {
    expect(api).toContain('loadDeliveryNoteRevisionPrint');
    expect(api).toContain('`/sales/${normalizedSaleId}/delivery-note/revisions/${normalizedRevisionId}/print`');
    expect(api).not.toContain('post(`/sales/${normalizedSaleId}/delivery-note/revisions/${normalizedRevisionId}/print`');
  });

  it('offers printing for the selected immutable revision from document history', () => {
    expect(historyDialog).toContain('data-testid="delivery-note-history-print-revision"');
    expect(historyDialog).toContain('พิมพ์ฉบับนี้');
    expect(historyDialog).toContain('onPrintRevision({ row, revisionId: detail.id, revision: detail })');
    expect(listPage).toContain('onPrintRevision={handlePrintRevision}');
    expect(listPage).toContain('navigate(`print/${sourceId}/revisions/${normalizedRevisionId}`)');
  });

  it('routes historical printing to a dedicated read-only page', () => {
    expect(routes).toContain("{ path: 'print/:saleId/revisions/:revisionId', element: <PrintHistoricalDeliveryNoteRevisionPage /> }");
    expect(historicalPrintPage).toContain('loadDeliveryNoteRevisionPrint({ saleId, revisionId })');
    expect(historicalPrintPage).toContain('historicalAuthority?.document?.historicalPrint !== true');
    expect(historicalPrintPage).toContain('editableDocumentLines={false}');
    expect(historicalPrintPage).not.toContain('createSaleDeliveryNoteRevision');
    expect(historicalPrintPage).not.toContain('useSaleDocumentPreparation');
    expect(historicalPrintPage).not.toContain('useSaleDocumentReplacement');
  });

  it('preserves revision presentation while visibly marking the printed copy as historical evidence', () => {
    expect(historicalPrintPage).toContain('applyPersistedDeliveryNoteRevisionToSale');
    expect(historicalPrintPage).toContain('buildPersistedDeliveryNoteRevisionItems');
    expect(historicalPrintPage).toContain('resolveDeliveryNotePresentation');
    expect(historicalPrintPage).toContain('เอกสารนี้ใช้เป็นหลักฐานย้อนหลังเท่านั้น');
    expect(printShell).toContain('data-testid="delivery-note-historical-print-stamp"');
    expect(printShell).toContain('HISTORICAL COPY');
    expect(printShell).toContain('สำเนาประวัติ R{historicalPrintMeta.revisionNumber || \'-\'}');
  });
});
