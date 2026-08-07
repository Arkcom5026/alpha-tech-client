import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('delivery note print workspace behavior contract', () => {
  const page = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');

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
    expect(page).toContain('Array.isArray(currentSale.saleLines) && currentSale.saleLines.length > 0');
    expect(page).toContain('...(Array.isArray(currentSale.items) ? currentSale.items : [])');
    expect(page).toContain('...(Array.isArray(currentSale.simpleItems) ? currentSale.simpleItems : [])');
  });

  it('preserves grouping identity and document-description semantics', () => {
    expect(page).toContain('documentDescription: buildSaleDocumentLineDescription(item)');
    expect(page).toContain("`product-${productId}`");
    expect(page).toContain('`prefix-${documentLine.documentPrefix}`');
    expect(page).toContain('`description-${documentLine.documentDescription}`');
    expect(page).toContain('`suffix-${documentLine.documentSuffix}`');
    expect(page).toContain('productName: buildPrintableProductName(documentLine)');
  });

  it('preserves SN and simple-item quantity, price, discount, and id aggregation', () => {
    expect(page).toContain('const isSnItem = Boolean(item?.stockItemId || item?.stockItem?.id);');
    expect(page).toContain('const quantity = isSnItem ? 1 : Math.max(1, Number(item?.quantity ?? item?.qty ?? 1) || 1);');
    expect(page).toContain('const discountEach = isSnItem ? 0 : Number(item?.discount ?? item?.discountAmount ?? 0) || 0;');
    expect(page).toContain('saleItemIds: isSnItem && item?.id ? [Number(item.id)] : []');
    expect(page).toContain('simpleItemIds: !isSnItem && item?.id ? [Number(item.id)] : []');
    expect(page).toContain('aggregate.quantity += quantity;');
    expect(page).toContain('aggregate.discount += discountEach;');
  });

  it('keeps branch projection, document states, and printable form composition intact', () => {
    expect(page).toContain('address: buildBranchFullAddress(branch)');
    expect(page).toContain('branchName: branch.companyName || branch.name ||');
    expect(page).toContain('<DeliveryNoteDocumentState status="loading"');
    expect(page).toContain('<DeliveryNoteDocumentState status="error"');
    expect(page).toContain('<DeliveryNoteDocumentState status="empty"');
    expect(page).toContain('<DeliveryNoteForm');
    expect(page).toContain('editableDocumentLines');
    expect(page).toContain('hideDate={hideDate}');
    expect(page).toContain('saleItems={preparedSaleItems}');
  });
});
