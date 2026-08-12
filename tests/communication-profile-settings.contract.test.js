import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('branch communication profile settings', () => {
  it('uses branch-scoped communication APIs and previews configured QR data', () => {
    const page = read('src/features/communication/pages/CommunicationProfileSettingsPage.jsx');
    expect(page).toContain('listCommunicationProfiles');
    expect(page).toContain('saveCommunicationProfile');
    expect(page).toContain('draft.qrPayload.trim() || draft.publicUri.trim() || draft.address.trim()');
    expect(page).toContain("['LINE', 'FACEBOOK', 'PHONE', 'SMS', 'EMAIL', 'OTHER']");
  });

  it('is reachable from settings routes and navigation', () => {
    expect(read('src/routes/partner/posPartnerRoutes.jsx')).toContain("path: 'communication'");
    expect(read('src/config/sidebarSettingsItems.js')).toContain('/settings/communication');
    expect(read('src/features/settings/workspaces/SettingsDashboardWorkspace.jsx')).toContain('/pos/settings/communication');
  });

  it('requires the dedicated manage communication capability', () => {
    const page = read('src/features/communication/pages/CommunicationProfileSettingsPage.jsx');
    const rbac = read('src/features/auth/rbac/rbacClient.js');
    expect(rbac).toContain("MANAGE_COMMUNICATION: 'manageCommunication'");
    expect(page).toContain('canManageCommunicationSelector');
    expect(page).toContain('disabled={!canManage}');
  });
});
