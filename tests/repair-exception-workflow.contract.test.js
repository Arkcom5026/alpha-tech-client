import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair exceptional workflow contract', () => {
  it('shows current next action and workflow history before operational panels', () => {
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');
    const overview = read('src/features/repair/components/RepairWorkflowOverview.jsx');

    expect(workspace).toContain('<RepairWorkflowOverview');
    expect(workspace.indexOf('<RepairWorkflowOverview')).toBeLessThan(workspace.indexOf('<RepairDiagnosisPanel'));
    expect(overview).toContain('สิ่งที่ควรทำถัดไป');
    expect(overview).toContain('ประวัติการดำเนินงาน');
    expect(overview).toContain('workflow.nextAction');
    expect(overview).toContain('workflow.history');
  });

  it('requires cancellation reason and explicit confirmation', () => {
    const overview = read('src/features/repair/components/RepairWorkflowOverview.jsx');

    expect(overview).toContain("actionNames.has('CANCEL')");
    expect(overview).toContain('!cancelReason.trim()');
    expect(overview).toContain("window.confirm('ยืนยันยกเลิกใบงานนี้?')");
    expect(overview).toContain("run('CANCEL', cancelReason)");
  });

  it('lets rejected quotations return to diagnosis through a controlled recovery action', () => {
    const overview = read('src/features/repair/components/RepairWorkflowOverview.jsx');

    expect(overview).toContain("status === 'REJECTED'");
    expect(overview).toContain("actionNames.has('REOPEN_AFTER_REJECTION')");
    expect(overview).toContain('!reopenReason.trim()');
    expect(overview).toContain("run('REOPEN_AFTER_REJECTION', reopenReason)");
  });
});
