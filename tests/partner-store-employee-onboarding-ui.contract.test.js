import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store employee onboarding UI contract', () => {
  it('uses the canonical employee endpoint and aligned password policy', () => {
    const manager = read('src/features/auth/components/SubEmployeeManager.jsx');

    expect(manager).toContain("apiClient.post('/auth/add-sub-employee', payload)");
    expect(manager).toContain('payload.password.length < 8');
    expect(manager).toContain('รหัสผ่านเริ่มต้นต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
    expect(manager).toContain('อย่างน้อย 8 ตัวอักษร');
    expect(manager).toContain('<option value="CASHIER">');
    expect(manager).toContain('<option value="MANAGER">');
    expect(manager).not.toContain('branchId:');
  });
});
