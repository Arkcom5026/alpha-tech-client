import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Supplier payable position authority UI contract', () => {
  it('exposes read, manage and control capabilities in PositionForm', () => {
    const group = read('src/features/position/components/supplierPayableCapabilityGroup.js');
    const form = read('src/features/position/components/PositionForm.jsx');

    expect(group).toContain("READ: 'procurement.supplier-payable.read'");
    expect(group).toContain("MANAGE: 'procurement.supplier-payable.manage'");
    expect(group).toContain("CONTROL: 'procurement.supplier-payable.control'");
    expect(group).toContain("key: 'supplier-payable'");
    expect(form).toContain("import { SUPPLIER_PAYABLE_CAPABILITY_GROUP } from './supplierPayableCapabilityGroup';");
    expect(form).toContain('SUPPLIER_PAYABLE_CAPABILITY_GROUP,');
  });
});
