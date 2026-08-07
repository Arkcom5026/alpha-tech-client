import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('delivery note print workspace presentation contract', () => {
  const shell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');
  const state = read('src/features/deliveryNote/components/workspace/DeliveryNoteDocumentState.jsx');

  it('keeps the print shell presentation-only', () => {
    expect(shell).not.toContain('useParams');
    expect(shell).not.toContain('useEffect');
    expect(shell).not.toContain('loadSaleDocument');
    expect(shell).not.toContain('useSaleDocumentLineEditor');
    expect(shell).not.toContain('prepareDeliveryNoteSaleItems');
    expect(shell).not.toContain('buildDeliveryNoteBranchConfig');
  });

  it('preserves printable document shell and form ownership', () => {
    expect(shell).toContain('min-h-screen bg-slate-100');
    expect(shell).toContain('max-w-[210mm]');
    expect(shell).toContain('<DeliveryNoteForm');
    expect(shell).toContain('editableDocumentLines');
    expect(shell).toContain('saleItems={saleItems}');
    expect(shell).toContain('config={config}');
  });

  it('preserves editable-line presentation through explicit intents', () => {
    expect(shell).toContain('onToggleDocumentLineEdit={onToggleDocumentLineEdit}');
    expect(shell).toContain('onChangeDocumentLineDraft={onChangeDocumentLineDraft}');
    expect(shell).toContain('onSaveDocumentLine={onSaveDocumentLine}');
    expect(shell).toContain('editingLineKey={editingLineKey}');
    expect(shell).toContain('lineDrafts={lineDrafts}');
    expect(shell).toContain('savingLineKey={savingLineKey}');
  });

  it('reuses the established document-state presentation', () => {
    expect(state).toContain("status === 'loading'");
    expect(state).toContain("status === 'error'");
    expect(state).toContain('กำลังเตรียมใบส่งสินค้า');
    expect(state).toContain('ไม่สามารถเปิดใบส่งสินค้าได้');
    expect(state).toContain('ไม่พบใบส่งสินค้า');
  });
});
