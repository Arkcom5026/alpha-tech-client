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

  it('requires technician acceptance before repair or inspection becomes available', () => {
    const diagnosisPanel = read('src/features/repair/components/RepairDiagnosisPanel.jsx');
    const runtime = read('src/features/repair/utils/repairRuntime.js');

    expect(runtime).toContain("RECEIVED', label: 'รับเครื่องแล้ว'");
    expect(runtime).toContain("ACCEPTED', label: 'ช่างรับงานแล้ว'");
    expect(diagnosisPanel).toContain('const acceptanceEntry = Boolean(');
    expect(diagnosisPanel).toContain("workflow.status === 'RECEIVED' && actionNames.has('ACCEPT_JOB')");
    expect(diagnosisPanel).toContain("onClick={() => run('ACCEPT_JOB')}");
    expect(diagnosisPanel).toContain('Job Acceptance · Primary Action');
    expect(diagnosisPanel).toContain('ช่างรับงานก่อนดำเนินการ');
    expect(diagnosisPanel).toContain('ยังไม่ใช่การเริ่มซ่อม');
    expect(diagnosisPanel).toContain('รับงาน');

    expect(diagnosisPanel).toContain("workflow.status === 'ACCEPTED'");
    expect(diagnosisPanel).toContain("actionNames.has('START_REPAIR')");
    expect(diagnosisPanel).toContain("onClick={() => run('START_REPAIR')}");
    expect(diagnosisPanel).toContain("actionNames.has('START_PRE_AGREED_SERVICE')");
    expect(diagnosisPanel).toContain("onClick={() => run('START_PRE_AGREED_SERVICE')}");
    expect(diagnosisPanel).toContain('เริ่มซ่อม');
    expect(diagnosisPanel).toContain("actionNames.has('QUEUE_DIAGNOSIS')");
    expect(diagnosisPanel).toContain('หลังรับงานแล้ว เลือกตรวจสอบ');
  });

  it('uses repair authorization without requiring an agreed amount for registered and external intake', () => {
    const intakeWorkspace = read(
      'src/features/repair/intake/workspace/components/RepairIntakeWorkspace.jsx'
    );
    const intakePolicy = read(
      'src/features/repair/intake/workspace/policies/repairIntakePolicy.js'
    );
    const externalIntake = read('src/features/repair/components/ExternalDeviceIntakeForm.jsx');
    const estimatePanel = read(
      'src/features/repair/customer-access/components/RepairEstimateApprovalPanel.jsx'
    );

    for (const source of [intakeWorkspace, externalIntake]) {
      expect(source).toContain('ลูกค้าอนุมัติให้ซ่อม — ไม่ต้องเสนอราคาก่อน');
      expect(source).toContain('confirmedByName');
      expect(source).toContain('ราคาจริงระบุเมื่อซ่อมเสร็จ');
      expect(source).not.toContain('ราคาที่ตกลง *');
      expect(source).not.toContain('ตกลงราคาและขอบเขตงานแล้ว');
    }

    expect(intakePolicy).toContain("authorizationMode: 'REPAIR_AUTHORIZED'");
    expect(intakePolicy).toContain('estimatedCost: Number(draft.estimatedCost || 0)');
    expect(intakePolicy).not.toContain('preAgreedService.agreedAmount || 0');

    expect(estimatePanel).toContain('const hasRepairAuthorization = Boolean(repairAuthorization?.enabled)');
    expect(estimatePanel).toContain('if (hasRepairAuthorization)');
    expect(estimatePanel).toContain('!hasRepairAuthorization');
    expect(estimatePanel).toContain('Repair Authorization');
    expect(estimatePanel).toContain('ลูกค้าอนุมัติให้ซ่อมแล้ว');
    expect(estimatePanel).toContain('ไม่ต้องส่งราคาประเมินก่อนเริ่มงาน และไม่ผูกยอดล่วงหน้า');
    expect(estimatePanel).toContain('ค่าซ่อมจริงจะถูกบันทึกตอนสรุปงานหลังซ่อมเสร็จ');
    expect(estimatePanel).not.toContain('ตกลงราคาแล้ว ไม่ต้องขออนุมัติซ้ำ');
  });

  it('keeps quote-before-repair after technician acceptance as the explicit inspection path', () => {
    const diagnosisPanel = read('src/features/repair/components/RepairDiagnosisPanel.jsx');
    const estimatePanel = read(
      'src/features/repair/customer-access/components/RepairEstimateApprovalPanel.jsx'
    );

    expect(diagnosisPanel).toContain("workflow.status === 'ACCEPTED'");
    expect(diagnosisPanel).toContain('เมื่อลูกค้าต้องการเสนอราคาก่อนซ่อม');
    expect(diagnosisPanel).toContain("run('QUEUE_DIAGNOSIS')");
    expect(diagnosisPanel).toContain('บันทึกผลตรวจและส่งขออนุมัติราคา');
    expect(estimatePanel).toContain('ส่งราคาประเมินให้ลูกค้าอนุมัติ');
    expect(estimatePanel).toContain('ใช้เฉพาะเคสที่ลูกค้าต้องการทราบและอนุมัติราคาก่อนซ่อม');
    expect(estimatePanel).toContain("workflowStatus === 'WAITING_APPROVAL'");
    expect(estimatePanel).toContain('publishEstimateApproval');
  });

  it('surfaces devices previously repaired for the searched customer', () => {
    const searchPanel = read('src/features/repair/components/IntakeSearchPanel.jsx');

    expect(searchPanel).toContain('repairHistoryCount');
    expect(searchPanel).toContain('latestRepairJob');
    expect(searchPanel).toContain('เคยรับซ่อม');
    expect(searchPanel).toContain('มีประวัติซ่อม');
    expect(searchPanel).toContain('รวมอุปกรณ์ที่เคยซื้อจากร้านหรือเคยนำมารับซ่อมกับลูกค้าที่ค้นหา');
    expect(searchPanel).toContain('onSelectDevice(device)');
  });

  it('starts repeat intake from a completed registered device instead of opening old history', () => {
    const intakePage = read('src/features/repair/pages/RepairIntakePage.jsx');
    const runtimeStore = read('src/features/repair/store/repairRuntimeStore.js');
    const intakePolicy = read(
      'src/features/repair/intake/workspace/policies/repairIntakePolicy.js'
    );

    expect(intakePage).toContain("const ACTIVE_REPAIR_STATUSES = new Set(['RECEIVED', 'IN_PROGRESS', 'WAITING_PARTS'])");
    expect(intakePage).toContain("if (device?.sourceType === 'REGISTERED_DEVICE')");
    expect(intakePage).toContain('ACTIVE_REPAIR_STATUSES.has(latestRepair.status)');
    expect(intakePage).toContain('runtime.selectRegisteredDeviceForIntake(device)');
    expect(runtimeStore).toContain('selectRegisteredDeviceForIntake: (device) =>');
    expect(runtimeStore).toContain("sourceType: 'REGISTERED_DEVICE'");
    expect(intakePolicy).toContain("deviceId: registeredDevice ? identity.deviceId || identity.id || '' : ''");
    expect(intakePolicy).toContain('deviceId: draft.deviceId ? Number(draft.deviceId) : null');
  });

  it('captures mandatory intake confirmation for repeat repairs and persists it after job creation', () => {
    const intakePage = read('src/features/repair/pages/RepairIntakePage.jsx');
    const intakeWorkspace = read(
      'src/features/repair/intake/workspace/components/RepairIntakeWorkspace.jsx'
    );

    expect(intakePage).toContain('const [intakeEvidence, setIntakeEvidence]');
    expect(intakePage).toContain('intakeEvidence.confirmed');
    expect(intakePage).toContain('intakeEvidence.customerSignature.trim()');
    expect(intakePage).toContain('await repairApi.saveIntakeEvidence(created.id, intakeEvidence)');
    expect(intakeWorkspace).toContain("import MobileIntakeEvidenceFields from '../../../components/MobileIntakeEvidenceFields'");
    expect(intakeWorkspace).toContain('<MobileIntakeEvidenceFields');
    expect(intakeWorkspace).toContain('value={intakeEvidence}');
    expect(intakeWorkspace).toContain('onChange={onIntakeEvidenceChange}');
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
