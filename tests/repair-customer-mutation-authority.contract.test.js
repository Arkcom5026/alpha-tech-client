import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Repair customer mutation authority', () => {
  it('serializes customer create/update and emits ADS action outcomes', () => {
    const source = read('src/features/repair/components/RepairCustomerSection.jsx');

    expect(source).toContain("import { feedback } from '@/design-system'");
    expect(source).toContain('const mutationRef = useRef(false)');
    expect(source).toContain('if (mutationRef.current) return');
    expect(source).toContain('const payloadSnapshot = {');
    expect(source).toContain("setMutationAction('create')");
    expect(source).toContain("setMutationAction('update')");
    expect(source).toContain("`repair:customer:${created.id}:create:success`");
    expect(source).toContain("'repair:customer:create:error'");
    expect(source).toContain("`repair:customer:${customerIdSnapshot}:update:success`");
    expect(source).toContain("`repair:customer:${customerIdSnapshot}:update:error`");
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
  });

  it('freezes conflicting customer controls and exposes mutation progress', () => {
    const source = read('src/features/repair/components/RepairCustomerSection.jsx');

    expect(source).toContain('const mutationBusy = Boolean(mutationAction) || mutationRef.current');
    expect(source).toContain('disabled={mutationBusy}');
    expect(source).toContain('disabled={updateMode || mutationBusy}');
    expect(source).toContain("mutationAction === 'update'");
    expect(source).toContain("'กำลังบันทึก...'");
    expect(source).toContain("mutationAction === 'create'");
    expect(source).toContain("'กำลังบันทึกลูกค้า...'");
  });
});
