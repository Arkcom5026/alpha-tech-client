import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store application UI contract', () => {
  it('supports self-contained merchant application and approval', () => {
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
    expect(apply).toContain('password');
    expect(apply).toContain('confirmPassword');
    expect(apply).toContain('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
    expect(apply).toContain('Application received');
    expect(review).not.toContain('Owner User ID');
    expect(review).toContain('อนุมัติและเปิดร้าน');
    expect(review).toContain('ปฏิเสธ');
    expect(router).toContain("'partner-portal/apply'");
    expect(superadmin).toContain("'partner-store-applications'");
    expect(apply).not.toContain("'/auth/register'");
  });
});
