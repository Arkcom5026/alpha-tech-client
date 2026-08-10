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

    expect(diagnosisPanel).toContain('ขั้นตรวจสอบ');
    expect(diagnosisPanel).toContain('บันทึกผลตรวจสอบ');
    expect(runtime).toContain("WAITING_DIAGNOSIS', label: 'รอตรวจสอบ'");
    expect(runtime).toContain("DIAGNOSING', label: 'กำลังตรวจสอบ'");
    expect(workflowOverview).not.toContain('กลับไปวินิจฉัย');

    expect(diagnosisPanel).toContain("run('COMPLETE_DIAGNOSIS'");
    expect(diagnosisPanel).toContain("run('START_DIAGNOSIS'");
  });

  it('offers an optional pre-agreed path for both registered and external-device intake', () => {
    const intakeWorkspace = read(
      'src/features/repair/intake/workspace/components/RepairIntakeWorkspace.jsx'
    );
    const intakePolicy = read(
      'src/features/repair/intake/workspace/policies/repairIntakePolicy.js'
    );
    const externalIntake = read('src/features/repair/components/ExternalDeviceIntakeForm.jsx');

    for (const source of [intakeWorkspace, externalIntake]) {
      expect(source).toContain('ตกลงราคาและขอบเขตงานแล้ว');
      expect(source).toContain('agreedScope');
      expect(source).toContain('agreedAmount');
      expect(source).toContain('confirmedByName');
      expect(source).toContain('confirmationNote');
    }

    expect(intakePolicy).toContain('preAgreedService');
    expect(intakePolicy).toContain('estimatedCost: preAgreedService');
    expect(externalIntake).toContain('preAgreedService: agreement');
    expect(externalIntake).toContain('agreement.agreedAmount');
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
