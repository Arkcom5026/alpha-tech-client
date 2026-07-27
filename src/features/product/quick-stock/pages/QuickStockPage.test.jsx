import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const source = fs.readFileSync(path.join(path.dirname(filename), 'QuickStockPage.jsx'), 'utf8');

describe('QuickStockPage quick receipt integration contract', () => {
  it('mounts the receipt session panel inside the Quick Stock runtime', () => {
    expect(source).toContain('QuickReceiptSessionPanel');
    expect(source).toMatch(/<QuickReceiptSessionPanel/);
  });

  it('passes the active product, barcode queue and price state to the receipt owner', () => {
    expect(source).toMatch(/operationalProduct=\{commitRuntimeProduct\}/);
    expect(source).toMatch(/barcodeQueue=\{barcodeQueue\}/);
    expect(source).toMatch(/defaultCost=\{defaultCost\}/);
    expect(source).toMatch(/priceForm=\{priceForm\}/);
    expect(source).toMatch(/note=\{note\}/);
  });

  it('clears the current queue only after the line owner reports success', () => {
    expect(source).toMatch(/onCurrentLineSaved=\{resetQueue\}/);
  });
});
