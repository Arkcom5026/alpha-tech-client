import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('position-first employee authority UI contract', () => {
  it('makes position the capability configuration surface without removing compatibility yet', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const createWorkspace = read('src/features/position/workspace/CreatePositionWorkspace.jsx');
    const editWorkspace = read('src/features/position/workspace/EditPositionWorkspace.jsx');

    expect(form).toContain("const EMPLOYEE_MANAGE_CAPABILITY = 'employee.manage'");
    expect(form).toContain('สิทธิ์ของตำแหน่งงาน');
    expect(form).toContain('เริ่มใช้สิทธิ์จากตำแหน่งนี้');
    expect(form).toContain('v2Role จะคงไว้เป็นชั้นรองรับของระบบเดิมระหว่างการย้าย');
    expect(form).toContain('payload.capabilities = capabilities');

    expect(createWorkspace).toContain("capabilities: Array.isArray(payload?.capabilities) ? payload.capabilities : []");
    expect(createWorkspace).toContain("initialValues={{ name: '', description: '', capabilities: [] }}");

    expect(editWorkspace).toContain('if (Array.isArray(payload?.capabilities))');
    expect(editWorkspace).toContain('capabilities: Array.isArray(current?.capabilities) ? current.capabilities : null');
  });
});
