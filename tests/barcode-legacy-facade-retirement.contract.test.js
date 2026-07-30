import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
};

describe('barcode legacy facade retirement contract', () => {
  it('requires the Barcode store to consume slice public boundaries directly', () => {
    const store = read('src/features/barcode/store/barcodeStore.js');

    expect(store).not.toContain("from '../api/barcodeApi'");

    for (const boundary of [
      "from '../generation'",
      "from '../receipt-detail'",
      "from '../receipt-listing'",
      "from '../scan-listing'",
      "from '../serial'",
      "from '../print-reprint'",
    ]) {
      expect(store).toContain(boundary);
    }
  });

  it('prevents retired Barcode compatibility files from returning', () => {
    for (const retiredFile of [
      'src/features/barcode/api/barcodeApi.js',
      'src/features/barcode/runtime/generationCompatibilityAdapter.js',
    ]) {
      expect(fs.existsSync(path.join(root, retiredFile))).toBe(false);
    }
  });

  it('prevents source consumers from importing the retired Barcode facade', () => {
    const sourceFiles = walkFiles(path.join(root, 'src')).filter((file) => /\.[cm]?[jt]sx?$/.test(file));
    const forbiddenTokens = [
      '@/features/barcode/api/barcodeApi',
      '/features/barcode/api/barcodeApi',
      "from '../api/barcodeApi'",
      "from './api/barcodeApi'",
    ];

    for (const file of sourceFiles) {
      const source = fs.readFileSync(file, 'utf8');
      for (const token of forbiddenTokens) {
        expect(source, `${path.relative(root, file)} must not reference ${token}`).not.toContain(token);
      }
    }
  });
});
