import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair intake evidence consent preservation contract', () => {
  it('hydrates every existing consent permission before editing evidence', () => {
    const panel = read('src/features/repair/components/IntakeEvidencePanel.jsx');

    expect(panel).toContain('const draftFromEvidence = (evidence) =>');
    expect(panel).toContain('customerSignature: consent.customerSignature ||');
    expect(panel).toContain('allowDataErase: Boolean(consent.allowDataErase)');
    expect(panel).toContain('allowFactoryReset: Boolean(consent.allowFactoryReset)');
    expect(panel).toContain('allowDisassembly: Boolean(consent.allowDisassembly)');
    expect(panel).toContain('allowOutsourceRepair: Boolean(consent.allowOutsourceRepair)');
    expect(panel).toContain('setDraft(draftFromEvidence(evidence))');
    expect(panel).toContain('onClick={editing ? cancelEdit : beginEdit}');
  });

  it('does not re-sign unchanged consent when staff only adds photos', () => {
    const panel = read('src/features/repair/components/IntakeEvidencePanel.jsx');

    expect(panel).toContain('const consentChanged = (draft, evidence) =>');
    expect(panel).toContain('const shouldWriteConsent = consentChanged(draft, evidence)');
    expect(panel).toContain("? draft\n        : { ...draft, confirmed: false }");
    expect(panel).toContain('draft.photos.length ||');
    expect(panel).toContain('shouldWriteConsent && draft.confirmed && draft.customerSignature.trim()');
    expect(panel).toContain('disabled={loading || !canSave}');
  });

  it('continues to submit explicit permission values through the repair evidence API', () => {
    const api = read('src/features/repair/api/repairApi.js');

    expect(api).toContain("'allowDataErase'");
    expect(api).toContain("'allowFactoryReset'");
    expect(api).toContain("'allowDisassembly'");
    expect(api).toContain("'allowOutsourceRepair'");
    expect(api).toContain("form.append(field, String(evidence[field] ?? ''))");
  });

  it('preserves the pending evidence draft and retries without creating another repair job', () => {
    const page = read('src/features/repair/pages/RepairIntakePage.jsx');
    const detailPage = read('src/features/repair/pages/RepairJobDetailPage.jsx');
    const workspace = read(
      'src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx'
    );
    const panel = read('src/features/repair/components/IntakeEvidencePanel.jsx');

    expect(page).toContain('navigationState.pendingIntakeEvidence = intakeEvidence');
    expect(page).toContain('navigationState.pendingIntakeEvidence = externalEvidence');
    expect(detailPage).toContain('pendingIntakeEvidence={location.state?.pendingIntakeEvidence}');
    expect(workspace).toContain('retryDraft={pendingIntakeEvidence}');
    expect(panel).toContain('const [editing, setEditing] = useState(retryPending)');
    expect(panel).toContain('retryPending ? retryDraft : emptyDraft');
    expect(panel).toContain('กดบันทึกอีกครั้งได้โดยไม่สร้างใบงานซ้ำ');
    expect(panel).toContain("await repairApi.saveIntakeEvidence(repairJobId, payload)");
    expect(panel).not.toContain('createJob(');
  });
});
