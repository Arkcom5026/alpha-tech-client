import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('withholding tax position authority UI contract', () => {
  it('exposes separated withholding tax capabilities through PositionForm', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const group = read('src/features/position/components/withholdingTaxCapabilityGroup.js');

    expect(group).toContain("READ: 'tax.withholding.read'");
    expect(group).toContain("TREATMENT: 'tax.withholding.treatment'");
    expect(group).toContain("CERTIFICATE_ISSUE: 'tax.withholding.certificate.issue'");
    expect(group).toContain("FILING_PREPARE: 'tax.withholding.filing.prepare'");
    expect(group).toContain("FILING_SUBMIT: 'tax.withholding.filing.submit'");
    expect(group).toContain('ภาษีหัก ณ ที่จ่าย');
    expect(group).toContain('ออกหนังสือรับรองหัก ณ ที่จ่าย');
    expect(group).toContain('ยืนยันการยื่นแบบ ภ.ง.ด.');
    expect(form).toContain("import { WITHHOLDING_TAX_CAPABILITY_GROUP } from './withholdingTaxCapabilityGroup'");
    expect(form).toContain('WITHHOLDING_TAX_CAPABILITY_GROUP');
  });
});
