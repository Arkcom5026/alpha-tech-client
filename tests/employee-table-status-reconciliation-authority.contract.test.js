import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve(process.cwd(), 'src/features/employee/components/EmployeeTable.jsx'),
  'utf8',
);

describe('employee table status reconciliation authority', () => {
  it('serializes status mutation synchronously and snapshots intent', () => {
    expect(source).toContain('const toggleRef = useRef(null)');
    expect(source).toContain('employeeIdSnapshot');
    expect(source).toContain('nextActiveSnapshot');
    expect(source).toContain('toggleRef.current = { employeeId: employeeIdSnapshot, operation }');
  });

  it('separates persistence success from list reconciliation failure', () => {
    expect(source).toContain('const refresh = await onRefresh()');
    expect(source).toContain('refresh?.ok === false && !refresh?.stale');
    expect(source).toContain('อัปเดตสถานะพนักงานสำเร็จแล้ว แต่รีเฟรชรายการล่าสุดไม่สำเร็จ');
    expect(source).toContain('list-${operation}:refresh:error');
  });

  it('uses entity-scoped operation feedback and freezes adjacent edit navigation', () => {
    expect(source).toContain('employee:${employeeIdSnapshot}:list-${operation}:success');
    expect(source).toContain('employee:${employeeIdSnapshot}:list-${operation}:error');
    expect(source).toContain("toggling ? 'pointer-events-none opacity-50' : ''");
  });
});
