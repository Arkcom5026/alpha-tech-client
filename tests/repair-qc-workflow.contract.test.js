import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair completion and QC workflow contract', () => {
  it('requires a repair completion summary before entering QC', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');

    expect(panel).toContain("run('COMPLETE_REPAIR'");
    expect(panel).toContain('completion.workPerformed.trim()');
    expect(panel).toContain('completion.resultSummary.trim()');
    expect(panel).toContain('ส่งตรวจหลังซ่อม');
  });

  it('uses a visible QC checklist and only allows PASS_QC when every item passes', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');

    expect(panel).toContain('QC_ITEMS');
    expect(panel).toContain("run('PASS_QC'");
    expect(panel).toContain('allQcPassed');
    expect(panel).toContain('QC ผ่าน — พร้อมส่งมอบ');
  });

  it('requires a failure note and provides an explicit rework path', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');

    expect(panel).toContain("run('FAIL_QC'");
    expect(panel).toContain('!qcNote.trim()');
    expect(panel).toContain("run('REWORK_AFTER_QC')");
    expect(panel).toContain('เริ่มแก้งาน');
  });
});
