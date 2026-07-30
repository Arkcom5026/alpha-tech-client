import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store application UI contract', () => {
  it('preserves the approved application and review surfaces', () => {
    const api = read('src/features/partnerStoreApplication/api/partnerStoreApplicationApi.js');
    const apply = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationPage.jsx');
    const review = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');
    const router = read('src/routes/AppRouter.jsx');
    const superadmin = read('src/routes/superadmin/superAdminRoutes.jsx');

    expect(api).toContain("'/public/partner-store-applications'");
    expect(api).toContain("'/partner-store/applications'");
    expect(api).toContain('/approve');
    expect(api).toContain('/reject');
    expect(apply).toContain('businessAddress');
    expect(apply).toContain('contactPhone');
    expect(apply).toContain('Application received');
    expect(review).toContain('Owner User ID');
    expect(review).toContain('อนุมัติ');
    expect(review).toContain('ปฏิเสธ');
    expect(router).toContain("'partner-portal/apply'");
    expect(superadmin).toContain("'partner-store-applications'");
    expect(apply).not.toContain("'/auth/register'");
  });
});
