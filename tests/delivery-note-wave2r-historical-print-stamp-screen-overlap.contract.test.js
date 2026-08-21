import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Delivery Note Wave 2R historical print stamp screen separation', () => {
  const shell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');
  const page = read('src/features/deliveryNote/pages/PrintHistoricalDeliveryNoteRevisionPage.jsx');

  it('keeps the historical-copy stamp out of interactive screen controls while preserving it for print', () => {
    expect(shell).toContain('data-testid="delivery-note-historical-print-stamp"');
    expect(shell).toContain('pointer-events-none hidden absolute');
    expect(shell).toContain('print:block');
    expect(shell).toContain('HISTORICAL COPY');
  });

  it('keeps an explicit historical warning visible on screen', () => {
    expect(page).toContain('สำเนาประวัติ R{historicalPrintMeta?.revisionNumber || \'-\'}');
    expect(page).toContain('เอกสารนี้ใช้เป็นหลักฐานย้อนหลังเท่านั้น');
    expect(page).toContain('print:hidden');
  });
});
