import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store employee onboarding UI contract', () => {
  it('uses the canonical employee API boundary and aligned validation policy', () => {
    const manager = read('src/features/auth/components/SubEmployeeManager.jsx');
    const employeeApi = read('src/features/employee/api/employeeApi.js');

    expect(employeeApi).toContain("apiClient.post('/auth/add-sub-employee', data)");
    expect(manager).toContain('createOnboardedEmployee(payload)');
    expect(manager).not.toContain("apiClient.post('/auth/add-sub-employee', payload)");
    expect(manager).toContain('EMAIL_PATTERN.test(payload.email)');
    expect(manager).toContain('กรุณากรอกอีเมลสำหรับเข้าสู่ระบบให้ถูกต้อง');
    expect(manager).toContain('payload.password.length < 8');
    expect(manager).toContain('รหัสผ่านเริ่มต้นต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
    expect(manager).toContain('อย่างน้อย 8 ตัวอักษร');
    expect(manager).toContain('<option value="CASHIER">');
    expect(manager).toContain('<option value="MANAGER">');
    expect(manager).not.toContain('branchId:');
  });
});
