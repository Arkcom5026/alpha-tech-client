import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspace = () => read('src/features/barcode/pages/BarcodePreviewWorkspacePage.jsx');
const header = () => read('src/features/barcode/components/BarcodePreviewWorkspaceHeader.jsx');

describe('procurement barcode preparation to stock receive continuity', () => {
  it('prepares missing receipt barcodes idempotently before stock receiving continuation', () => {
    const source = workspace();
    expect(source).toContain('generateBarcodesAction');
    expect(source).toContain('loadBarcodesAction');
    expect(source).toContain('preparationKeyRef');
  });

  it('continues the same receipt directly into the stock receive scan runtime', () => {
    const source = workspace();
    expect(source).toContain('/pos/purchases/receipt/items/scan/${receiptId}');
    expect(source).toContain('summary.labelCount <= 0');
  });

  it('does not offer stock receiving before receipt identities exist', () => {
    const source = header();
    expect(source).toContain('const canContinue = labelCount > 0 && !preparing');
    expect(source).toContain('ไปยิงรับสินค้าเข้าสต๊อก');
  });
});
