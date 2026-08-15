import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const orchestration = read('src/features/tax/inputDocuments/hooks/useInputTaxReceiptCreateLinkController.js');
const page = read('src/features/tax/inputDocuments/pages/InputTaxReceiptWorkspacePage.jsx');
const form = read('src/features/tax/inputDocuments/components/InputTaxDocumentCreationForm.jsx');

describe('input tax create and auto-link workflow contract', () => {
  it('prefills the tax document amount from selected receipt allocations', () => {
    expect(orchestration).toContain('sumReceiptAllocations(selectedReceipts)');
    expect(orchestration).toContain("changeInvoice('subtotalAmount'");
    expect(orchestration).toContain("changeInvoice('taxAmount'");
    expect(orchestration).toContain("changeInvoice('totalAmount'");
  });

  it('links the selected receipts after a newly-created document becomes selected', () => {
    expect(orchestration).toContain("setSelectedDocumentId('')");
    expect(orchestration).toContain('await createInputTaxDocument(event)');
    expect(orchestration).toContain('Promise.resolve(attachSelected()).catch(() => {});');
    expect(orchestration).toContain('pendingAutoLinkRef.current = true');
  });

  it('wires the creation form using the component prop contract', () => {
    expect(page).toContain('supplierName={controller.selectedSupplier?.supplierName');
    expect(page).toContain('onInvoiceChange={controller.changeInvoice}');
    expect(page).toContain('onSubmit={controller.createAndAutoLinkInputTaxDocument}');
    expect(page).toContain('onToggleCreateDocument={controller.toggleCreateDocument}');
    expect(form).toContain('supplierName');
    expect(form).toContain('onInvoiceChange');
  });
});
