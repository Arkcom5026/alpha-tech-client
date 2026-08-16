import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Repair handover compound mutation authority', () => {
  it('owns finalize/close synchronously and freezes the payload snapshot', () => {
    const source = read('src/features/repair/components/RepairHandoverPanel.jsx');

    expect(source).toContain("import { feedback } from '@/design-system'");
    expect(source).toContain('const savingRef = useRef(false)');
    expect(source).toContain('if (state.saving || savingRef.current) return');
    expect(source).toContain('const repairJobIdSnapshot = repairJobId');
    expect(source).toContain('const formSnapshot = { ...form }');
    expect(source).toContain('savingRef.current = true');
    expect(source).toContain('repairApi.finalizeHandover(repairJobIdSnapshot');
  });

  it('distinguishes full success from close/refresh partial success', () => {
    const source = read('src/features/repair/components/RepairHandoverPanel.jsx');

    expect(source).toContain("`repair:handover:${repairJobIdSnapshot}:finalize-close:success`");
    expect(source).toContain("`repair:handover:${repairJobIdSnapshot}:close-after-finalize:error`");
    expect(source).toContain("`repair:handover:${repairJobIdSnapshot}:refresh:error`");
    expect(source).toContain("`repair:handover:${repairJobIdSnapshot}:finalize:error`");
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
    expect(source).toContain('ส่งมอบเครื่องสำเร็จแล้ว แต่รีเฟรชใบงานล่าสุดไม่สำเร็จ');
  });

  it('keeps conflicting form controls frozen while the compound mutation runs', () => {
    const source = read('src/features/repair/components/RepairHandoverPanel.jsx');

    expect(source).toContain('disabled={state.saving}');
    expect(source).toContain("state.saving ? 'กำลังส่งมอบและปิดงาน...' : 'ส่งมอบและปิดงาน'");
  });
});
