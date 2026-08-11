import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair subcontract workflow contract', () => {
  it('exposes send, update and command API boundaries', () => {
    const api = read('src/features/repair/api/repairApi.js');

    expect(api).toContain('getSubcontractContext');
    expect(api).toContain('sendSubcontract');
    expect(api).toContain('updateSubcontract');
    expect(api).toContain('commandSubcontract');
    expect(api).toContain('/subcontracts');
    expect(api).toContain('/commands');
    expect(api).not.toContain('EXACT_PRICE');
    expect(api).not.toContain('MAX_BUDGET');
  });

  it('keeps external pricing flexible instead of forcing a hard price mode', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');

    expect(panel).toContain('ราคาที่แจ้งลูกค้าโดยประมาณ');
    expect(panel).toContain('ราคาที่ซับนอกแจ้งล่าสุด');
    expect(panel).toContain('ข้อตกลง/หมายเหตุที่คุยกับลูกค้า');
    expect(panel).toContain('ไม่บังคับว่าราคาต้องเป็นเพดานหรือตายตัว');
    expect(panel).toContain('ลูกค้าตกลงให้ทำต่อ / ขอคิดก่อน / ไม่ซ่อม ขอเครื่องกลับ');
    expect(panel).not.toContain('EXACT_PRICE');
    expect(panel).not.toContain('MAX_BUDGET');
  });

  it('normalizes browser local expected-return timestamps before sending them to the API', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');

    expect(panel).toContain('const toIsoOrNull = (value) => (value ? new Date(value).toISOString() : null)');
    expect(panel).toContain('expectedReturnAt: toIsoOrNull(sendForm.expectedReturnAt)');
    expect(panel).toContain('expectedReturnAt: toIsoOrNull(updateForm.expectedReturnAt)');
  });

  it('requires outsource consent before the send button is enabled', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');

    expect(panel).toContain('const outsourceConsent = Boolean(context?.outsourceConsent)');
    expect(panel).toContain('!outsourceConsent');
    expect(panel).toContain('ลูกค้ายังไม่ได้อนุญาตให้ส่งซ่อมภายนอก');
    expect(panel).toContain('disabled={loading || !outsourceConsent');
  });

  it('quick-creates a required ExpensePayee without leaving the repair job and auto-selects it', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');
    const dialog = read('src/features/repair/components/ExpensePayeeQuickCreateDialog.jsx');

    expect(panel).toContain('ExpensePayeeQuickCreateDialog');
    expect(panel).toContain('+ เพิ่มผู้รับซ่อม');
    expect(panel).toContain('setQuickCreateOpen(true)');
    expect(panel).toContain('expensePayeeId: String(created.id)');
    expect(panel).toContain('created.phone');
    expect(dialog).toContain('createExpensePayee');
    expect(dialog).toContain('เลขผู้เสียภาษีไม่บังคับ');
    expect(dialog).toContain('บันทึกและเลือกผู้รับซ่อม');
    expect(dialog).toContain("payeeType: 'INDIVIDUAL'");
  });

  it('refreshes outsource authority immediately after intake evidence is updated', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');
    const workspace = read(
      'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
    );
    const evidence = read('src/features/repair/components/IntakeEvidencePanel.jsx');

    expect(panel).toContain('refreshKey = 0');
    expect(panel).toContain('[load, refreshKey]');
    expect(workspace).toContain('const [evidenceRevision, setEvidenceRevision] = useState(0)');
    expect(workspace).toContain('refreshKey={evidenceRevision}');
    expect(workspace).toContain('onSaved={handleEvidenceSaved}');
    expect(evidence).toContain('await onSaved?.(saved)');
  });

  it('holds internal repair execution, claim and handover panels while custody is outside', () => {
    const workspace = read(
      'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
    );

    expect(workspace).toContain('const subcontractActive = Boolean(job?.workflow?.subcontractContext?.active)');
    expect(workspace).toContain('<RepairSubcontractPanel');
    expect(workspace).toContain('onChanged={onRetry}');
    expect(workspace).toContain('!subcontractActive');
    expect(workspace).toContain('<RepairExecutionPanel');
    expect(workspace).toContain('<RepairClaimHandoffPanel');
    expect(workspace).toContain('<RepairHandoverPanel');
  });

  it('releases the UI hold only after staff confirms the physical device returned', () => {
    const panel = read('src/features/repair/components/RepairSubcontractPanel.jsx');

    expect(panel).toContain("action: 'RECEIVE_RETURN'");
    expect(panel).toContain('ยืนยันเฉพาะเมื่ออุปกรณ์กลับถึงร้านจริง');
    expect(panel).toContain('ระบบปลดการพักใบงานและสามารถดำเนิน Repair Workflow ต่อได้');
  });
});
