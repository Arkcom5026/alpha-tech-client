import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('VAT carry-forward position authority UI contract', () => {
  it('exposes separate VAT carry-forward read and confirm capabilities through PositionForm', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const group = read('src/features/position/components/vatCarryForwardCapabilityGroup.js');

    expect(group).toContain("READ: 'tax.vat-carry-forward.read'");
    expect(group).toContain("CONFIRM: 'tax.vat-carry-forward.confirm'");
    expect(group).toContain('ภาษีมูลค่าเพิ่มยกไปงวดถัดไป');
    expect(group).toContain('ดูข้อมูล VAT ยกไป');
    expect(group).toContain('ยืนยันยอด VAT ยกไป');
    expect(form).toContain("import { VAT_CARRY_FORWARD_CAPABILITY_GROUP } from './vatCarryForwardCapabilityGroup'");
    expect(form).toContain('VAT_CARRY_FORWARD_CAPABILITY_GROUP');
  });
});
