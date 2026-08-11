import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair flexible intake workflow contract', () => {
  it('uses ตรวจสอบ as the customer-facing and staff-facing wording while keeping internal diagnosis contracts stable', () => {
    const diagnosisPanel = read('src/features/repair/components/RepairDiagnosisPanel.jsx');
    const runtime = read('src/features/repair/utils/repairRuntime.js');
    const workflowOverview = read('src/features/repair/components/RepairWorkflowOverview.jsx');
    const detailWorkspace = read(
      'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
    );

    expect(diagnosisPanel).toContain('ขั้นตรวจสอบ');
    expect(diagnosisPanel).toContain('บันทึกผลตรวจสอบ');
    expect(diagnosisPanel).not.toContain('วินิจฉัย');
    expect(runtime).toContain("WAITING_DIAGNOSIS', label: 'รอตรวจสอบ'");
    expect(runtime).toContain("DIAGNOSING', label: 'กำลังตรวจสอบ'");
    expect(workflowOverview).not.toContain('กลับไปวินิจฉัย');
    expect(detailWorkspace).toContain('ตั้งแต่ตรวจสอบจนถึงส่งมอบ');
    expect(detailWorkspace).not.toContain('วินิจฉัย');

    expect(diagnosisPanel).toContain("run('COMPLETE_DIAGNOSIS'");
    expect(diagnosisPanel).toContain("run('START_DIAGNOSIS'");
  });

  it('offers an optional pre-agreed path for both registered and external-device intake and exposes it on the job detail', () => {
    const intakeWorkspace = read(
      'src/features/repair/intake/workspace/components/RepairIntakeWorkspace.jsx'
    );
    const intakePolicy = read(
      'src/features/repair/intake/workspace/policies/repairIntakePolicy.js'
    );
    const intakePage = read('src/features/repair/pages/RepairIntakePage.jsx');
    const externalIntake = read('src/features/repair/components/ExternalDeviceIntakeForm.jsx');
    const diagnosisPanel = read('src/features/repair/components/RepairDiagnosisPanel.jsx');
    const estimatePanel = read(
      'src/features/repair/customer-access/components/RepairEstimateApprovalPanel.jsx'
    );

    for (const source of [intakeWorkspace, externalIntake]) {
      expect(source).toContain('ตกลงราคาและขอบเขตงานแล้ว');
      expect(source).toContain('agreedScope');
      expect(source).toContain('agreedAmount');
      expect(source).toContain('confirmedByName');
      expect(source).toContain('confirmationNote');
    }

    expect(intakePolicy).toContain('preAgreedService');
    expect(intakePolicy).toContain("if (!draft?.preAgreedService?.enabled) return true");
    expect(intakePolicy).toContain('estimatedCost: preAgreedService');
    expect(intakePage).toContain('buildRepairJobPayload({ draft, intakeContact })');
    expect(intakePage).toContain('runtime.createExternalIntake(intakePayload)');
    expect(externalIntake).toContain('preAgreedService: agreement');
    expect(externalIntake).toContain('agreement.agreedAmount');

    expect(diagnosisPanel).toContain("actionNames.has('START_PRE_AGREED_SERVICE')");
    expect(diagnosisPanel).toContain('preAgreedService?.enabled');
    expect(diagnosisPanel).toContain("run('START_PRE_AGREED_SERVICE')");
    expect(diagnosisPanel).toContain('workflow.preAgreedService');
    expect(diagnosisPanel).toContain('ใช้ราคาที่ตกลงและไปขั้นเริ่มงาน');
    expect(diagnosisPanel).toContain("actionNames.has('QUEUE_DIAGNOSIS')");

    expect(estimatePanel).toContain("event.action === 'START_PRE_AGREED_SERVICE'");
    expect(estimatePanel).toContain('ตกลงราคาแล้ว ไม่ต้องขออนุมัติซ้ำ');
    expect(estimatePanel).toContain('ใช้ Fast Path แล้ว — ไม่ต้องส่งราคาประเมินให้ลูกค้าอนุมัติอีกครั้ง');
    expect(estimatePanel).toContain('preAgreedService.agreedAmount || job?.estimatedCost');
    expect(estimatePanel).toContain('!preAgreedWasUsed');
  });

  it('prefills the external intake confirmer from the selected customer without removing edit authority', () => {
    const externalIntake = read('src/features/repair/components/ExternalDeviceIntakeForm.jsx');
    const evidenceFields = read('src/features/repair/components/MobileIntakeEvidenceFields.jsx');

    expect(externalIntake).toContain("const defaultCustomerSignature = customer?.name || customer?.companyName || ''");
    expect(externalIntake).toContain('customerSignature: defaultCustomerSignature');
    expect(externalIntake).toContain('current.customerSignature.trim()');
    expect(evidenceFields).toContain("onChange={(event) => patch('customerSignature', event.target.value)}");
    expect(evidenceFields).toContain('ลูกค้าหรือผู้ส่งมอบพิมพ์ชื่อเพื่อยืนยัน');
  });

  it('prefills pickup receiver name from the repair customer projection while still allowing edits', () => {
    const pickup = read(
      'src/features/repair/customer-tracking/components/PickupConfirmationCard.jsx'
    );
    const trackingPage = read(
      'src/features/repair/customer-tracking/pages/CustomerRepairTrackingPage.jsx'
    );

    expect(pickup).toContain("defaultReceiverName = ''");
    expect(pickup).toContain('receiverName: defaultReceiverName');
    expect(pickup).toContain('ระบบเติมชื่อผู้ส่งซ่อมเป็นค่าเริ่มต้น');
    expect(pickup).toContain('onChange={(e) => setForm');
    expect(trackingPage).toContain("defaultReceiverName={repair.pickupDefaults?.receiverName || ''}");
  });
});
