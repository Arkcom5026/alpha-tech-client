import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Finance receivables position authority UI contract', () => {
  it('exposes finance receivables read capability in PositionForm', () => {
    const groupSource = read('src/features/position/components/financeReceivablesCapabilityGroup.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("READ: 'finance.receivables.read'");
    expect(groupSource).toContain("key: 'finance-receivables'");
    expect(formSource).toContain("import { FINANCE_RECEIVABLES_CAPABILITY_GROUP } from './financeReceivablesCapabilityGroup';");
    expect(formSource).toContain('FINANCE_RECEIVABLES_CAPABILITY_GROUP,');
  });
});
