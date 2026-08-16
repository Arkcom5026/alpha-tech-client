import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('retired operational status header runtime contract', () => {
  it('keeps the operational verification API isolated from the POS header runtime', () => {
    const api = read('src/features/system/operational-status/api/operationalStatusApi.js');
    const component = read('src/features/system/operational-status/components/OperationalStatusBadge.jsx');

    expect(api).toContain("apiClient.get('/system/operational-verification')");
    expect(component).toContain('const OperationalStatusBadge = () => null');
    expect(component).not.toContain('getOperationalVerification');
    expect(component).not.toContain('useEffect');
    expect(component).not.toContain('loadStatus');
  });

  it('cannot issue a background request even if the legacy HeaderPos composition remains mounted', () => {
    const header = read('src/features/pos/components/header/HeaderPos.jsx');
    const component = read('src/features/system/operational-status/components/OperationalStatusBadge.jsx');

    expect(header).toContain('<OperationalStatusBadge enabled={canViewOperationalStatus} />');
    expect(component.trim()).toBe(
      'const OperationalStatusBadge = () => null;\n\nexport default OperationalStatusBadge;'
    );
  });
});
