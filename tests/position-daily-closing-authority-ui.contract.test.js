import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Daily closing position authority UI contract', () => {
  it('exposes daily closing read capability in PositionForm', () => {
    const group = read('src/features/position/components/dailyClosingCapabilityGroup.js');
    const form = read('src/features/position/components/PositionForm.jsx');

    expect(group).toContain("READ: 'finance.daily-closing.read'");
    expect(group).toContain("key: 'daily-closing'");
    expect(form).toContain("import { DAILY_CLOSING_CAPABILITY_GROUP } from './dailyClosingCapabilityGroup';");
    expect(form).toContain('DAILY_CLOSING_CAPABILITY_GROUP,');
  });
});
