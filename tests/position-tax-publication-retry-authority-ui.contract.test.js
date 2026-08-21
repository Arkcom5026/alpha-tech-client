import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('tax publication retry position authority UI contract', () => {
  it('exposes separate publication retry read and execute capabilities through PositionForm', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const group = read('src/features/position/components/taxPublicationRetryCapabilityGroup.js');

    expect(group).toContain("READ: 'tax.publication-retry.read'");
    expect(group).toContain("EXECUTE: 'tax.publication-retry.execute'");
    expect(group).toContain('การเผยแพร่เอกสารภาษีซ้ำ');
    expect(group).toContain('ดูรายการที่เผยแพร่ไม่ครบ');
    expect(group).toContain('สั่งเผยแพร่เอกสารภาษีซ้ำ');
    expect(form).toContain("import { TAX_PUBLICATION_RETRY_CAPABILITY_GROUP } from './taxPublicationRetryCapabilityGroup'");
    expect(form).toContain('TAX_PUBLICATION_RETRY_CAPABILITY_GROUP');
  });
});
