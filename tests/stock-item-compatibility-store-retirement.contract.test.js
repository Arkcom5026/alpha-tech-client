import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const retiredStorePath = path.join(
  sourceRoot,
  'features',
  'stockItem',
  'store',
  'stockItemStore.js'
);

const walk = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};

describe('StockItem compatibility store retirement contract', () => {
  it('keeps the compatibility store deleted', () => {
    expect(fs.existsSync(retiredStorePath)).toBe(false);
  });

  it('prevents runtime source from importing the retired compatibility store', () => {
    const violations = walk(sourceRoot)
      .filter((file) => /\.(js|jsx|ts|tsx)$/.test(file))
      .filter((file) => {
        const source = fs.readFileSync(file, 'utf8');
        return source.includes('stockItem/store/stockItemStore');
      })
      .map((file) => path.relative(root, file));

    expect(violations).toEqual([]);
  });

  it('keeps the receive page on its owned receive store', () => {
    const page = fs.readFileSync(
      path.join(sourceRoot, 'features', 'stockItem', 'pages', 'ScanBarcodeListPage.jsx'),
      'utf8'
    );

    expect(page).toContain(
      '@/features/stockItem/receive/store/useStockItemReceiveStore'
    );
    expect(page).not.toContain('stockItem/store/stockItemStore');
  });
});