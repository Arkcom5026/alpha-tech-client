import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildRepairJobPayload,
  canSubmitRepairIntake,
  createRepairIntakeDraft,
  emptyRepairIntakeContact,
  getRepairIntakeStatus,
  projectRepairIntakeContact,
} from '../src/features/repair/intake/workspace/policies/repairIntakePolicy.js';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pageSource = read('src/features/repair/pages/RepairIntakePage.jsx');
const workspaceSource = read(
  'src/features/repair/intake/workspace/components/RepairIntakeWorkspace.jsx'
);
const policySource = read(
  'src/features/repair/intake/workspace/policies/repairIntakePolicy.js'
);

describe('repair intake workspace foundation contract', () => {
  it('keeps intake projection policy pure and runtime-independent', () => {
    expect(policySource).not.toContain('react');
    expect(policySource).not.toContain('useRepairRuntimeStore');
    expect(policySource).not.toContain('react-router-dom');
    expect(policySource).not.toContain('repairApi');
  });

  it('preserves draft, contact, payload, and submit semantics', () => {
    const intakeContext = {
      identity: { id: 22, serialNumber: 'SN-22', product: { name: 'Notebook 22' } },
    };
    const draft = createRepairIntakeDraft({ customerId: 7, intakeContext });
    expect(draft.customerId).toBe(7);
    expect(draft.stockItemId).toBe(22);
    expect(draft.deviceModel).toBe('Notebook 22');

    const contact = projectRepairIntakeContact(
      { name: 'Kanjana', phone: '0800000000', email: 'k@example.com' },
      emptyRepairIntakeContact
    );
    expect(contact.contactName).toBe('Kanjana');
    expect(contact.contactRelationship).toBe('เจ้าของอุปกรณ์');

    const readyDraft = { ...draft, reportedSymptoms: 'เปิดไม่ติด', depositPaid: '500' };
    expect(
      canSubmitRepairIntake({ draft: readyDraft, intakeContact: contact, submitting: false })
    ).toBe(true);
    expect(buildRepairJobPayload({ draft: readyDraft, intakeContact: contact })).toMatchObject({
      customerId: 7,
      stockItemId: 22,
      depositPaid: 500,
      deviceModel: 'Notebook 22',
    });
  });

  it('preserves intake status projection', () => {
    expect(getRepairIntakeStatus({ externalMode: true })).toBe('EXTERNAL');
    expect(getRepairIntakeStatus({ intakeNotFound: true })).toBe('NOT_FOUND');
    expect(getRepairIntakeStatus({ intakeContext: { identity: { id: 1 } } })).toBe('DEVICE_SELECTED');
    expect(getRepairIntakeStatus({})).toBe('WAITING');
  });

  it('keeps workspace presentation free of store, router, lifecycle, and api authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('repairApi');
    expect(workspaceSource).not.toContain('navigate(');
  });

  it('preserves customer, device, external intake, evidence-adjacent, and create intents through props before cutover', () => {
    expect(workspaceSource).toContain('RepairDeviceSearchPanel');
    expect(workspaceSource).toContain('RepairCustomerSection');
    expect(workspaceSource).toContain('CustomerWarrantyAssets');
    expect(workspaceSource).toContain('ExternalDeviceIntakeForm');
    expect(workspaceSource).toContain('IntakeProjection');
    expect(workspaceSource).toContain('RepairIntakeContactForm');
    expect(workspaceSource).toContain('onSubmit={onSubmitExternalIntake}');
    expect(workspaceSource).toContain('onClick={onConfirmCreate}');
    expect(workspaceSource).toContain('onRetry={onRetry}');

    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('runtime.createJob');
    expect(pageSource).toContain('runtime.createExternalIntake');
    expect(pageSource).toContain('repairApi.saveIntakeEvidence');
  });
});
