import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store employee onboarding UI contract', () => {
  it('uses position as primary authority while preserving v2Role compatibility only for legacy positions', () => {
    const manager = read('src/features/auth/components/SubEmployeeManager.jsx');
    const employeeApi = read('src/features/employee/api/employeeApi.js');

    expect(employeeApi).toContain("apiClient.post('/auth/add-sub-employee', data)");
    expect(manager).toContain('createOnboardedEmployee(payload)');
    expect(manager).not.toContain("apiClient.post('/auth/add-sub-employee', payload)");
    expect(manager).toContain('EMAIL_PATTERN.test(payload.email)');
    expect(manager).toContain('payload.password.length < 8');
    expect(manager).toContain('const usesPositionAuthority = Array.isArray(selectedPosition?.capabilities)');
    expect(manager).toContain("...(!usesPositionAuthority ? { v2Role: form.v2Role } : {})");
    expect(manager).toContain('สิทธิ์มาจากตำแหน่งงาน');
    expect(manager).toContain('สิทธิ์ระบบเดิม (ชั่วคราว)');
    expect(manager).toContain('ตำแหน่งที่ย้ายแล้วไม่ต้องเลือกบทบาทซ้ำ');
    expect(manager).not.toContain("['บทบาทในร้าน', roleDetails[createdEmployee.v2Role]");
    expect(manager).not.toContain('branchId:');
  });
});
