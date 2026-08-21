import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Quotation position authority UI contract', () => {
  it('exposes the four quotation capabilities in PositionForm', () => {
    const group = read('src/features/position/components/quotationCapabilityGroup.js');
    const form = read('src/features/position/components/PositionForm.jsx');

    expect(group).toMatch(/READ:\s*'quotation\.read'/);
    expect(group).toMatch(/MANAGE:\s*'quotation\.manage'/);
    expect(group).toMatch(/ISSUE:\s*'quotation\.issue'/);
    expect(group).toMatch(/LIFECYCLE:\s*'quotation\.lifecycle'/);
    expect(group).toMatch(/title:\s*'ใบเสนอราคา'/);

    expect(form).toMatch(/quotationCapabilityGroup/);
    expect(form).toMatch(/QUOTATION_CAPABILITY_GROUP/);
    expect(form).toMatch(/\.\.\.CAPABILITY_GROUPS,\s*QUOTATION_CAPABILITY_GROUP,/s);
  });
});
