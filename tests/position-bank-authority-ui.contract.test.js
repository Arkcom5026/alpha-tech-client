import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Bank position authority UI contract', () => {
  it('exposes read, manage and delete capabilities in PositionForm', () => {
    const group = read('src/features/position/components/bankCapabilityGroup.js');
    const form = read('src/features/position/components/PositionForm.jsx');

    expect(group).toContain("READ: 'finance.bank.read'");
    expect(group).toContain("MANAGE: 'finance.bank.manage'");
    expect(group).toContain("DELETE: 'finance.bank.delete'");
    expect(group).toContain("key: 'bank'");
    expect(form).toContain("import { BANK_CAPABILITY_GROUP } from './bankCapabilityGroup';");
    expect(form).toContain('BANK_CAPABILITY_GROUP,');
  });
});
