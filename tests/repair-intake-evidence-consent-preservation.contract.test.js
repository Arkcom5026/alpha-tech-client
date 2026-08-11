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

  it('continues to submit explicit permission values through the repair evidence API', () => {
    const api = read('src/features/repair/api/repairApi.js');

    expect(api).toContain("'allowDataErase'");
    expect(api).toContain("'allowFactoryReset'");
    expect(api).toContain("'allowDisassembly'");
    expect(api).toContain("'allowOutsourceRepair'");
    expect(api).toContain("form.append(field, String(evidence[field] ?? ''))");
  });
});
