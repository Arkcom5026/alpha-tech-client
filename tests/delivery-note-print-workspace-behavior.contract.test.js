import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('delivery note print workspace behavior contract', () => {
  const page = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');
  const policy = read('src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js');
  const shell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');

  it('keeps sale-document loading and mounted lifecycle intact', () => {
    expect(page).toContain('const sale = await loadSaleDocument({ saleId });');
    expect(page).toContain('let isMounted = true;');
    expect(page).toContain('if (isMounted) setCurrentSale(sale || null);');
    expect(page).toContain('isMounted = false;');
    expect(page).toContain("'ไม่สามารถโหลดข้อมูลใบส่งสินค้าได้'");
  });

  it('keeps editable document-line runtime wired through the sales workspace', () => {
    expect(page).toContain('useSaleDocumentLineEditor({ saleId, reload: reloadSaleDocument })');
    expect(page).toContain('documentLineActions.clearError();');
    expect(page).toContain('onToggleDocumentLineEdit={documentLineActions.toggle}');
    expect(page).toContain('onChangeDocumentLineDraft={documentLineActions.change}');
    expect(page).toContain('onSaveDocumentLine={documentLineActions.save}');
  });

  it('preserves sale-line fallback across saleLines, items, and simpleItems', () => {
    expect(page).toContain('prepareDeliveryNoteSaleItems(currentSale)');
    expect(policy).toContain('Array.isArray(sale.saleLines) && sale.saleLines.length > 0');
    expect(policy).toContain('...(Array.isArray(sale.items) ? sale.items : [])');
    expect(policy).toContain('...(Array.isArray(sale.simpleItems) ? sale.simpleItems : [])');
  });

  it('preserves grouping identity and document-description semantics', () => {
    expect(policy).toContain('documentDescription: documentDescriptionRaw || resolveDeliveryNoteProductName(item)');
    expect(policy).toContain("`product-${productId}`");
    expect(policy).toContain('`prefix-${documentLine.documentPrefix}`');
    expect(policy).toContain('`description-${documentLine.documentDescription}`');
    expect(policy).toContain('`suffix-${documentLine.documentSuffix}`');
    expect(policy).toContain('productName: buildDeliveryNotePrintableProductName(documentLine)');
  });

  it('preserves SN and simple-item quantity, price, discount, and id aggregation', () => {
    expect(policy).toContain('const isSnItem = Boolean(item?.stockItemId || item?.stockItem?.id);');
    expect(policy).toContain('const quantity = isSnItem ? 1 : Math.max(1, Number(item?.quantity ?? item?.qty ?? 1) || 1);');
    expect(policy).toContain('Number(item?.discount ?? item?.discountAmount ?? 0) || 0');
    expect(policy).toContain('saleItemIds: isSnItem && item?.id ? [Number(item.id)] : []');
    expect(policy).toContain('simpleItemIds: !isSnItem && item?.id ? [Number(item.id)] : []');
    expect(policy).toContain('aggregate.quantity += quantity;');
    expect(policy).toContain('aggregate.discount += discountEach;');
  });

  it('keeps branch projection, document states, and printable form composition intact across workspace ownership', () => {
    expect(page).toContain('buildDeliveryNoteBranchConfig(currentSale)');
    expect(policy).toContain('address: buildDeliveryNoteBranchAddress(branch)');
    expect(policy).toContain("branchName: branch.companyName || branch.name || '-'");
    expect(page).toContain('<DeliveryNoteDocumentState status="loading"');
    expect(page).toContain('<DeliveryNoteDocumentState status="error"');
    expect(page).toContain('<DeliveryNoteDocumentState status="empty"');
    expect(page).toContain('<DeliveryNotePrintShell');
    expect(page).toContain('hideDate={hideDate}');
    expect(page).toContain('saleItems={preparedSaleItems}');
    expect(page).toContain('config={preparedConfig}');
    expect(shell).toContain('<DeliveryNoteForm');
    expect(shell).toContain('editableDocumentLines');
  });
});
