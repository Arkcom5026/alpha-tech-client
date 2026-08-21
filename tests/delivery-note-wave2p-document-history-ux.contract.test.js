import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Delivery Note Wave 2P document history UX', () => {
  const api = read('src/features/deliveryNote/api/deliveryNoteListLifecycleApi.js');
  const listPage = read('src/features/deliveryNote/pages/DeliveryNoteListPage.jsx');
  const table = read('src/features/deliveryNote/components/workspace/DeliveryNoteResultTable.jsx');
  const dialog = read('src/features/deliveryNote/components/workspace/DeliveryNoteHistoryDialog.jsx');

  it('uses first-class read-only revision history endpoints', () => {
    expect(api).toContain('`/sales/${normalizedSaleId}/delivery-note/revisions`');
    expect(api).toContain('`/sales/${normalizedSaleId}/delivery-note/revisions/${normalizedRevisionId}`');
    expect(api).not.toContain('post(`/sales/${normalizedSaleId}/delivery-note/revisions`');
  });

  it('exposes history from the delivery-note list only when persisted revision identity exists', () => {
    expect(table).toContain('const hasRevisionHistory = (row) => Boolean(row?.deliveryNoteLifecycleSummary?.currentRevision?.id);');
    expect(table).toContain('<History className="h-3.5 w-3.5" /> ประวัติ');
    expect(listPage).toContain('onHistory={setHistoryRow}');
    expect(listPage).toContain('<DeliveryNoteHistoryDialog');
  });

  it('defaults adjusted documents to the first historical revision so the original is immediately visible', () => {
    expect(dialog).toContain('revisions.find((revision) => !revision.currentAuthority) || revisions[0] || null');
    expect(dialog).toContain("return 'ฉบับเดิม';");
    expect(dialog).toContain("label: 'มีฉบับใหม่แทนแล้ว'");
  });

  it('renders immutable historical evidence with original, returned, active quantities and amounts', () => {
    expect(dialog).toContain('detail.grossAmount');
    expect(dialog).toContain('detail.returnedAmount');
    expect(dialog).toContain('detail.activeAmount');
    expect(dialog).toContain('line.originalQuantity');
    expect(dialog).toContain('line.returnedQuantity');
    expect(dialog).toContain('line.activeQuantity');
    expect(dialog).toContain('ฉบับนี้เป็นหลักฐานย้อนหลังและไม่สามารถแก้ไขรายการ ยอดเงิน หรือสถานะทางธุรกิจได้');
  });
});
