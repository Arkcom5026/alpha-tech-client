import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('delivery note return-adjustment handoff contract', () => {
  const page = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');
  const api = read('src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js');
  const revisionPresentation = read('src/features/deliveryNote/print/workspace/policies/deliveryNoteRevisionPresentation.js');

  it('keeps the original delivery note immutable while surfacing return state', () => {
    expect(page).toContain('รายการนี้มีการคืนสินค้าแล้ว');
    expect(page).toContain('ใบส่งของฉบับเดิมยังคงเป็นหลักฐานตามรายการและยอดเดิม ไม่แก้ไขย้อนหลัง');
    expect(page).toContain("deliveryNoteLifecycle?.lifecycleState === 'ADJUSTED'");
  });

  it('offers explicit optional creation of a new adjusted delivery note', () => {
    expect(page).toContain('สร้างใบส่งของฉบับใหม่');
    expect(page).toContain('deliveryNoteLifecycle?.actions?.canCreateAdjustedRevision === true');
    expect(api).toContain('apiClient.post(`/sales/${saleId}/delivery-note/revisions`)');
    expect(page).toContain('createSaleDeliveryNoteRevision({ saleId: sourceId })');
    expect(page).toContain('await loadCurrentDocument();');
  });

  it('renders persisted current revision lines and document totals after creation', () => {
    expect(revisionPresentation).toContain('authority?.deliveryNoteReadAuthority?.persistedRevision === true');
    expect(revisionPresentation).toContain('quantity = round2(line?.activeQuantity)');
    expect(revisionPresentation).toContain('lineAmount = round2(line?.activeAmount)');
    expect(revisionPresentation).toContain('code: document.documentNumber || sale.code');
    expect(revisionPresentation).toContain('totalAmount: round2(document.activeAmount ?? document.totalAmount ?? sale.totalAmount)');
    expect(page).toContain('if (persistedRevisionActive) return persistedRevisionSaleItems;');
  });

  it('prevents legacy sale-line editing from mutating a persisted revision presentation', () => {
    expect(page).toContain('!preparation && !persistedRevisionActive');
    expect(page).toContain('editableDocumentLines={legacyEditorEnabled}');
  });

  it('does not offer a normal revision when statutory correction owns the next step', () => {
    expect(page).toContain('requiresStatutoryCorrection');
    expect(page).toContain('รายการนี้มีเอกสารภาษีแล้ว');
  });
});
