import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Delivery Note lifecycle Wave 2K list visibility', () => {
  const page = read('src/features/deliveryNote/pages/DeliveryNoteListPage.jsx');
  const table = read('src/features/deliveryNote/components/workspace/DeliveryNoteResultTable.jsx');
  const api = read('src/features/deliveryNote/api/deliveryNoteListLifecycleApi.js');

  it('loads lifecycle summaries in one batch for visible sale rows', () => {
    expect(api).toContain("apiClient.get('/sales/delivery-note/lifecycle-summaries'");
    expect(api).toContain("params: { saleIds: ids.join(',') }");
    expect(page).toContain('loadDeliveryNoteListLifecycleSummaries({ saleIds })');
    expect(page).toContain('deliveryNoteLifecycleSummary: lifecycleSummary');
    expect(page).not.toContain("documentSearch.rows.map(async");
  });

  it('shows explicit delivery-note lifecycle status in the table', () => {
    expect(table).toContain('สถานะใบส่งของ');
    expect(table).toContain("status === 'RETURNED_PENDING_REVISION'");
    expect(table).toContain('มีการคืนสินค้า');
    expect(table).toContain('สามารถสร้างใบส่งของฉบับใหม่ได้');
  });

  it('keeps the original sale total separate from lifecycle status', () => {
    expect(table).toContain('formatMoney(row.totalAmount)');
    expect(table).toContain('formatMoney(row.balanceAmount)');
    expect(table).toContain('deliveryNoteLifecycleSummary');
  });

  it('shows adjusted revision identity when a current revision exists', () => {
    expect(table).toContain("status === 'RETURN_ADJUSTED_CURRENT'");
    expect(table).toContain('`มีการคืนสินค้า · R${revisionNumber}`');
    expect(table).toContain('summary?.currentRevision?.documentNumber');
  });

  it('marks fully returned delivery notes explicitly', () => {
    expect(table).toContain("status === 'FULLY_RETURNED'");
    expect(table).toContain('คืนสินค้าครบ');
  });
});
