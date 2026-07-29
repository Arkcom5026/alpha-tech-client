import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('operational status badge contract', () => {
  it('owns the protected endpoint in the operational status feature', () => {
    const api = read('src/features/system/operational-status/api/operationalStatusApi.js');
    expect(api).toContain("apiClient.get('/system/operational-verification')");
  });

  it('loads once when enabled and supports manual refresh', () => {
    const component = read('src/features/system/operational-status/components/OperationalStatusBadge.jsx');
    expect(component).toContain('useEffect(() =>');
    expect(component).toContain('if (enabled) loadStatus();');
    expect(component).toContain('onClick={loadStatus}');
    expect(component).not.toContain('setInterval');
  });

  it('is composed in HeaderPos only for ADMIN or SUPERADMIN', () => {
    const header = read('src/features/pos/components/header/HeaderPos.jsx');
    expect(header).toContain("normalizedRole === 'superadmin'");
    expect(header).toContain("normalizedRole === 'admin'");
    expect(header).toContain('canViewOperationalStatus');
    expect(header).toContain('<OperationalStatusBadge enabled={canViewOperationalStatus} />');
  });

  it('keeps failures non-blocking and visible', () => {
    const component = read('src/features/system/operational-status/components/OperationalStatusBadge.jsx');
    expect(component).toContain("setStatus('FAILED')");
    expect(component).toContain('ไม่สามารถตรวจสอบความพร้อมของระบบได้');
  });
});
