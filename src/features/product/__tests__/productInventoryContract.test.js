import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('Product SIMPLE inventory contract', () => {
  it('wires authority fields through create and edit forms', () => {
    const form = read('src/features/product/components/ProductForm.jsx');
    const create = read('src/features/product/create/hooks/useProductCreateRuntimeController.js');
    const inventory = read('src/features/product/create/components/ProductCreateInventorySection.jsx');
    expect(form).toContain('inventoryBehavior');
    expect(form).toContain('saleBarcode');
    expect(create).toContain('inventoryBehavior:');
    expect(create).toContain('saleBarcode:');
    expect(inventory).toContain("onChange?.('inventoryBehavior', 'TRACKED')");
    expect(inventory).toContain("onChange?.('saleBarcode', '')");
  });
});
