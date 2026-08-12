import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('optional repair communication intake contract', () => {
  it('defaults to no communication channel and remains provider-neutral', () => {
    const source = read('src/features/repair/components/RepairCommunicationPreferenceFields.jsx');
    expect(source).toContain("channelType: ''");
    expect(source).toContain('<option value="">ไม่ระบุ</option>');
    expect(source).toContain("['LINE', 'LINE']");
    expect(source).not.toMatch(/line-sdk|facebook-sdk|sendMessage/i);
  });

  it('persists communication only after the repair job exists', () => {
    const source = read('src/features/repair/pages/RepairIntakePage.jsx');
    expect(source.indexOf('await runtime.createJob')).toBeLessThan(source.indexOf('await persistCommunicationPreference'));
    expect(source).toContain('if (!preference?.channelType) return;');
    expect(source).toContain('navigationState.communicationWarning = error.message');
    expect(source).toContain('saveRepairCommunicationPreference');
  });

  it('shows a non-blocking warning on the committed repair job', () => {
    const page = read('src/features/repair/pages/RepairJobDetailPage.jsx');
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');
    expect(page).toContain('communicationWarning={location.state?.communicationWarning}');
    expect(workspace).toContain('เปิดงานซ่อมสำเร็จ แต่ยังบันทึกช่องทางติดต่อไม่ได้');
  });

  it('reuses branch profiles, QR rendering and the existing mobile scanner', () => {
    const fields = read('src/features/repair/components/RepairCommunicationPreferenceFields.jsx');
    const page = read('src/features/repair/pages/RepairIntakePage.jsx');
    expect(fields).toContain("import QRCode from 'react-qr-code'");
    expect(fields).toContain("import MobileDeviceScanner from './MobileDeviceScanner'");
    expect(fields).toContain('profile.qrPayload || profile.publicUri || profile.address');
    expect(fields).toContain('สแกน QR ลูกค้า');
    expect(page).toContain('listCommunicationProfiles()');
    expect(page).toContain('profileId: preference.profileId || null');
    expect(page).toContain('setCommunicationProfilesWarning(error.message)');
  });
});
