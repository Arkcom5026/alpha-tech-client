import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('delivery note print workspace cutover contract', () => {
  const page = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');
  const shell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');
  const policy = read('src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js');

  it('composes printable presentation through the delivery note print shell', () => {
    expect(page).toContain("import DeliveryNotePrintShell from '../print/workspace/components/DeliveryNotePrintShell';");
    expect(page).toContain('<DeliveryNotePrintShell');
    expect(page).not.toContain('<DeliveryNoteForm');
  });

  it('keeps fetch and editable-line runtime authority in the page', () => {
    expect(page).toContain('loadSaleDocument');
    expect(page).toContain('useSaleDocumentLineEditor');
    expect(page).toContain('documentLineActions.clearError();');
    expect(page).toContain('setCurrentSale');
    expect(shell).not.toContain('loadSaleDocument');
    expect(shell).not.toContain('useSaleDocumentLineEditor');
  });

  it('keeps pure projection authority in the print policy', () => {
    expect(page).toContain('prepareDeliveryNoteSaleItems(currentSale)');
    expect(page).toContain('buildDeliveryNoteBranchConfig(currentSale)');
    expect(policy).toContain('export const prepareDeliveryNoteSaleItems');
    expect(policy).toContain('export const buildDeliveryNoteBranchConfig');
    expect(shell).not.toContain('prepareDeliveryNoteSaleItems');
    expect(shell).not.toContain('buildDeliveryNoteBranchConfig');
  });

  it('preserves editor and print presentation through explicit props', () => {
    expect(page).toContain('sale={currentSale}');
    expect(page).toContain('saleItems={preparedSaleItems}');
    expect(page).toContain('config={preparedConfig}');
    expect(page).toContain('editingLineKey={editingLineKey}');
    expect(page).toContain('lineDrafts={lineDrafts}');
    expect(page).toContain('savingLineKey={savingLineKey}');
    expect(page).toContain('onToggleDocumentLineEdit={documentLineActions.toggle}');
    expect(page).toContain('onChangeDocumentLineDraft={documentLineActions.change}');
    expect(page).toContain('onSaveDocumentLine={documentLineActions.save}');
    expect(shell).toContain('<DeliveryNoteForm');
    expect(shell).toContain('editableDocumentLines');
  });
});
