import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('delivery note print workspace transformation cutover contract', () => {
  const page = read('src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx');
  const policy = read('src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js');

  it('cuts pure sale-item and branch projection over to the print policy', () => {
    expect(page).toContain('prepareDeliveryNoteSaleItems(currentSale)');
    expect(page).toContain('buildDeliveryNoteBranchConfig(currentSale)');
    expect(page).toContain("from '../print/workspace/policies/deliveryNotePrintPolicy'");
  });

  it('removes duplicated transformation implementation from the page', () => {
    expect(page).not.toContain('const normalizeDocumentText');
    expect(page).not.toContain('const buildSaleDocumentLine');
    expect(page).not.toContain('const buildPrintableProductName');
    expect(page).not.toContain('const buildBranchFullAddress');
    expect(page).not.toContain('const grouped = new Map()');
  });

  it('keeps fetch and editable-line runtime authority in the page', () => {
    expect(page).toContain('loadSaleDocument({ saleId })');
    expect(page).toContain('useSaleDocumentLineEditor({ saleId, reload: reloadSaleDocument })');
    expect(page).toContain('documentLineActions.clearError()');
    expect(page).toContain('onSaveDocumentLine={documentLineActions.save}');
  });

  it('keeps the policy pure and free of react or sales runtime ownership', () => {
    expect(policy).not.toContain('react');
    expect(policy).not.toContain('useMemo');
    expect(policy).not.toContain('useEffect');
    expect(policy).not.toContain('loadSaleDocument');
    expect(policy).not.toContain('useSaleDocumentLineEditor');
    expect(policy).toContain('export const prepareDeliveryNoteSaleItems');
    expect(policy).toContain('export const buildDeliveryNoteBranchConfig');
  });
});
