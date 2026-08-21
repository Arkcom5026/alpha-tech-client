import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('VAT settlement position authority UI contract', () => {
  it('exposes VAT settlement read capability through PositionForm', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const group = read('src/features/position/components/vatSettlementCapabilityGroup.js');

    expect(group).toContain("READ: 'tax.vat-settlement.read'");
    expect(group).toContain('การเตรียมยอดภาษีมูลค่าเพิ่ม');
    expect(group).toContain('ดูข้อมูลการเตรียมยอด VAT');
    expect(form).toContain("import { VAT_SETTLEMENT_CAPABILITY_GROUP } from './vatSettlementCapabilityGroup'");
    expect(form).toContain('VAT_SETTLEMENT_CAPABILITY_GROUP');
  });
});
