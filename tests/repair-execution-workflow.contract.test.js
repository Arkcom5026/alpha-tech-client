import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair execution workflow contract', () => {
  it('guides approved jobs into repair and supports wait/resume actions', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');

    expect(panel).toContain("actionNames.has('START_REPAIR')");
    expect(panel).toContain("run('START_REPAIR')");
    expect(panel).toContain("run('WAIT_FOR_PARTS')");
    expect(panel).toContain("run('RESUME_REPAIR')");
    expect(panel).toContain("expectedWorkflowStatus: status");
  });

  it('uses product search instead of asking staff for a Product ID', () => {
    const api = read('src/features/repair/api/repairApi.js');
    const execution = read('src/features/repair/components/RepairExecutionPanel.jsx');
    const runtime = read('src/features/repair/components/JobRuntimePanel.jsx');

    expect(api).toContain("'/products/pos/search'");
    expect(execution).toContain('searchPartProducts');
    expect(execution).toContain('ค้นหาอะไหล่');
    expect(execution).toContain('เบิกและบันทึกอะไหล่');
    expect(runtime).not.toContain('placeholder="Product ID"');
  });

  it('places part consumption inside the REPAIRING stage only', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

    expect(panel).toContain("status === 'REPAIRING'");
    expect(panel).toContain('onAddPart({ productId: id, qtyUsed: Number(qtyUsed) })');
    expect(workspace).toContain('<RepairExecutionPanel');
    expect(workspace).toContain('onAddPart={onAddPart}');
  });
});
