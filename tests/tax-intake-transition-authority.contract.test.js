import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Tax Intake transition authority', () => {
  it('serializes transition and issuance while preserving mutation success across refresh failure', () => {
    const controller = read('src/features/tax/intake/hooks/useTaxIntakeWorkspaceController.js');

    expect(controller).toContain('const transitionRef = useRef(false)');
    expect(controller).toContain('transitioning || transitionRef.current');
    expect(controller).toContain('const taxDocumentId = selectedDocument?.id');
    expect(controller).toContain('const refreshAfterMutation = useCallback(async (taxDocumentId, successMessage) => {');
    expect(controller).toContain("toast.warning('ดำเนินการสำเร็จแล้ว แต่โหลดรายละเอียดเอกสารล่าสุดไม่สำเร็จ')");
    expect(controller).toContain('transitionRef.current = true');
    expect(controller).toContain('transitionRef.current = false');
  });
});
