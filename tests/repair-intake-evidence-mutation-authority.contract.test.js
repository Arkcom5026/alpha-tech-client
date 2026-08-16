import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Repair intake evidence mutation authority', () => {
  it('owns save synchronously and snapshots the persistent command', () => {
    const source = read('src/features/repair/components/IntakeEvidencePanel.jsx');

    expect(source).toContain('const savingRef = useRef(false)');
    expect(source).toContain('if (loading || saving || savingRef.current || !canSave) return');
    expect(source).toContain('const repairJobIdSnapshot = repairJobId');
    expect(source).toContain('const draftSnapshot = { ...draft, photos: [...draft.photos] }');
    expect(source).toContain('const shouldWriteConsentSnapshot = consentChanged(draftSnapshot, evidence)');
    expect(source).toContain('savingRef.current = true');
    expect(source).toContain('savingRef.current = false');
  });

  it('keeps server success distinct from parent refresh failure', () => {
    const source = read('src/features/repair/components/IntakeEvidencePanel.jsx');

    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('`repair:intake-evidence:${repairJobIdSnapshot}:save:success`');
    expect(source).toContain('feedback.actionError');
    expect(source).toContain('บันทึกหลักฐานสำเร็จแล้ว แต่ยังรีเฟรชข้อมูลใบงานไม่สำเร็จ');
    expect(source).toContain('`repair:intake-evidence:${repairJobIdSnapshot}:refresh:error`');
  });

  it('freezes conflicting editing controls while save owns the boundary', () => {
    const source = read('src/features/repair/components/IntakeEvidencePanel.jsx');

    expect(source).toContain('const interactionLocked = loading || saving');
    expect(source).toContain('if (interactionLocked) return');
    expect(source).toContain('disabled={interactionLocked}');
    expect(source).toContain('<fieldset disabled={interactionLocked}');
    expect(source).toContain("saving ? 'กำลังบันทึก...' : 'บันทึกหลักฐานดิจิทัล'");
  });
});
