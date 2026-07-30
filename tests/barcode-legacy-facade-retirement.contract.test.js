import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

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

  it('prevents the generation compatibility adapter from returning after retirement', () => {
    expect(
      fs.existsSync(path.join(root, 'src/features/barcode/runtime/generationCompatibilityAdapter.js'))
    ).toBe(false);
  });
});
