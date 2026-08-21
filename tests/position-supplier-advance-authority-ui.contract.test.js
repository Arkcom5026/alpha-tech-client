import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Supplier advance position authority UI contract', () => {
  it('exposes read, manage and control capabilities in PositionForm', () => {
    const group = read('src/features/position/components/supplierAdvanceCapabilityGroup.js');
    const form = read('src/features/position/components/PositionForm.jsx');

    expect(group).toContain("READ: 'procurement.supplier-advance.read'");
    expect(group).toContain("MANAGE: 'procurement.supplier-advance.manage'");
    expect(group).toContain("CONTROL: 'procurement.supplier-advance.control'");
    expect(group).toContain("key: 'supplier-advance'");
    expect(form).toContain("import { SUPPLIER_ADVANCE_CAPABILITY_GROUP } from './supplierAdvanceCapabilityGroup';");
    expect(form).toContain('SUPPLIER_ADVANCE_CAPABILITY_GROUP,');
  });
});
