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

  it('makes ready-for-delivery primary while keeping QC as an optional completion path', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');

    expect(panel).toContain("run('COMPLETE_REPAIR_DIRECT'");
    expect(panel).toContain("run('COMPLETE_REPAIR'");
    expect(panel).toContain('งานเสร็จ — พร้อมส่งมอบ');
    expect(panel).toContain('ตรวจหลังซ่อมก่อนส่งมอบ');
    expect(panel).toContain('QC เป็นตัวเลือกเสริม');
    expect(panel).toContain("actionNames.has('COMPLETE_REPAIR_DIRECT')");
    expect(panel).toContain("actionNames.has('COMPLETE_REPAIR')");
  });

  it('requires the final repair amount at completion instead of binding price at intake', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');
    const runtime = read('src/features/repair/components/JobRuntimePanel.jsx');

    expect(panel).toContain("finalAmount: ''");
    expect(panel).toContain('ค่าซ่อมจริง *');
    expect(panel).toContain('ยอดนี้เป็นราคาสุดท้ายสำหรับการส่งมอบ');
    expect(panel).toContain('finalAmount: Number(completion.finalAmount)');
    expect(panel).toContain("completion.finalAmount !== ''");

    expect(runtime).toContain("FINAL_PRICE_ACTIONS = new Set(['COMPLETE_REPAIR', 'COMPLETE_REPAIR_DIRECT'])");
    expect(runtime).toContain('hasFinalRepairAmount');
    expect(runtime).toContain("hasFinalRepairAmount ? 'ค่าซ่อมจริง' : 'ราคาประเมิน'");
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

  it('places quantity and serialized part consumption inside the REPAIRING stage only', () => {
    const panel = read('src/features/repair/components/RepairExecutionPanel.jsx');
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

    expect(panel).toContain("status === 'REPAIRING'");
    expect(panel).toContain('qtyUsed: serialized ? 1 : Number(qtyUsed)');
    expect(panel).toContain('stockItemId: Number(selectedStockItem.id)');
    expect(workspace).toContain('<RepairExecutionPanel');
    expect(workspace).toContain('onAddPart={onAddPart}');
  });
});
