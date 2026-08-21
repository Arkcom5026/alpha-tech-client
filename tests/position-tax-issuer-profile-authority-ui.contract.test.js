import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('tax issuer profile position authority UI contract', () => {
  it('exposes separate issuer profile read and manage capabilities through PositionForm', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const group = read('src/features/position/components/taxIssuerProfileCapabilityGroup.js');

    expect(group).toContain("READ: 'tax.issuer-profile.read'");
    expect(group).toContain("MANAGE: 'tax.issuer-profile.manage'");
    expect(group).toContain('ข้อมูลผู้ออกเอกสารภาษี');
    expect(group).toContain('ดูข้อมูลผู้ออกเอกสารภาษี');
    expect(group).toContain('แก้ไขข้อมูลผู้ออกเอกสารภาษี');
    expect(form).toContain("import { TAX_ISSUER_PROFILE_CAPABILITY_GROUP } from './taxIssuerProfileCapabilityGroup'");
    expect(form).toContain('TAX_ISSUER_PROFILE_CAPABILITY_GROUP');
  });
});
