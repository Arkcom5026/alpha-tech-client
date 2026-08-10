import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair diagnosis workflow contract', () => {
  it('uses workflow commands instead of free-form repair status selection', () => {
    const api = read('src/features/repair/api/repairApi.js');
    const page = read('src/features/repair/pages/RepairJobDetailPage.jsx');
    const diagnosis = read('src/features/repair/components/RepairDiagnosisPanel.jsx');
    const runtime = read('src/features/repair/components/JobRuntimePanel.jsx');

    expect(api).toContain('/workflow/commands');
    expect(page).toContain('transitionWorkflow');
    expect(diagnosis).toContain('expectedWorkflowStatus: workflow.status');
    expect(runtime).toContain('สถานะถูกควบคุมด้วย Repair Workflow');
    expect(runtime).not.toContain('เลือกสถานะถัดไป');
  });

  it('requires diagnosis evidence before completing diagnosis', () => {
    const panel = read('src/features/repair/components/RepairDiagnosisPanel.jsx');

    expect(panel).toContain("run('COMPLETE_DIAGNOSIS'");
    expect(panel).toContain('diagnosis.findings.trim()');
    expect(panel).toContain('diagnosis.recommendedAction.trim()');
    expect(panel).toContain('บันทึกผลตรวจและส่งขออนุมัติราคา');
  });

  it('renders persisted diagnosis independently from the current workflow action', () => {
    const panel = read('src/features/repair/components/RepairDiagnosisPanel.jsx');

    expect(panel).toContain('const existingDiagnosis = workflow.diagnosis');
    expect(panel).toContain('existingDiagnosis.findings');
    expect(panel).toContain('existingDiagnosis.recommendedAction');
    expect(panel).toContain('existingDiagnosis.estimatedCost');
  });

  it('opens estimate publishing only in WAITING_APPROVAL and explains the resulting handoff', () => {
    const approvalPanel = read(
      'src/features/repair/customer-access/components/RepairEstimateApprovalPanel.jsx'
    );

    expect(approvalPanel).toContain("workflowStatus === 'WAITING_APPROVAL'");
    expect(approvalPanel).toContain('canPublish');
    expect(approvalPanel).toContain('อัปเดต workflow ให้อัตโนมัติ');
    expect(approvalPanel).toContain('ลูกค้าอนุมัติราคาแล้ว ขั้นถัดไปคือเริ่มงานซ่อม');
    expect(approvalPanel).toContain('ลูกค้าไม่อนุมัติราคา งานนี้จะไม่เข้าสู่ขั้นซ่อม');
  });
});
