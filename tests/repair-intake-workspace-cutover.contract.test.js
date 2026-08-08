import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pageSource = read('src/features/repair/pages/RepairIntakePage.jsx');
const workspaceSource = read(
  'src/features/repair/intake/workspace/components/RepairIntakeWorkspace.jsx'
);
const policySource = read(
  'src/features/repair/intake/workspace/policies/repairIntakePolicy.js'
);

describe('repair intake workspace cutover contract', () => {
  it('composes intake presentation through the workspace owner', () => {
    expect(pageSource).toContain('RepairIntakeWorkspace');
    expect(pageSource).toContain('runtime={workspaceRuntime}');
    expect(pageSource).toContain('onConfirmCreate={createJob}');
    expect(pageSource).toContain('onSubmitExternalIntake={createExternalIntake}');
  });

  it('keeps route, store lifecycle, mutation, and evidence authority in the page', () => {
    expect(pageSource).toContain('useRepairRuntimeStore');
    expect(pageSource).toContain('useNavigate');
    expect(pageSource).toContain('useParams');
    expect(pageSource).toContain('runtime.createJob');
    expect(pageSource).toContain('runtime.createExternalIntake');
    expect(pageSource).toContain('repairApi.saveIntakeEvidence');
    expect(pageSource).toContain('/pos/services/repairs/${created.repairJob.id}');
  });

  it('removes duplicated intake presentation implementation from the page', () => {
    expect(pageSource).not.toContain('RepairShellHeader');
    expect(pageSource).not.toContain('MobileIntakeProgress');
    expect(pageSource).not.toContain('RepairDeviceSearchPanel');
    expect(pageSource).not.toContain('RepairCustomerSection');
    expect(pageSource).not.toContain('CustomerWarrantyAssets');
    expect(pageSource).not.toContain('IntakeProjection');
    expect(pageSource).not.toContain('ExternalDeviceIntakeForm');
  });

  it('keeps workspace presentation free of store, router, lifecycle, api, and mutation authority', () => {
    expect(workspaceSource).not.toContain('useRepairRuntimeStore');
    expect(workspaceSource).not.toContain('react-router-dom');
    expect(workspaceSource).not.toContain('repairApi');
    expect(workspaceSource).not.toContain('useEffect');
    expect(workspaceSource).not.toContain('runtime.createJob');
    expect(workspaceSource).not.toContain('runtime.createExternalIntake');
  });

  it('keeps intake policy pure and reusable after cutover', () => {
    expect(policySource).not.toContain('useRepairRuntimeStore');
    expect(policySource).not.toContain('react');
    expect(policySource).toContain('canSubmitRepairIntake');
    expect(policySource).toContain('buildRepairJobPayload');
    expect(policySource).toContain('getRepairIntakeStatus');
  });
});
